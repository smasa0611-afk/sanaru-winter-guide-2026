const fs=require('fs'),assert=require('assert/strict');
const harness=fs.readFileSync('verify-dom.cjs','utf8').split('(async()=>{')[0];
eval(harness+`
(async()=>{
 assert.equal(document.querySelector('.staff-tools').hasAttribute('open'),false);
 assert.equal(document.querySelectorAll('#cases button').length,3);
 assert.ok(document.querySelector('#route').closest('label').hidden);
 assert.ok(document.querySelector('#results .desc').closest('details'));
 const sample=JSON.parse(fs.readFileSync('samples/sample-data.json','utf8')).state;
 ctx.sampleInput=sample;const checked=run('validatedPlanState(sampleInput)');
 assert.equal(checked.selected.length,2);assert.equal(checked.grade,'小5');
 for(const mutate of [s=>s.case='missing',s=>s.selected[0].composition=null,s=>s.fields=null,s=>s.selected[0].id='p52',s=>s.selected.push(s.selected[0]),s=>s.coach.need='invalid',s=>s.verified='true',s=>s.selected[0].price=null,s=>s.fields.message={}]){
  const bad=JSON.parse(JSON.stringify(sample));mutate(bad);ctx.badInput=bad;
  const before=run('JSON.stringify(state)');assert.throws(()=>run('validatedPlanState(badInput)'));assert.equal(run('JSON.stringify(state)'),before);
 }
 assert.equal(run('validMoney(null)'),false);assert.equal(run('validMoney(false)'),false);assert.equal(run("validMoney('   ')"),false);assert.equal(run('validMoney(0)'),true);
 run("state.grade='小5';state.case='roots';state.subject='すべて';state.selected=[];renderFilters();renderResults()");
 const force=run("PLANS.find(p=>p.grade==='小5'&&p.subject==='閃きの力')");
 const picker=document.querySelector('[data-count="'+force.id+'"]');assert.equal(picker.value,'8');picker.value='12';
 await run('addPlan('+JSON.stringify(force.id)+')');assert.equal(run('countOf(state.selected[0].composition)'),12);
 run("state.selected=[];state.grade='中3';state.case='roots';state.subject='すべて';renderFilters();renderResults()");
 assert.ok(document.querySelector('#route').closest('label').hidden);
 for(const b of document.querySelectorAll('#results [data-add]'))assert.equal(run('planById('+JSON.stringify(b.dataset.add)+').kind'),'力シリーズ');
 run("state.grade='小1';state.case='foundation';renderFilters();renderResults()");assert.ok(document.querySelectorAll('#results .card').length>0);
 assert.ok(run("COACH.explain(PLANS.find(p=>p.grade==='中3'&&p.subject==='英語'&&p.kind==='補強')).reason").includes('入試テーマ'));
 // Exercise every plan in both school types without rendering incompatible state.
 for(const p of run('PLANS'))for(const school of ['standard','self']){
  run('state.grade='+JSON.stringify(p.grade)+';state.schoolType='+JSON.stringify(school)+';state.selected=[];state.fields={};state.case="roots";state.showAll=true;state.subject="すべて";renderFilters();renderResults()');
  const copy=run('copyFor(planById('+JSON.stringify(p.id)+'))');assert.ok(copy.desc&&copy.goal,p.id);
  const m=run('WINTER_MEANING.get(planById('+JSON.stringify(p.id)+'),{composition:effective(planById('+JSON.stringify(p.id)+')),description:"個別設計"})');assert.ok(m.now&&m.after&&m.approach,p.id);
 }
 // Web entry uses linked CSS; exported HTML must still embed its illustration.
 for(const style of [...document.querySelectorAll('style')])if(style.textContent.includes('--winter-scene:'))style.remove();
 assert.ok(run('parentDocumentHTML()').includes('data:image/jpeg;base64,'));
 console.log('PASS: compact selection UI, every plan/school type, exact power-course options, middle-school entrance copy, atomic validation, empty fees and portable web HTML.');
})().catch(e=>{console.error(e);process.exitCode=1});
`);

