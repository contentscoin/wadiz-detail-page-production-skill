#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { QUESTIONS, assert, isMain, parseArgs, readJson, validateBrief, validatePlan, writeJson } from './lib/contracts.mjs';
import { checkCopySlots, checkCopyLanguage } from './compat/copy-checks.mjs';
import { createHash } from 'node:crypto';

export async function validateProject(root) {
  const brief=validateBrief(await readJson(path.join(root,'product-brief.json')));
  const plan=validatePlan(await readJson(path.join(root,'page-plan.json')));
  const facts=new Map(brief.facts.map(f=>[f.id,f])), errors=[], warnings=[];
  const reviewedSources=new Map();
  for(const fact of brief.facts.filter(f=>f.status==='confirmed')) {
    if(fact.source.file) {
      const file=path.resolve(brief.source_root??root,fact.source.file);
      const content=await fs.readFile(file,'utf8').catch(()=>null);
      if(!content?.includes(fact.source.quote)) errors.push({code:'source_quote_missing',fact_id:fact.id,file});
      else reviewedSources.set(fact.id,fact.source.quote);
    } else {
      try { const u=new URL(fact.source.url); assert(['https:','http:'].includes(u.protocol),'invalid source URL'); reviewedSources.set(fact.id,fact.source.quote); warnings.push({code:'remote_source_review_only',fact_id:fact.id}); } catch { errors.push({code:'invalid_source_url',fact_id:fact.id}); }
    }
  }
  const questions=new Set(plan.sections.flatMap(s=>s.questions));
  for(const q of Object.keys(QUESTIONS)) if(!questions.has(q)) errors.push({code:'question_missing',question:q});
  for(const attribute of plan.required_information??[]) if(!plan.sections.some(s=>s.required_information?.includes(attribute)||s.roles?.includes(attribute)||s.role===attribute)) errors.push({code:'required_section_missing',attribute});
  const matrix=await readJson(path.join(root,'evidence-matrix.json')).catch(()=>({rows:[]}));
  const evidence=new Set(matrix.rows?.filter(r=>r.status==='accepted_pattern').map(r=>r.id));
  for(const section of plan.sections) {
    for(const id of section.evidence_ids) if(!evidence.has(id)) errors.push({code:'evidence_not_accepted',section_id:section.id,evidence_id:id});
    const linked=section.fact_ids.map(id=>facts.get(id));
    for(let i=0;i<linked.length;i++) if(!linked[i]||linked[i].status!=='confirmed'||!reviewedSources.has(linked[i].id)) errors.push({code:'fact_not_verified',section_id:section.id,fact_id:section.fact_ids[i]});
    const copy=[section.copy.headline,section.copy.subcopy,section.copy.body,section.copy.footnote,section.copy.cta].filter(Boolean).join('\n');
    if(copy.includes('[자료 필요:')) warnings.push({code:'copy_placeholder',section_id:section.id});
    const numeric=/\d+(?:[.,]\d+)*(?:\s*(?:%|원|만원|개|회|일|개월|년|g|mg|kg|ml|mL|L|mm|cm|m|시간|분|초))?/g;
    // Match the entire claim-bearing field, not just an unrelated occurrence of a number.
    for(const [field,text] of Object.entries(section.copy)) {
      if(typeof text!=='string') continue;
      for(const line of text.split('\n')) {
        if(line.includes('[자료 필요:') || !numeric.test(line)) {numeric.lastIndex=0;continue;} numeric.lastIndex=0;
        if(line===brief.product.name) continue;
        const supported=linked.some(f=>f&&reviewedSources.has(f.id)&&(f.text===line||f.source.quote.includes(line))) || brief.quantitative_approvals?.some(a=>a.section_id===section.id && a.field===field && a.claim===text && a.reviewed===true && a.fact_ids?.length && a.fact_ids.every(id=>section.fact_ids.includes(id)&&reviewedSources.has(id)));
        if(!supported) errors.push({code:'quantitative_claim_unlinked',section_id:section.id,field,claim:line});
      }
    }
    const headlineLines=section.copy.headline.split('\n');
    if(headlineLines.length>2||headlineLines.some(l=>[...l].length>24)) warnings.push({code:'headline_slot_overflow',section_id:section.id});
    if((section.copy.body??'').split('\n').some(l=>[...l].length>48)) warnings.push({code:'body_requires_editorial_split',section_id:section.id});
  }
  // Missing-information markers are authoring instructions, not renderable copy.
  const copyPlan={...plan,sections:plan.sections.map(s=>({...s,copy:Object.fromEntries(Object.entries(s.copy).map(([k,v])=>[k,typeof v==='string'?v.replace(/\[자료 필요:[^\]]*\]/g,''):v]))}))};
  const slots=checkCopySlots(copyPlan),language=checkCopyLanguage(copyPlan,brief.product.category);
  for(const message of slots.errors) errors.push({code:'copy_slot_overflow',message});
  for(const message of slots.warnings) warnings.push({code:'copy_slot_warning',message});
  for(const match of language.matches) (match.severity==='ban'?errors:warnings).push({code:'copy_language',...match});
  const jobs=await readJson(path.join(root,'media-jobs.json'));
  const ids=new Set(); for(const job of jobs.jobs??[]) {if(ids.has(job.id)) errors.push({code:'duplicate_media_job',job_id:job.id});ids.add(job.id);}
  for(const s of plan.sections) if(!ids.has(s.media_job_id)) errors.push({code:'media_job_missing',section_id:s.id});
  const hash=data=>createHash('sha256').update(JSON.stringify(data)).digest('hex');
  return {schema_version:1,status:errors.length?'failed':'draft_valid',errors,warnings,question_coverage:[...questions],copy_slots:slots,copy_language:language,plan_sha256:hash(plan),brief_sha256:hash(brief),quantitative_validation:'source_connection_only; arithmetic and meaning require review',publication_status:'blocked',missing_information:plan.missing_information??[]};
}
if(isMain(import.meta)) {try{const a=parseArgs(process.argv.slice(2));assert(a.positional.length===1,'Usage: validate-page-plan.mjs <project-directory>');const root=path.resolve(a.positional[0]),report=await validateProject(root);await writeJson(path.join(root,'qa','plan-qa.json'),report);console.log(`${report.status}: ${report.errors.length} errors, ${report.warnings.length} warnings`);if(report.errors.length)process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=1;}}
