// Shared v1 contracts. Runtime checks deliberately allow preserved legacy fields.
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const QUESTIONS = {
  Q1: '나에게 맞는가', Q2: '무엇이 달라지는가', Q3: '왜 이 방식인가', Q4: '실제로 사용할 수 있는가',
  Q5: '사용이 얼마나 어려운가', Q6: '정확히 무엇을 받는가', Q7: '문제가 생기면 어떻게 되는가', Q8: '왜 지금 선택하는가',
};
export const MODELS = ['gpt-image-2.5-sunburst', 'gpt-image-2.5-flare', 'gpt-image-2.5-sunburst-2026-09-08', 'gpt-image-2.5-flare-2026-09-08'];
export const CATEGORIES = ['food', 'beauty', 'tech', 'fashion', 'living', 'service'];
export const TOPICS = ['gift', 'problem_solution', 'new_product', 'premium', 'comparison', 'relaunch'];
const aliases = { health_food:'food', cosmetics:'beauty', appliance:'tech', tech_appliance:'tech', fashion_accessory:'fashion', living_kitchen:'living', service_membership:'service' };
export function categoryOf(value) { return aliases[value?.replaceAll('-', '_')] ?? value; }
export function assert(condition, message) { if (!condition) throw new Error(message); }
export function uniqueIds(items, name) {
  const seen = new Set();
  for (const item of items) { assert(typeof item.id === 'string' && item.id.trim(), `${name}: id required`); assert(!seen.has(item.id), `${name}: duplicate id ${item.id}`); seen.add(item.id); }
}
export function validateBrief(brief) {
  assert(brief?.schema_version === 1, 'ProductBrief schema_version must be 1');
  assert(brief.product?.name?.trim(), 'ProductBrief product.name required');
  assert(CATEGORIES.includes(categoryOf(brief.product.category)), 'ProductBrief category must be food, beauty, tech, fashion, living or service');
  assert(TOPICS.includes(brief.product.topic), 'ProductBrief topic invalid');
  assert(Array.isArray(brief.facts) && Array.isArray(brief.assets), 'ProductBrief facts/assets arrays required');
  uniqueIds(brief.facts, 'facts'); uniqueIds(brief.assets, 'assets');
  for (const fact of brief.facts) {
    assert(typeof fact.text === 'string' && fact.text.trim(), `fact ${fact.id}: text required`);
    assert(['confirmed','assumption','confirmation_needed','blocked'].includes(fact.status), `fact ${fact.id}: invalid status`);
    if (fact.status === 'confirmed') assert((fact.source?.file || fact.source?.url) && fact.source?.quote?.trim() && fact.source?.reviewed === true, `fact ${fact.id}: confirmed requires reviewed source and quote`);
  }
  for (const asset of brief.assets) assert(typeof asset.file === 'string' && ['actual_asset','reference_only','generated_concept'].includes(asset.truth_level), `asset ${asset.id}: file and truth_level required`);
  return brief;
}
export function validatePlan(plan) {
  assert(plan?.schema_version === 1 && Array.isArray(plan.sections) && plan.sections.length > 0, 'PagePlan v1 sections required');
  uniqueIds(plan.sections, 'sections');
  for (const section of plan.sections) {
    assert(section.role && section.copy && typeof section.copy.headline === 'string', `section ${section.id}: role/copy required`);
    assert(Array.isArray(section.questions) && section.questions.every(q => q in QUESTIONS), `section ${section.id}: invalid questions`);
    assert(Array.isArray(section.fact_ids) && Array.isArray(section.evidence_ids), `section ${section.id}: fact_ids/evidence_ids required`);
    assert(typeof section.media_job_id === 'string' && section.media_job_id, `section ${section.id}: media_job_id required`);
  }
  return plan;
}
export async function readJson(file) { return JSON.parse(await fs.readFile(file, 'utf8')); }
export async function writeJson(file, data) { await fs.mkdir(path.dirname(file), { recursive:true }); await fs.writeFile(file, JSON.stringify(data,null,2)+'\n'); }
export function isMain(meta) { return !!process.argv[1] && meta.url === pathToFileURL(path.resolve(process.argv[1])).href; }
export function parseArgs(argv) {
  const args = { positional:[] };
  for (let i=0;i<argv.length;i++) { const a=argv[i]; if(a.startsWith('--')) { assert(i+1<argv.length && !argv[i+1].startsWith('--'), `missing value for ${a}`); args[a.slice(2)]=argv[++i]; } else args.positional.push(a); }
  return args;
}
