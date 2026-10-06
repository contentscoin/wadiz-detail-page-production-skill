import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';
import { sha256, escapeHtml, localFile, readJson } from '../media/common.mjs';
import { isImage25, verifyImageProvenance } from '../media/image-backends.mjs';
import { validateProject } from '../validate-page-plan.mjs';

const FIELDS = ['headline', 'subcopy', 'body', 'footnote', 'cta'];
const FONT_CANDIDATES = [
  ['C:/Windows/Fonts/malgun.ttf', 'Malgun Gothic'],
  ['C:/Windows/Fonts/NotoSansKR-VF.ttf', 'Noto Sans KR'],
  ['/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', 'Noto Sans CJK KR'],
  ['/usr/share/fonts/truetype/noto/NotoSansKR-Regular.ttf', 'Noto Sans KR'],
  ['/System/Library/Fonts/AppleSDGothicNeo.ttc', 'Apple SD Gothic Neo'],
];
const integer = (value, name, min, max) => {
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${name} must be an integer ${min}..${max}`);
  return value;
};

// Inspect the selected font's actual cmap: silently drawing .notdef boxes is not
// a successful Korean text render. Supports normal OpenType and TTC collections.
function glyphLookup(bytes) {
  const base = bytes.toString('ascii', 0, 4) === 'ttcf' ? bytes.readUInt32BE(12) : 0;
  const tables = bytes.readUInt16BE(base + 4);
  let cmap;
  for (let i = 0; i < tables; i++) {
    const p = base + 12 + i * 16;
    if (bytes.toString('ascii', p, p + 4) === 'cmap') cmap = bytes.readUInt32BE(p + 8);
  }
  if (cmap === undefined) throw new Error('Selected font has no Unicode cmap');
  const maps = [];
  for (let i = 0; i < bytes.readUInt16BE(cmap + 2); i++) {
    const p = cmap + 4 + i * 8, platform = bytes.readUInt16BE(p), encoding = bytes.readUInt16BE(p + 2);
    if (platform !== 0 && !(platform === 3 && [1, 10].includes(encoding))) continue;
    const offset = cmap + bytes.readUInt32BE(p + 4), format = bytes.readUInt16BE(offset);
    if ([4, 12].includes(format)) maps.push({ offset, format });
  }
  if (!maps.length) throw new Error('Selected font requires a supported Unicode cmap (format 4 or 12)');
  return (codepoint) => {
    for (const { offset: p, format } of maps) {
      if (format === 12) {
        const count = bytes.readUInt32BE(p + 12);
        for (let i = 0; i < count; i++) {
          const group = p + 16 + i * 12, start = bytes.readUInt32BE(group), end = bytes.readUInt32BE(group + 4);
          if (codepoint >= start && codepoint <= end) return bytes.readUInt32BE(group + 8) + codepoint - start;
        }
      } else if (codepoint <= 0xffff) {
        const count = bytes.readUInt16BE(p + 6) / 2, end = p + 14, start = end + count * 2 + 2, delta = start + count * 2, ranges = delta + count * 2;
        for (let i = 0; i < count; i++) {
          if (codepoint < bytes.readUInt16BE(start + i * 2) || codepoint > bytes.readUInt16BE(end + i * 2)) continue;
          const adjustment = bytes.readInt16BE(delta + i * 2), range = bytes.readUInt16BE(ranges + i * 2);
          if (!range) return (codepoint + adjustment) & 0xffff;
          const address = ranges + i * 2 + range + (codepoint - bytes.readUInt16BE(start + i * 2)) * 2;
          const glyph = bytes.readUInt16BE(address);
          return glyph ? (glyph + adjustment) & 0xffff : 0;
        }
      }
    }
    return 0;
  };
}

async function fontFor(options) {
  const candidate = options.font_file ? [path.resolve(options.font_file), options.font_family] : await (async () => {
    for (const entry of FONT_CANDIDATES) if (await fs.stat(entry[0]).catch(() => null)) return entry;
    return null;
  })();
  if (!candidate || typeof candidate[1] !== 'string' || !candidate[1].trim()) throw new Error('A Korean-capable font file/family is required; provide --font-file and --font-family');
  const bytes = await fs.readFile(candidate[0]), hash = sha256(bytes);
  if (options.font_sha256 && options.font_sha256 !== hash) throw new Error('Composition font changed since review');
  return { file: candidate[0], family: candidate[1], sha256: hash, glyph: glyphLookup(bytes) };
}

function copyText(copy, field) {
  const value = copy[field];
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.every((line) => typeof line === 'string')) return value.join('\n');
  throw new Error(`copy.${field} must contain exact text`);
}

export async function buildCopySvg(copy, options = {}) {
  if (!copy || typeof copy !== 'object' || Array.isArray(copy)) throw new Error('Section copy is required');
  const width = integer(options.width ?? 1080, 'width', 720, 2160), height = integer(options.height ?? 1600, 'height', 600, 6000);
  const imageHeight = integer(options.image_height ?? Math.round(height * 0.5), 'image_height', 100, height - 200);
  const padding = integer(options.padding ?? Math.round(width * 64 / 1080), 'padding', 24, Math.floor(width / 4));
  const minSize = Math.ceil(24 * width / 1080);
  const sizes = Object.fromEntries(FIELDS.map((field) => [field, integer(options.sizes?.[field] ?? Math.ceil(({ headline: 56, subcopy: 34, body: 30, footnote: 24, cta: 34 })[field] * width / 1080), `${field} font size`, minSize, 120)]));
  const lineGap = integer(options.line_gap ?? Math.round(width * 8 / 1080), 'line_gap', 0, 80);
  const fieldGap = integer(options.field_gap ?? Math.round(width * 24 / 1080), 'field_gap', 0, 120);
  const color = options.color ?? '#202020', background = options.background ?? '#ffffff';
  if (![color, background].every((value) => /^#[0-9a-f]{6}$/i.test(value))) throw new Error('Composition colors must be six-digit hex values');
  const font = await fontFor(options);
  const fontOptions = { fontFiles: [font.file], loadSystemFonts: false, defaultFontFamily: font.family };
  const cache = new Map(), available = width - padding * 2, lines = [];
  const measure = (text, size) => {
    const key = `${size}:${text}`;
    if (cache.has(key)) return cache.get(key);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="8192" height="512"><text x="32" y="256" xml:space="preserve" font-family="${escapeHtml(font.family)}" font-size="${size}">${escapeHtml(text)}</text></svg>`;
    const bbox = new Resvg(svg, { font: fontOptions }).getBBox();
    if (text.trim() && (!bbox || bbox.width <= 0 || bbox.height <= 0)) throw new Error('Font did not render the requested glyphs');
    const measured = bbox ? { width: Math.max(bbox.x + bbox.width - 32, bbox.width), height: bbox.height, top: bbox.y - 256 } : { width: 0, height: 0, top: 0 };
    cache.set(key, measured); return measured;
  };
  let baseline = padding;
  for (const field of FIELDS) {
    const text = copyText(copy, field);
    if (!text.trim()) continue;
    if (/\[(?:자료 필요|선택|이미지 생성 실패)[^\]]*\]/.test(text)) throw new Error(`Unresolved copy placeholder: ${field}`);
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text)) throw new Error(`Unsupported control character: ${field}`);
    for (const character of text) if (!/[\s\u200d\ufe0f]/u.test(character) && !font.glyph(character.codePointAt(0))) throw new Error(`Font lacks glyph U+${character.codePointAt(0).toString(16).toUpperCase()}`);
    const size = sizes[field], lineHeight = Math.ceil(size * 1.4) + lineGap;
    baseline += size;
    for (const paragraph of text.replace(/\r\n/g, '\n').split('\n')) {
      if (!paragraph.length) { baseline += lineHeight; continue; }
      let line = '';
      const emit = () => {
        const metrics = measure(line, size);
        if (metrics.width > available + 0.01 || baseline + Math.max(0, metrics.top + metrics.height) > height - imageHeight - padding) throw new Error(`Text panel overflow in ${field}; shorten copy or increase height`);
        lines.push({ field, text: line, x: padding, y: baseline, font_size: size });
        baseline += lineHeight; line = '';
      };
      for (const character of paragraph) {
        if (line && measure(line + character, size).width > available) emit();
        line += character;
        if (measure(line, size).width > available) throw new Error(`Glyph exceeds text panel width in ${field}`);
      }
      emit();
    }
    baseline += fieldGap;
  }
  if (!lines.length) throw new Error('No approved copy to compose');
  const panelHeight = height - imageHeight, copyHash = sha256(Buffer.from(JSON.stringify(copy)));
  const layout = { width, height, image_height: imageHeight, padding, sizes, line_gap: lineGap, field_gap: fieldGap, color, background, font_file: font.file, font_family: font.family, font_sha256: font.sha256 };
  const text = lines.map((line) => `<text x="${line.x}" y="${line.y}" font-size="${line.font_size}" xml:space="preserve">${escapeHtml(line.text)}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${panelHeight}" viewBox="0 0 ${width} ${panelHeight}"><metadata>${escapeHtml(JSON.stringify({ copy_sha256: copyHash, copy }))}</metadata><rect width="100%" height="100%" fill="${background}"/><g fill="${color}" font-family="${escapeHtml(font.family)}">${text}</g></svg>`;
  const renderer = new Resvg(svg, { font: fontOptions });
  const rendered = renderer.render();
  if (rendered.width !== width || rendered.height !== panelHeight) throw new Error('Rendered text panel dimensions differ');
  return { svg, png: rendered.asPng(), layout, lines, copy_sha256: copyHash };
}

export async function composeMediaText(projectDir, { outFile, ...options } = {}) {
  const root = path.resolve(projectDir);
  if (!outFile) throw new Error('A new results file is required');
  const output = path.resolve(outFile), mediaDir = path.join(path.dirname(output), `${path.basename(output, path.extname(output))}.composition`);
  if (await fs.stat(output).catch(() => null) || await fs.stat(mediaDir).catch(() => null)) throw new Error('Composition output already exists; choose a new results file');
  const validation = await validateProject(root);
  if (validation.status !== 'draft_valid' || validation.errors.length) throw new Error('Page plan must pass copy/source checks before composition');
  const plan = await readJson(path.join(root, 'page-plan.json')), document = await readJson(path.join(root, 'media-results.json'));
  if (document.schema_version !== 1 || !Array.isArray(document.results)) throw new Error('media-results.json schema_version:1 is required');
  const results = new Map();
  for (const result of document.results) { if (results.has(result.job_id)) throw new Error(`Duplicate media result: ${result.job_id}`); results.set(result.job_id, result); }
  const replacements = new Map(), artifacts = [];
  for (const section of plan.sections) {
    if (!['hybrid', 'svg_layer'].includes(section.text_render_mode)) continue;
    const result = results.get(section.media_job_id);
    if (!result || result.status !== 'complete') throw new Error(`Missing completed media: ${section.media_job_id}`);
    if (result.kind === 'gif') continue;
    if (result.kind !== 'image' || result.composition) throw new Error(`Expected uncomposed static image: ${result.job_id}`);
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(section.id)) throw new Error('Invalid section id');
    const baseFile = await localFile(root, result.file), base = await fs.readFile(baseFile), baseHash = sha256(base), metadata = await sharp(base).metadata();
    if (!['png', 'jpeg', 'webp'].includes(metadata.format) || (metadata.pages ?? 1) > 1) throw new Error('Composition requires a decoded static image');
    if (result.truth_level === 'generated_concept') {
      const verified = verifyImageProvenance({ backend: result.backend, model_requested: result.model_requested, input_refs: result.input_refs ?? [] }, result.provenance);
      if (!isImage25(result.model_requested) || !verified.verified || result.provenance?.output_sha256 !== baseHash) throw new Error('Base generation provenance/hash does not match');
    }
    const panel = await buildCopySvg(section.copy, options);
    const image = await sharp(base).resize(panel.layout.width, panel.layout.image_height, { fit: 'contain', background: panel.layout.background }).png().toBuffer();
    const composite = await sharp({ create: { width: panel.layout.width, height: panel.layout.height, channels: 4, background: panel.layout.background } }).composite([{ input: image, top: 0, left: 0 }, { input: panel.png, top: panel.layout.image_height, left: 0 }]).png().toBuffer();
    const imageFile = path.join(mediaDir, `${section.id}.png`), textFile = path.join(mediaDir, `${section.id}.text.svg`);
    artifacts.push({ file: imageFile, bytes: composite }, { file: textFile, bytes: Buffer.from(panel.svg) });
    const composition = { type: 'deterministic_text', base_file: result.file, base_sha256: baseHash, output_sha256: sha256(composite), copy_sha256: panel.copy_sha256, text_file: path.relative(root, textFile), text_sha256: sha256(Buffer.from(panel.svg)), layout: panel.layout, ...(result.provenance ? { source_provenance: result.provenance } : {}) };
    replacements.set(result.job_id, { ...result, file: path.relative(root, imageFile), composition, qa: { ...result.qa, review_binding: null, copy_reviewed: false, visual_reviewed: false, product_identity_reviewed: false, width: panel.layout.width, height: panel.layout.height, bytes: composite.length, sha256: composition.output_sha256, text_composition: 'measured_glyphs_and_bounds' } });
  }
  if (!replacements.size) throw new Error('No image sections with hybrid/svg_layer text to compose');
  await fs.mkdir(mediaDir, { recursive: false });
  for (const artifact of artifacts) await fs.writeFile(artifact.file, artifact.bytes, { flag: 'wx' });
  const composed = { ...document, results: document.results.map((result) => replacements.get(result.job_id) ?? result) };
  await fs.writeFile(output, `${JSON.stringify(composed, null, 2)}\n`, { flag: 'wx' });
  return { output, composed_images: replacements.size, unchanged_gifs: document.results.filter((result) => result.kind === 'gif').length, results: composed };
}
