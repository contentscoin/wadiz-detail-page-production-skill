// Mechanical end-to-end fixture only. These shapes are not product assets.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { compilePlan, writeProject } from '../compile-page-plan.mjs';
import { validateProject } from '../validate-page-plan.mjs';
import { buildMotionCut } from '../media/motion.mjs';
import { buildDeliveryPackage } from '../media/delivery.mjs';
import { writeJson } from '../lib/contracts.mjs';
const root=path.resolve(process.argv[2]??'../../output/integration-demo');
if(await fs.stat(root).catch(()=>null)) throw new Error('Fixture output exists; choose a fresh directory');
await fs.mkdir(root,{recursive:true});
const frames=[];
for(let i=0;i<3;i++){
  const file=path.join(root,`fixture-${i}.png`);
  await sharp(Buffer.from(`<svg width="640" height="400"><rect width="640" height="400" fill="#f3f1ed"/><text x="35" y="65" font-size="28" font-family="sans-serif">PIPELINE TEST FIXTURE</text><circle cx="${150+i*140}" cy="240" r="55" fill="#246c81"/></svg>`)).png().toFile(file);frames.push(file);
}
const brief={schema_version:1,product:{name:'파이프라인 검증용 가상 상품',category:'living',topic:'gift',target_customer:'테스트 사용자',sku:'TEST',options:[]},facts:[],assets:[{id:'test',file:frames[0],truth_level:'reference_only'}],unknowns:['실제 판매 상품이 아닌 검증용 도형'],legal_text:'## 테스트용 조건\n\n이 파일은 파이프라인 검증용 예제입니다. 실제 판매 조건은 포함하지 않습니다.\n'};
const result=compilePlan(brief),project=path.join(root,'project');
// Exercise assembly with local fixture assets, not a generated-model result.
result.jobs.jobs=result.jobs.jobs.map(j=>({...j,truth_level:'actual_asset',fixture_only:true,...(j.kind==='gif'?{motion:{...j.motion,source_type:'verified_images'},frame_jobs:undefined}:{})}));
await writeProject(brief,result,project,{sourceRoot:root});
const qa=await validateProject(project);await writeJson(path.join(project,'qa','plan-qa.json'),qa);
if(qa.errors.length) throw new Error(`Unexpected fixture plan error: ${JSON.stringify(qa.errors)}`);
const motion=await buildMotionCut({id:'fixture-motion',frames,source_type:'verified_images',purpose:'explainer',width:640,fps:4},{baseDir:root,outDir:path.join(project,'motion')});
const media=result.plan.sections.map(s=>({job_id:s.media_job_id,status:'complete',kind:s===result.plan.sections.find(x=>result.jobs.jobs.find(j=>j.id===x.media_job_id)?.kind==='gif')?'gif':'image',file:frames[0],truth_level:'actual_asset',qa:{copy_reviewed:false,visual_reviewed:false,product_identity_reviewed:false}}));
const gif=media.find(m=>m.kind==='gif');gif.file=path.join(project,'motion','fixture-motion.gif');gif.poster=path.join(project,'motion','fixture-motion.poster.png');gif.truth_level='verified_images';gif.qa.loop_reviewed=false;
await writeJson(path.join(project,'media-results.json'),{schema_version:1,results:media});
const manifest=await buildDeliveryPackage(project,{outDir:path.join(root,'delivery')});
if(manifest.publication_status==='ready') throw new Error('Test fixture must remain blocked for publication');
console.log(JSON.stringify({fixture_only:true,project,delivery:path.join(root,'delivery'),sections:manifest.sections.length,gif:motion.qa,publication_status:manifest.publication_status},null,2));
