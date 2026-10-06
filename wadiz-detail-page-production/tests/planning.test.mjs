import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { compilePlan, writeProject } from '../scripts/compile-page-plan.mjs';
import { assessEvidence } from '../scripts/check-opencrab-evidence.mjs';
import { validateProject } from '../scripts/validate-page-plan.mjs';
import { validateBrief } from '../scripts/lib/contracts.mjs';
import { prepareMediaJobs } from '../scripts/media/image-backends.mjs';
const brief=(category='tech',topic='problem_solution')=>({schema_version:1,product:{name:'테스트 이어폰',category,topic,target_customer:'통근자',sku:'T',options:[]},facts:[],assets:[],unknowns:[]});
test('same product changes narrative and GIF purpose for gift vs problem',()=>{
  const a=compilePlan(brief('tech','gift')),b=compilePlan(brief());
  assert.notDeepEqual(a.plan.sections.map(s=>s.role),b.plan.sections.map(s=>s.role));
  assert.notEqual(a.jobs.jobs.find(j=>j.kind==='gif').purpose,b.jobs.jobs.find(j=>j.kind==='gif').purpose);
});
test('image prompts reserve exact copy for deterministic composition',()=>{
  const {jobs}=compilePlan(brief());
  assert.ok(jobs.jobs.filter(j=>j.kind==='image').every(j=>j.prompt.includes('정확한 카피는 후속 결정론적 텍스트 합성')));
  assert.ok(jobs.jobs.find(j=>j.kind==='gif').frame_jobs.every(j=>j.prompt.includes('가격·규격·거래 문구와 새 글자는 그리지 않')));
});
test('category-specific mandatory information and eight question coverage',()=>{
  for(const cat of ['tech','food','beauty','fashion','living','service']) {
    for(const topic of ['gift','problem_solution','new_product','premium','comparison','relaunch']) {
      const {plan}=compilePlan(brief(cat,topic));const covered=new Set(plan.sections.flatMap(s=>s.questions));
      assert.equal(covered.size,8,`${cat}/${topic}`);
      for(const info of plan.required_information) assert.ok(plan.sections.some(s=>s.required_information.includes(info)));
    }
  }
  assert.notDeepEqual(compilePlan(brief('food')).plan.required_information,compilePlan(brief('fashion')).plan.required_information);
});
test('variable feature count and explicit 12/15 presets preserve facts',()=>{
  const b=brief(); b.facts=[1,2,3].map(i=>({id:`f${i}`,text:`기능 ${i}`,role:'benefit',status:'confirmed',source:{url:'https://example.com/product',quote:`기능 ${i}`,reviewed:true}}));
  assert.equal(compilePlan(b).plan.sections.filter(s=>s.role==='benefit').length,3);
  for(const preset of [12,15]) {const p=compilePlan(b,{preset}).plan;assert.equal(p.sections.length,preset);assert.deepEqual(new Set(p.sections.flatMap(s=>s.fact_ids)),new Set(['f1','f2','f3']));}
});
test('unrelated high scoring furniture chunks are not headphone evidence',()=>{
  const raw={pack_scope:{source:'explicit_package'},family:'category_playbook',evidence:[{id:'e1',package_id:'pack',score:0.99,source:'office.md',text:'Fursys office desk neutral background and modular desk. '.repeat(8),review:{relevant:true,decision:'Use this',reviewed_text:'different text'}}]};
  const matrix=assessEvidence(brief(),raw);assert.equal(matrix.status,'pack_retrieval_weak');assert.ok(matrix.rows[0].reasons.includes('category_mismatch'));assert.ok(matrix.rows[0].reasons.includes('relevance_review_required'));
});
test('metadata and reviewed reference facts never become product claims',()=>{
  const raw={pack_scope:{source:'explicit_package'},family:'source_reference',evidence:[{id:'e',package_id:'p',source:'page',text:'배터리 이어폰 '.repeat(40),review:{relevant:true,decision:'proof placement',product_fact:true,reviewed_text:'배터리 이어폰 '.repeat(40)}}]};
  assert.ok(assessEvidence(brief(),raw).rows[0].reasons.includes('reference_is_not_product_fact'));
});
test('confirmed facts require reviewed source',()=>{const b=brief();b.facts=[{id:'f',text:'battery lasts 20h',status:'confirmed'}];assert.throws(()=>validateBrief(b),/reviewed source/);});
test('relative product references remain resolvable after compilation into a new directory',async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'wadiz-refs-'));
  try{
    await fs.writeFile(path.join(root,'product.png'),Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jFf8AAAAASUVORK5CYII=','base64'));
    const b=brief();b.assets=[{id:'product',file:'product.png',truth_level:'reference_only'}];
    const out=path.join(root,'new-project');await writeProject(b,compilePlan(b),out,{sourceRoot:root});
    const jobs=JSON.parse(await fs.readFile(path.join(out,'media-jobs.json'),'utf8'));
    const prepared=await prepareMediaJobs(jobs,{baseDir:out,capabilities:{codex_native:{model_pinning:false,supported_models:[],references:true}}});
    assert.equal(prepared.jobs[0].input_refs[0].file,path.join(root,'product.png'));
    assert.equal(prepared.jobs[0].status,'blocked');
  }finally{await fs.rm(root,{recursive:true,force:true});}
});
test('project validator rejects unrelated number reuse and altered source quote',async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'wadiz-plan-'));
  try{
    await fs.writeFile(path.join(root,'source.md'),'배터리 사용 시간 20시간');
    const b=brief();b.facts=[{id:'f',role:'benefit',text:'배터리 사용 시간 20시간',status:'confirmed',source:{file:'source.md',quote:'배터리 사용 시간 20시간',reviewed:true}}];
    const out=path.join(root,'project');await writeProject(b,compilePlan(b),out,{sourceRoot:root});
    assert.equal((await validateProject(out)).errors.length,0);
    const plan=JSON.parse(await fs.readFile(path.join(out,'page-plan.json'),'utf8'));plan.sections.find(s=>s.role==='benefit').copy.body='효과가 20배';await fs.writeFile(path.join(out,'page-plan.json'),JSON.stringify(plan));
    assert.ok((await validateProject(out)).errors.some(e=>e.code==='quantitative_claim_unlinked'));
    await fs.writeFile(path.join(root,'source.md'),'출처 변경');assert.ok((await validateProject(out)).errors.some(e=>e.code==='source_quote_missing'));
  }finally{await fs.rm(root,{recursive:true,force:true});}
});
