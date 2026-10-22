const fs=require('fs'),assert=require('assert/strict');
const harness=fs.readFileSync('verify-dom.cjs','utf8').split('(async()=>{')[0].replace('setTimeout(){},clearTimeout(){}','setTimeout,clearTimeout');
eval(harness+`
(async()=>{
 const select=(grade,kind,subject)=>run('state.grade='+JSON.stringify(grade)+';state.case='+JSON.stringify(kind)+';state.subject='+JSON.stringify(subject)+';state.selected=[];state.showAll=false;state.fields={};renderFilters();renderResults()');
 select('小2','roots','中学受験');assert.equal(document.querySelectorAll('#results .card').length,1);assert.ok(document.querySelector('#results').textContent.includes('個別設計'));
 select('高3','roots','すべて');
 assert.ok(!document.querySelector('#results').textContent.includes('個別設計'));
 select('高3','practice','すべて');assert.equal(run('state.case'),'practice');run("state.subject='数学';renderFilters();renderResults()");
 assert.equal(document.querySelectorAll('#results .card').length,1);
 assert.ok(document.querySelector('#match-note').textContent.includes('表示条件'));
 select('中3','foundation','英語');run('state.route="recommend";renderResults()');
 assert.equal(document.querySelectorAll('#results .card').length,1);
 assert.ok(document.querySelector('#match-note').textContent.includes('標準プラン'));
 select('小5','practice','算数');assert.ok(document.querySelector('.checks').textContent.includes('速さⅠ・Ⅱは対象外'));
 select('高1','practice','数学');assert.ok(document.querySelector('.checks').textContent.includes('8割'));
 const scenarios=[['小2','roots','作文'],['中2','foundation','理科'],['中3','foundation','国語'],['高2','practice','数学']];
 fs.mkdirSync('output/pdf',{recursive:true});
 for(const [grade,mode,subject] of scenarios){
  select(grade,mode,subject);run('state.route="general";renderResults()');
  const id=document.querySelector('#results [data-add]').dataset.add;
  await run('addPlan('+JSON.stringify(id)+')');
  run('state.fields={student:"見本（架空の生徒）",school:"サンプル校",teacher:"担当者",message:"ご本人の希望を伺い、今回の学習内容と目標を一緒に決めるためのご提案です。",goal:"選んだ内容に取り組み、できたことと続ける課題を確認します。",period:"冬休み（日程は相談）"};state.coach.evidence="PRIVATE_EMPLOYEE_NOTE";renderProposal()');
  const model=run('parentPDFModel()');
  assert.ok(!JSON.stringify(model).includes('PRIVATE_EMPLOYEE_NOTE'));
  assert.equal(model.totalLabel,undefined);
  if(grade==='中2')assert.ok(model.countLabel.startsWith('12授業枠'));
  if(grade==='小2')assert.ok(model.countLabel.startsWith('8授業枠'));
  if(grade==='中3')assert.ok(model.countLabel.startsWith('20授業枠'));
  if(grade==='高2')assert.ok(model.countLabel.startsWith('12授業枠'));
  const result=await run('WinterPDF.create(parentPDFModel())');
  const text=result.audit.map(a=>a.text).join('');
  assert.ok(text.includes('なぜ、この冬に'));
  for(const a of result.audit){assert.ok(a.bottom>=27);assert.ok(a.x+a.width<=570);assert.ok(a.top<=790);}
  fs.writeFileSync('output/pdf/再検証_'+grade+'_'+subject+'.pdf',result.bytes);
  console.log('PDF',grade,subject,result.pageCount,'pages');
 }
 console.log('PASS: grade/route/purpose filters, visible scope and prerequisites, four parent PDFs, counts, unknown fees and private-note exclusion');
})().catch(e=>{console.error(e);process.exitCode=1});
`);


