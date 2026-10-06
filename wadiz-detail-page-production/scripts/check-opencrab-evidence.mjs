#!/usr/bin/env node
import fs from 'node:fs/promises';
import { assert, categoryOf, isMain, parseArgs, readJson, writeJson } from './lib/contracts.mjs';
const profiles = JSON.parse(await fs.readFile(new URL('../assets/planning-profiles.json',import.meta.url),'utf8'));
const genericFamilies = new Set(['section_flow','copy_pattern','visual_block','production_bridge','visual_ocr_qa','runtime_execution_bridge','claim_evidence']);
const bad = /pack_metadata|fallback row|upload ledger|node_count|edge_count|package snapshot/i;

export function assessEvidence(brief, raw) {
  const category = categoryOf(brief.product.category);
  assert(profiles.categories[category], 'unknown category');
  const entries = Array.isArray(raw) ? raw : raw.responses ?? [raw];
  const rows = [];
  for (const response of entries) {
    const scope = response.pack_scope?.source;
    for (const evidence of response.evidence ?? []) {
      const text = evidence.text ?? '';
      const source = evidence.metadata?.source_url ?? evidence.metadata?.source_path ?? evidence.source;
      const family = evidence.family ?? response.family;
      const terms = profiles.categories[category].keywords.filter(k => text.toLowerCase().includes(k.toLowerCase()));
      const review = evidence.review ?? {};
      const reasons=[];
      if (scope !== 'explicit_package' && scope !== 'explicit_packages') reasons.push('package_scope_unverified');
      if (!evidence.id || !evidence.package_id || !source) reasons.push('source_link_missing');
      if (text.trim().length < 160 || bad.test(text)) reasons.push('fragment_or_metadata');
      if (!family) reasons.push('family_missing');
      if (!terms.length && !genericFamilies.has(family)) reasons.push('category_mismatch');
      // Lexical overlap can select candidates; only a reviewer can establish usefulness.
      if (review.relevant !== true || !review.decision?.trim() || !review.reviewed_text || review.reviewed_text !== text) reasons.push('relevance_review_required');
      if (review.product_fact === true) reasons.push('reference_is_not_product_fact');
      rows.push({ id:evidence.id ?? null, package_id:evidence.package_id ?? null, family:family ?? null, source, text, matched_terms:terms, decision:review.decision ?? null, status:reasons.length ? 'rejected_or_review_required':'accepted_pattern', reasons });
    }
  }
  const accepted = rows.filter(r=>r.status==='accepted_pattern');
  const required=['source_reference','section_flow','copy_pattern','claim_evidence','production_bridge'];
  const missing=required.filter(f=>!accepted.some(r=>r.family===f));
  return { schema_version:1, category, status:missing.length?'pack_retrieval_weak':'pack_verified', required_families:required, missing_families:missing, rows };
}
if (isMain(import.meta)) {
  try { const a=parseArgs(process.argv.slice(2)); assert(a.positional.length===2 && a.out,'Usage: check-opencrab-evidence.mjs <product-brief.json> <raw.json> --out <matrix.json>'); const matrix=assessEvidence(await readJson(a.positional[0]),await readJson(a.positional[1])); await writeJson(a.out,matrix); console.log(`${matrix.status}: ${matrix.rows.length} evidence rows`); if(matrix.status!=='pack_verified') process.exitCode=2; }
  catch(e){console.error(e.message);process.exitCode=1;}
}
