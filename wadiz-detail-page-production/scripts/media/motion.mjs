import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import { assertId, escapeHtml, execFileAsync, localFile, sha256, writeJson } from './common.mjs';
import { importGeneratedImage } from './image-backends.mjs';

export async function inspectGif(file) {
  const buffer = Buffer.isBuffer(file) ? file : await fs.readFile(file);
  const meta = await sharp(buffer, { animated: true }).metadata();
  if (meta.format !== 'gif') throw new Error('Motion output must be a GIF');
  const { data, info } = await sharp(buffer, { animated: true }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const pages = meta.pages ?? 1, frameHeight = meta.pageHeight ?? meta.height;
  const frameBytes = info.width * frameHeight * info.channels;
  const hashes = Array.from({ length: pages }, (_, i) => sha256(data.subarray(i * frameBytes, (i + 1) * frameBytes)));
  return {
    width: meta.width, height: frameHeight, frames: pages, bytes: buffer.length,
    loop: meta.loop, delay_ms: meta.delay ?? [], distinct_frames: new Set(hashes).size,
    animated: pages >= 2 && new Set(hashes).size >= 2,
    loop_join_identical: pages >= 2 && hashes[0] === hashes.at(-1), sha256: sha256(buffer),
  };
}

export async function buildMotionCut(config, { baseDir = process.cwd(), outDir = path.join(baseDir, 'motion'), ffmpeg = 'ffmpeg', ffprobe = 'ffprobe', run = execFileAsync } = {}) {
  const id = assertId(config.id ?? 'motion-01');
  const sourceType = config.source_type;
  if (!['actual_footage', 'verified_images', 'generated_explainer'].includes(sourceType)) throw new Error('source_type must be actual_footage, verified_images or generated_explainer');
  if (config.purpose === 'performance-proof' && (sourceType !== 'actual_footage' || !config.footage)) throw new Error('Performance proof requires actual_footage');
  if (sourceType === 'actual_footage' && !config.footage) throw new Error('actual_footage requires a video file');
  if (config.footage && sourceType !== 'actual_footage') throw new Error('Video input must be declared actual_footage');
  if (!config.footage && (!Array.isArray(config.frames) || config.frames.length < 2)) throw new Error('At least two image frames are required');
  if (config.frames && config.footage) throw new Error('Choose image frames or footage');
  const width = Number(config.width ?? 1080), fps = Number(config.fps ?? 12), seconds = Number(config.duration_seconds ?? 3), maxBytes = Number(config.max_bytes ?? 8_000_000);
  if (!Number.isInteger(width) || width < 32 || width > 3840 || !Number.isFinite(fps) || fps < 1 || fps > 30 || !Number.isFinite(seconds) || seconds < 0.2 || seconds > 15 || !Number.isSafeInteger(maxBytes) || maxBytes < 100) throw new Error('Invalid motion dimensions, duration, fps or byte cap');
  const inputs = config.footage ? [await localFile(baseDir, config.footage)] : await Promise.all(config.frames.map((f) => localFile(baseDir, typeof f === 'string' ? f : f.file ?? f.path)));
  if (sourceType === 'generated_explainer') {
    if (!Array.isArray(config.frame_results) || config.frame_results.length !== inputs.length) throw new Error('Generated GIF frames require GPT Image 2.5 frame result provenance');
    for (let i = 0; i < inputs.length; i++) {
      const result = config.frame_results[i];
      if (await localFile(baseDir, result.file) !== inputs[i]) throw new Error('Generated frame provenance path mismatch');
      if (!result.prepared_job) throw new Error('Generated frames require their approved prepared jobs');
      await importGeneratedImage(result.prepared_job, result, { baseDir });
    }
  }
  if (!config.footage) {
    const inputBuffers = await Promise.all(inputs.map((f) => fs.readFile(f)));
    const sizes = await Promise.all(inputBuffers.map((buffer) => sharp(buffer).metadata()));
    if (sizes.some((s) => s.width !== sizes[0].width || s.height !== sizes[0].height)) throw new Error('Image frames must have matching dimensions');
    if (sizes.some((s) => (s.pages ?? 1) !== 1)) throw new Error('Image frame inputs must be static');
    if (new Set(await Promise.all(inputBuffers.map(async (buffer) => sha256(await sharp(buffer).raw().toBuffer())))).size < 2) throw new Error('Frames contain no visual motion');
  }
  await fs.mkdir(outDir, { recursive: true });
  const names = [`${id}.gif`, `${id}.poster.png`, `${id}.preview.html`, `${id}.motion-meta.json`];
  for (const name of names) if (await fs.stat(path.join(outDir, name)).catch(() => null)) throw new Error(`Output already exists: ${name}`);
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'wadiz-motion-'));
  try {
    let inputArgs;
    if (config.footage) {
      const { stdout } = await run(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', inputs[0]], { timeout: 30_000, windowsHide: true });
      const probe = JSON.parse(stdout);
      if (!probe.streams?.[0]?.width || Number(probe.format?.duration) < 0.2) throw new Error('No usable video stream');
      inputArgs = ['-t', String(seconds), '-i', inputs[0]];
    } else {
      // A ping-pong sequence closes image loops without an abrupt last-to-first jump.
      const order = [...inputs, ...inputs.slice(0, -1).reverse()];
      for (let i = 0; i < order.length; i++) await sharp(await fs.readFile(order[i])).png().toFile(path.join(temp, `frame-${String(i).padStart(4, '0')}.png`));
      inputArgs = ['-framerate', String(order.length / seconds), '-i', path.join(temp, 'frame-%04d.png')];
    }
    let verified, selected;
    for (const [rate, colors] of [[fps, 256], [Math.max(4, Math.min(fps, 8)), 128], [Math.max(2, Math.min(fps, 6)), 64]]) {
      const candidate = path.join(temp, 'candidate.gif');
      // Image loops keep their original frame cadence, including the closing frame.
      const filter = `${config.footage ? `fps=${rate},` : ''}scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=${colors}:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a`;
      await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...inputArgs, '-filter_complex_threads', '1', '-filter_complex', filter, '-loop', '0', candidate], { timeout: 60_000, windowsHide: true, maxBuffer: 1024 * 1024 });
      verified = await inspectGif(candidate);
      if (!verified.animated) throw new Error('GIF has no distinct moving frames');
      if (verified.width !== width || verified.loop !== 0) throw new Error('GIF dimensions or infinite loop verification failed');
      if (verified.bytes <= maxBytes) { selected = { fps: config.footage ? rate : (inputs.length * 2 - 1) / seconds, colors }; break; }
    }
    if (!selected) throw new Error(`GIF exceeds byte cap ${maxBytes}`);
    const gifFile = path.join(outDir, names[0]), posterFile = path.join(outDir, names[1]);
    await sharp(await fs.readFile(path.join(temp, 'candidate.gif')), { page: 0, pages: 1 }).png().toFile(path.join(temp, 'poster.png'));
    const metadata = {
      schema_version: 1, id, source_type: sourceType, truth_level: sourceType === 'generated_explainer' ? 'generated_concept' : sourceType,
      purpose: config.purpose ?? 'explainer', inputs: await Promise.all(inputs.map(async (f) => ({ file: path.relative(baseDir, f).replaceAll('\\', '/'), sha256: sha256(await fs.readFile(f)) }))),
      ...(sourceType === 'generated_explainer' ? { frame_provenance: config.frame_results.map((result) => ({ backend: result.backend, model_requested: result.model_requested, input_refs: result.input_refs ?? [], provenance: result.provenance })) } : {}),
      output: names[0], poster: names[1], preview: names[2], encoding: selected,
      qa: { ...verified, size_within_cap: true, max_bytes: maxBytes, visual_reviewed: false, loop_reviewed: false, product_identity_reviewed: false },
      note: config.footage ? 'Loop boundary requires visual review; actual footage declaration is not a performance claim verification.' : 'Ping-pong loop; visual and product identity review required.',
    };
    await fs.copyFile(path.join(temp, 'candidate.gif'), gifFile);
    await fs.copyFile(path.join(temp, 'poster.png'), posterFile);
    await fs.writeFile(path.join(outDir, names[2]), `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(id)} GIF 검수</title><style>body{margin:0 auto;max-width:1080px;font-family:sans-serif}img{width:100%;height:auto}</style><h1>${escapeHtml(id)}</h1><p>${escapeHtml(metadata.truth_level)} · ${verified.frames} frames · ${verified.bytes} bytes</p><img src="./${names[0]}" alt="${escapeHtml(config.description ?? id)}"><p><a href="./${names[1]}">정지 대체 이미지</a></p></html>`, 'utf8');
    await writeJson(path.join(outDir, names[3]), metadata);
    return metadata;
  } finally { await fs.rm(temp, { recursive: true, force: true }); }
}
