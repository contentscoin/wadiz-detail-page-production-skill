#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { QUESTIONS, categoryOf, validateBrief, assert, isMain, parseArgs, readJson, writeJson } from './lib/contracts.mjs';
import { assessEvidence } from './check-opencrab-evidence.mjs';
const profiles=JSON.parse(await fs.readFile(new URL('../assets/planning-profiles.json',import.meta.url),'utf8'));
const stylePacks=Object.fromEntries(await Promise.all(['story-first','checkpoint','proof-first','lookbook','spec-showcase','offer-first'].map(async id=>[id,JSON.parse(await fs.readFile(new URL(`../assets/sangse/style-packs/${id}.json`,import.meta.url),'utf8'))])));
const templates=JSON.parse(await fs.readFile(new URL('../assets/sangse/cut-templates.json',import.meta.url),'utf8')).templates;
const styles={ 'story-first':['problem','reveal'], checkpoint:['reveal','mechanism'], 'proof-first':['proof','reveal'], lookbook:['recipient','reveal'], 'spec-showcase':['comparison','reveal'], 'offer-first':['offer','reveal'] };
const attributeTitles={ingredients:'성분·원재료',capacity:'용량과 구성',storage:'보관 방법',precautions:'사용 전 주의사항',suitability:'사용 대상과 적합성',specifications:'제품 사양',compatibility:'호환 범위',power:'전원과 충전',support:'지원·A/S',material:'소재와 디테일',size:'사이즈',fit:'착용과 핏',care:'관리 방법',dimensions:'크기와 공간',installation:'설치 순서',process:'서비스 과정',deliverables:'제공 결과물',eligibility:'참여 조건',schedule:'일정과 기간',cancellation:'취소 조건'};
const tagMatches=(fact,role)=>fact.role===role || fact.attribute===role || fact.tags?.includes(role);

export function compilePlan(brief,{evidence={schema_version:1,status:'pack_not_verified',rows:[]},style,preset}={}) {
  validateBrief(brief);
  const category=categoryOf(brief.product.category), topic=brief.product.topic;
  const cat=profiles.categories[category], campaign=profiles.topics[topic];
  style??=campaign.style; assert(styles[style],`unknown style: ${style}`);
  if(preset!==undefined) assert([12,15].includes(Number(preset)),'preset must be 12 or 15');
  const confirmed=brief.facts.filter(f=>f.status==='confirmed');
  const opening=campaign.opening.map(r=>r==='material'?cat.sections[0]:r);
  const optionalRoles=['mechanism','proof'];
  const allRoles=[...(style===campaign.style?opening:styles[style]),...opening,...optionalRoles.filter(r=>confirmed.some(f=>tagMatches(f,r))),...cat.sections,...(!cat.sections.some(r=>['fit','installation','process'].includes(r))?['usage']:[]),'components','offer','faq','policy','cta'].filter(r=>!optionalRoles.includes(r)||confirmed.some(f=>tagMatches(f,r)));
  const roles=[...new Set(allRoles)];
  if (!roles.some(r=>profiles.roles[r]?.questions.includes('Q1'))) roles.unshift('hero');
  for(const attribute of cat.required) if(!roles.includes(attribute)) roles.splice(roles.indexOf('policy'),0,attribute);
  const sections=[];
  const titleFor=role=>profiles.roles[role]?.title ?? attributeTitles[role] ?? role;
  for(const role of roles) {
    let facts=confirmed.filter(f=>tagMatches(f,role));
    if(role==='reveal') facts=confirmed.filter(f=>tagMatches(f,'identity'));
    if(role==='components') facts=confirmed.filter(f=>tagMatches(f,'components')||tagMatches(f,'options'));
    if(role==='policy') facts=confirmed.filter(f=>['delivery','returns','cancellation','warranty'].some(r=>tagMatches(f,r)));
    const groups=role==='benefit'&&facts.length>1?facts.map(f=>[f]):[facts];
    for(const group of groups) {
      const definition=profiles.roles[role] ?? {questions:[...new Set([...(role===cat.sections[0]?['Q3']:[]),...(['fit','installation','process'].includes(role)?['Q4','Q5']:['Q6'])])]};
      const body=group.map(f=>f.text).join('\n');
      const missing=group.length===0 && !['cta','reveal'].includes(role);
      const headline=role==='reveal'?brief.product.name:sections.length===0?campaign.hook:titleFor(role);
      sections.push({role,roles:[role],questions:definition.questions,copy:{headline,subcopy:'',body:body||(missing?`[자료 필요: ${titleFor(role)}]`:''),...(role==='cta'?{cta:'상품과 조건을 확인해 주세요'}:{})},fact_ids:group.map(f=>f.id),evidence_ids:evidence.rows.filter(e=>e.status==='accepted_pattern' && (e.roles?.includes(role)||e.family==='section_flow')).map(e=>e.id),visual_direction:`${brief.product.name}: ${titleFor(role)}. 제공된 상품 기준 이미지를 유지합니다.`,placement_reason:campaign.reason,required_information:cat.required.includes(role)?[role]:[],text_render_mode:['offer','policy','specifications','capacity','precautions'].includes(role)?'svg_layer':'hybrid',copy_status:'draft',unknowns:missing?[role]:[]});
    }
  }
  // Compatibility presets merge adjacent information sections without dropping claims.
  if(preset) {
    while(sections.length>Number(preset)) {
      const index=sections.findIndex((s,i)=>i>2 && i<sections.length-2 && !['proof','offer','cta'].includes(s.role) && s.role!=='policy');
      assert(index>0,'cannot safely fit requested preset');
      const a=sections[index], b=sections[index+1];
      a.roles.push(...b.roles); a.questions=[...new Set([...a.questions,...b.questions])];
      a.copy.headline=`${a.copy.headline} / ${b.copy.headline}`; a.copy.body=[a.copy.body,b.copy.body].filter(Boolean).join('\n');
      a.fact_ids.push(...b.fact_ids); a.evidence_ids=[...new Set([...a.evidence_ids,...b.evidence_ids])];
      a.required_information.push(...b.required_information); a.unknowns.push(...b.unknowns);
      a.visual_direction+=` ${b.visual_direction}`; sections.splice(index+1,1);
    }
    while(sections.length<Number(preset)) sections.splice(sections.length-1,0,{role:'detail',roles:['detail'],questions:['Q6'],copy:{headline:'추가 상세 정보',subcopy:'',body:'[자료 필요: 추가 상세 정보]'},fact_ids:[],evidence_ids:[],visual_direction:'새 정보가 없다면 이 호환용 슬롯을 합치고 가변 기획을 사용합니다.',placement_reason:'사용자가 지정한 호환 컷 수',required_information:[],text_render_mode:'svg_layer',copy_status:'draft',unknowns:['detail']});
  }
  const stylePack=stylePacks[style];
  sections.forEach((s,i)=>{
    s.id=`section-${String(i+1).padStart(2,'0')}`;s.media_job_id=`media-${String(i+1).padStart(2,'0')}`;
    const candidate=stylePack.sequence?.find(item=>s.questions.includes(item.q));
    const fits=id=>{
      const rule=templates[id], copy=Object.fromEntries(Object.entries(s.copy).map(([k,v])=>[k,typeof v==='string'?v.replace(/\[자료 필요:[^\]]*\]/g,''):v]));
      return rule && copy.headline.split('\n').every(l=>[...l].length<=rule.headline_max) && (copy.subcopy??'').split('\n').every(l=>[...l].length<=rule.sub_max) && (copy.body??'').split('\n').filter(Boolean).length<=rule.body_lines_max && (copy.body??'').split('\n').every(l=>[...l].length<=rule.line_max);
    };
    s.template=candidate&&fits(candidate.tpl)?candidate.tpl:fits('S1')?'S1':candidate?.tpl??'S1';
    s.layout={style,typography:stylePack.typography??{},visual_mode:stylePack.visual_mode??stylePack.lead_mode,grammar:stylePack.grammar??{}};
    s.visual_direction+=` 스타일: ${stylePack.name?.ko??style}. ${stylePack.lead_mode??''}`;
  });
  const missing=[...new Set([...cat.required.filter(a=>!confirmed.some(f=>tagMatches(f,a))),...sections.flatMap(s=>s.unknowns),...(brief.unknowns??[])])];
  const plan={schema_version:1,product_name:brief.product.name,category,topic,style,style_rules:{typography:stylePack.typography,grammar:stylePack.grammar,lead_mode:stylePack.lead_mode},preset:preset?Number(preset):'adaptive',questions:QUESTIONS,required_information:cat.required,missing_information:missing,sections,pack_status:evidence.status,copy_approval:{status:'pending'},publication_status:'blocked'};
  const refs=brief.assets.filter(a=>['actual_asset','reference_only'].includes(a.truth_level)).map(a=>({file:a.file,role:'product_identity',truth_level:a.truth_level}));
  const motionSection=sections.find(s=>s.roles.some(r=>['components','usage','material','comparison','changes'].includes(r)));
  const jobs = sections.map(s => ({
    id:s.media_job_id, section_id:s.id, kind:s===motionSection?'gif':'image',
    purpose:s===motionSection?campaign.motion:s.role,
    backend:brief.generation?.backend??'codex_native',
    model_requested:brief.generation?.model??'gpt-image-2.5-sunburst',
    input_refs:refs, requires_product_reference:category!=='service',
    prompt:`${s.visual_direction}\n확정 사실의 시각적 설명만 표현합니다: ${s.copy.body.replace(/\[자료 필요:[^\]]*\]/g,'') || '확정 사실 추가 전 제작 보류'}\n텍스트, 가격, 규격, 거래 조건, 글자 형태의 로고는 새로 그리지 않습니다. 상품 기준 이미지의 로고는 보존합니다. 정확한 카피는 후속 결정론적 텍스트 합성으로 배치합니다.`,
    truth_level:'generated_concept', status:'pending',
    ...(s===motionSection ? {
      motion:{source_type:'generated_explainer',initial_state:'첫 구성·단계',change:campaign.motion,end_state:'마지막 구성·단계',loop_reset:'첫 상태로 전환',requires_actual_footage:false},
      frame_jobs:[0,1,2].map(n=>({id:`${s.media_job_id}-frame-${n+1}`,kind:'image',frame_index:n,prompt:`${s.visual_direction}\n${campaign.motion}, ${n+1}번째 단계. 확정된 상품 사실만 표현합니다. 가격·규격·거래 문구와 새 글자는 그리지 않으며 기준 이미지의 상품 로고는 보존합니다. GIF의 정확한 문구는 별도 텍스트 계층으로 배치합니다.`})),
    } : {}),
  }));
  const interview=[...new Set(['target_customer',...missing,...(brief.unknowns??[])])].filter(k=>k!=='target_customer'||!brief.product.target_customer).map(k=>({field:k,question:`${attributeTitles[k]??k}의 공식 자료 또는 확정 내용을 알려주세요.`}));
  return {plan,jobs:{schema_version:1,jobs},interview,evidence};
}

export async function writeProject(brief,result,out,{sourceRoot=process.cwd()}={}) {
  assert(!await fs.stat(out).then(()=>true,()=>false),'output already exists; choose a new project directory');
  await fs.mkdir(out,{recursive:true});
  const base=path.resolve(sourceRoot);
  const resolveRefs=refs=>(refs??[]).map(ref=>({...ref,file:path.resolve(base,ref.file)}));
  const jobs={...result.jobs,jobs:result.jobs.jobs.map(job=>({...job,input_refs:resolveRefs(job.input_refs),...(job.frame_jobs?{frame_jobs:job.frame_jobs.map(frame=>({...frame,...(frame.input_refs?{input_refs:resolveRefs(frame.input_refs)}:{})}))}:{})}))};
  await writeJson(path.join(out,'product-brief.json'),{...brief,assets:brief.assets.map(a=>({...a,file:path.resolve(base,a.file)})),source_root:base});
  await writeJson(path.join(out,'page-plan.json'),result.plan); await writeJson(path.join(out,'media-jobs.json'),jobs);
  await writeJson(path.join(out,'evidence-matrix.json'),result.evidence); await writeJson(path.join(out,'intake-checklist.json'),{schema_version:1,questions:result.interview});
  const rows=result.plan.sections.map(s=>`## ${s.id}: ${s.copy.headline}\n\n- role: ${s.roles.join(', ')}\n- customer questions: ${s.questions.join(', ')}\n- placement: ${s.placement_reason}\n- facts: ${s.fact_ids.join(', ')||'자료 필요'}\n- evidence: ${s.evidence_ids.join(', ')||'근거 필요'}\n- visual: ${s.visual_direction}\n- media: ${s.media_job_id}\n\n${s.copy.body}\n`).join('\n');
  await fs.writeFile(path.join(out,'production-brief.md'),`# ${brief.product.name}\n\nCategory: ${result.plan.category}; topic: ${result.plan.topic}; style: ${result.plan.style}\n\n${rows}`);
  await fs.writeFile(path.join(out,'legal.md'),brief.legal_text??'[자료 필요: 공식 거래·고시 문구]\n');
  await writeJson(path.join(out,'qa','plan-state.json'),{schema_version:1,copy_approved:false,visual_reviewed:false,publication_status:'blocked'});
}
if(isMain(import.meta)) {
  try{const a=parseArgs(process.argv.slice(2));assert(a.positional.length===1&&a.out,'Usage: compile-page-plan.mjs <product-brief.json> --out <new-directory> [--evidence raw.json] [--style id] [--preset 12|15]');const brief=await readJson(a.positional[0]);const evidence=a.evidence?assessEvidence(brief,await readJson(a.evidence)):undefined;const result=compilePlan(brief,{evidence,style:a.style,preset:a.preset});await writeProject(brief,result,path.resolve(a.out),{sourceRoot:path.dirname(path.resolve(a.positional[0]))});console.log(`Planned ${result.plan.sections.length} sections; ${result.plan.pack_status}; ${result.interview.length} information requests`);}catch(e){console.error(e.message);process.exitCode=1;}
}
