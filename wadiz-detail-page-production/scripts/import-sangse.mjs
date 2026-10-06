#!/usr/bin/env node
/** Import sangse project documents; retain originals and never mark claims reviewed automatically. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { parseCuts, parseLegal, stripQuantitativeBlocks } from './compat/sangse-format.mjs';
import { checkCopyLanguage, checkCopySlots, checkQuantitativeLinks, normalizeClaim } from './compat/copy-checks.mjs';
import { categoryOf } from './lib/contracts.mjs';

const SOURCE_NAMES = ['cuts.md', 'legal.md', 'raw-input.md', 'intake-checklist.md'];
const questionRoles = { Q1: 'audience', Q2: 'benefit', Q3: 'mechanism', Q4: 'proof', Q5: 'usage', Q6: 'specification', Q7: 'policy', Q8: 'offer' };

function bulletValue(markdown, labels) {
  const pattern = new RegExp(`^[ \\t]*[-*][ \\t]*(?:${labels.join('|')})(?:\\([^)]*\\))?[ \\t]*:[ \\t]*(.+)$`, 'm');
  return markdown.match(pattern)?.[1] ?? '';
}

export function importSangseDocuments(sourceFiles, options = {}) {
  if (!sourceFiles['cuts.md']?.trim()) throw new Error('cuts.md is required.');
  const parsed = parseCuts(sourceFiles['cuts.md']);
  const legalText = sourceFiles['legal.md'] ?? '';
  const raw = sourceFiles['raw-input.md'] ?? '';
  const legal = parseLegal(legalText);
  const category = options.category ?? parsed.metadata.category ?? 'unknown';
  const topic = options.topic ?? parsed.metadata.topic ?? 'unknown';
  const productName = options.productName ?? (bulletValue(raw, ['상품', '제품', '서비스', '상품명', '제품명']) || parsed.title.replace(/\s*컷\s*시트\s*$/, ''));
  const product = { name: productName, category, topic, sku: bulletValue(raw, ['SKU', 'sku']), options: [], target_customer: bulletValue(raw, ['타겟', '타깃', '고객', '대상']) };
  const facts = [];
  const sourceBase = options.sourceDir ?? '.';
  const addFact = (id, text, file, quote, extra = {}) => {
    facts.push({ id, text, status: 'confirmation_needed', source: { file: path.resolve(sourceBase, file), quote, reviewed: false }, ...extra });
    return id;
  };
  let rawIndex = 0;
  for (const line of stripQuantitativeBlocks(raw).split(/\r?\n/)) {
    if (/^\s*[-*]\s+/.test(line)) addFact(`R${String(++rawIndex).padStart(3, '0')}`, line.replace(/^\s*[-*]\s+/, ''), 'raw-input.md', line);
  }
  for (let index = 0; index < legal.length; index++) {
    const block = legal[index];
    if (block.text) addFact(`L${String(index + 1).padStart(3, '0')}`, block.text, 'legal.md', block.text, { legal_heading: block.title });
  }
  const quantitative = checkQuantitativeLinks(parsed.cuts, legalText, Object.fromEntries(['raw-input.md', 'intake-checklist.md'].map(name => [name, sourceFiles[name] ?? ''])));
  for (let index = 0; index < quantitative.source_links.length; index++) {
    const link = quantitative.source_links[index];
    const first = link.sources[0];
    const source = first && link.linkage_status === 'linked' ? first : { file: 'cuts.md', quote: link.claim };
    addFact(`N${String(index + 1).padStart(3, '0')}`, link.claim, source.file, source.quote, { imported_location: link.at, linkage_status: link.linkage_status, sources: link.sources });
  }
  const sections = parsed.cuts.map((cut, index) => {
    const fields = cut.fields;
    const copy = { headline: fields.headline ?? '', subcopy: fields.sub ?? fields.subcopy ?? '', body: fields.body ?? '' };
    for (const field of ['footnote', 'cta', 'tags']) if (Object.hasOwn(fields, field)) copy[field] = fields[field];
    const factIds = facts.filter(fact => fact.imported_location?.startsWith(`${cut.id}.`) || Object.values(copy).some(value => value.trim() && [value, ...value.split('\n')].some(statement => normalizeClaim(statement) === normalizeClaim(fact.text)))).map(fact => fact.id);
    return { id: cut.id, role: questionRoles[cut.questions[0]] ?? 'imported', questions: cut.questions, template: cut.template, copy, fact_ids: factIds, evidence_ids: [], media_job_id: `media-${cut.id}`, visual_direction: fields.visual ?? '', placement_reason: `Preserve original sangse order ${index + 1}; questions indicate coverage, not mandatory order.`, legacy: { header: cut.header, height: cut.height, fields, unmapped: cut.unmapped } };
  });
  // legal.md has independent transaction terms: retain them in plan as well as the source bundle.
  const pagePlan = { schema_version: 1, product_name: product.name, sections, style: options.style ?? parsed.metadata.style ?? 'story-first', category, topic, legal, pack_status: 'pack_not_verified', copy_approval: { status: 'pending' }, publication_status: 'blocked', missing_information: ['source_review'], legacy: { title: parsed.title, metadata: parsed.metadata, unmapped: parsed.unmapped, source_files: SOURCE_NAMES.filter(name => Object.hasOwn(sourceFiles, name)) } };
  const unknowns = [
    ...(!product.name ? ['product.name'] : []),
    ...(category === 'unknown' ? ['product.category'] : []),
    ...(topic === 'unknown' ? ['product.topic'] : []),
    ...(!product.target_customer ? ['product.target_customer'] : []),
    'All imported product facts require source review before publication.',
  ];
  const fictitious = /가상|시연용|fictional|demo\s+only/i.test(raw);
  if (fictitious) unknowns.push('Source explicitly describes fictional/demo product facts; do not use as real product evidence.');
  const assets = (options.refs ?? []).map((file, index) => ({ id: `A${String(index + 1).padStart(3, '0')}`, file: path.resolve(sourceBase, file), truth_level: 'reference_only' }));
  const requiresProductReference = categoryOf(category) !== 'service';
  if (requiresProductReference && !assets.length) unknowns.push('product_reference_images');
  pagePlan.missing_information.push(...unknowns);
  const productBrief = { schema_version: 1, source_root: path.resolve(sourceBase), product, facts, assets, unknowns, legal_text: legalText, source_links: quantitative.source_links.map(link => ({ ...link, sources: link.sources.map(source => ({ ...source, file: path.resolve(sourceBase, source.file), reviewed: false })) })), imported_plan: 'page-plan.json', legacy: { fictitious, metadata: parsed.metadata, legal } };
  const mediaJobs = { schema_version: 1, source_root: path.resolve(sourceBase), jobs: sections.map(section => ({
    id: section.media_job_id, section_id: section.id, kind: 'image', backend: options.backend ?? 'codex_native', model_requested: 'gpt-image-2.5-sunburst', model_confirmed: null,
    input_refs: assets.map(asset => ({ file: asset.file, role: 'product_identity', truth_level: asset.truth_level })),
    prompt: `${section.visual_direction}\n${section.copy.headline}\n${section.copy.subcopy}\n${section.copy.body}`,
    output_file: `cuts/${section.id}.png`, truth_level: 'generated_concept', requires_product_reference: requiresProductReference, status: requiresProductReference && !assets.length ? 'blocked' : 'pending',
    ...(requiresProductReference && !assets.length ? { blocked_reason: 'product_reference_images_required' } : {}),
    legacy: { existing_image: section.legacy.fields.image ?? null, fields: section.legacy.fields },
  })) };
  const unmapped = [...parsed.unmapped.map(value => ({ scope: 'metadata', value })), ...parsed.cuts.flatMap(cut => cut.unmapped.map(value => ({ scope: cut.id, value })))];
  const report = {
    schema_version: 1, source_format: 'sangse', section_count: sections.length,
    preserved: ['cut IDs and order', 'all cut fields', 'legal terms', 'source markdown', 'quantitative declarations'],
    unmapped, missing_files: SOURCE_NAMES.filter(name => !Object.hasOwn(sourceFiles, name)),
    backwards_incompatibilities: ['New JSON plans are not a sangse cuts.md rewrite; original cuts.md and legal.md remain authoritative for the legacy commands.', 'Dynamic sections and GIF jobs cannot be represented completely in the old image-only schema.'],
    source_review: 'not_performed', fictional_source: fictitious,
    checks: { quantitative_links: quantitative, copy_slots: checkCopySlots(pagePlan), copy_language: checkCopyLanguage(pagePlan) },
  };
  return { productBrief, pagePlan, mediaJobs, report };
}

async function canonicalTarget(target) {
  let current = path.resolve(target);
  const missing = [];
  for (;;) {
    try { return path.join(await fs.realpath(current), ...missing.reverse()); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const parent = path.dirname(current);
      if (parent === current) throw error;
      missing.push(path.basename(current)); current = parent;
    }
  }
}

export async function importSangseProject(sourceDir, outputDir, options = {}) {
  const source = await fs.realpath(sourceDir);
  // Resolve existing ancestors as well as the source. Windows runner temp paths
  // can use DOS short names; a string-only relative check would treat the same
  // source directory as an unrelated location and permit writes inside it.
  const out = await canonicalTarget(outputDir);
  const relative = path.relative(source, out);
  const outside = relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative);
  if (!relative || !outside) throw new Error('--out must be a new directory outside the source project.');
  // Exclusive directory creation prevents partial overwrite of a previous run.
  try { await fs.stat(out); throw new Error(`Output already exists: ${out}`); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const sourceFiles = {};
  for (const name of SOURCE_NAMES) {
    try { sourceFiles[name] = await fs.readFile(path.join(source, name), 'utf8'); }
    catch (error) { if (error.code !== 'ENOENT' || name === 'cuts.md') throw error; }
  }
  const imported = importSangseDocuments(sourceFiles, { ...options, sourceDir: source });
  for (const asset of imported.productBrief.assets) if (!(await fs.stat(asset.file)).isFile()) throw new Error(`Reference is not a file: ${asset.file}`);
  const bundle = { schema_version: 1, source_directory: source, files: Object.fromEntries(Object.entries(sourceFiles).map(([name, content]) => [name, { content, sha256: createHash('sha256').update(content).digest('hex') }])) };
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.mkdir(out);
  for (const [name, data] of [['product-brief.json', imported.productBrief], ['page-plan.json', imported.pagePlan], ['media-jobs.json', imported.mediaJobs], ['evidence-matrix.json', { schema_version: 1, status: 'pack_not_verified', rows: [] }], ['compatibility-report.json', imported.report], ['legacy-source-bundle.json', bundle]]) {
    await fs.writeFile(path.join(out, name), `${JSON.stringify(data, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  }
  await fs.writeFile(path.join(out, 'legal.md'), sourceFiles['legal.md'] ?? '', { encoding: 'utf8', flag: 'wx' });
  return imported;
}

async function main(argv) {
  if (argv.includes('--help')) { console.log('Usage: node import-sangse.mjs <source-project-dir> --out <new-dir> [--category <id>] [--topic <id>] [--product-name <name>] [--style <id>] [--ref <product-image> ...]'); return; }
  const source = argv.shift();
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    if (!['--out', '--category', '--topic', '--product-name', '--style', '--ref'].includes(key) || !argv[i + 1]) throw new Error(`Invalid argument: ${key}`);
    if (key === '--ref') (args.refs ??= []).push(argv[i + 1]); else args[key.slice(2)] = argv[i + 1];
  }
  if (!source || !args.out) throw new Error('source project and --out are required.');
  const result = await importSangseProject(source, args.out, { category: args.category, topic: args.topic, productName: args['product-name'], style: args.style, refs: args.refs });
  console.log(JSON.stringify({ output: path.resolve(args.out), sections: result.pagePlan.sections.length, source_review: result.report.source_review, checks: Object.fromEntries(Object.entries(result.report.checks).map(([key, value]) => [key, value.status])) }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
