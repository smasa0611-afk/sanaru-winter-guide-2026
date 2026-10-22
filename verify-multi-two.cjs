const fs=require('fs');const harness=fs.readFileSync('verify-dom.cjs','utf8').split('(async()=>{')[0].replace('setTimeout(){},clearTimeout(){}','setTimeout,clearTimeout');
eval(harness+`(async()=>{
run("state.grade='中2';state.subject='英語';renderFilters();renderResults()");
for(const sub of ['英語','数学','理科','社会','国語'])await run('addPlan(PLANS.find(p=>p.grade==="中2"&&p.subject==='+JSON.stringify(sub)+'&&p.kind==="補強").id)');
run("state.fields={student:'冬の学び サンプル',school:'サンプル校',messageChoice:'basics',goalMode:'auto'};renderProposal()");
const model=run('parentPDFModel()');
for(const n of [1,3,5]){ctx.m={...model,courses:model.courses.slice(0,n)};ctx.m.countLabel=run('lessonCountLabel(m.courses)');const r=await run('WinterPDF.create(m)');assert.equal(r.pageCount,2);for(const a of r.audit){assert.ok(a.bottom>=27);assert.ok(a.top<=790);assert.ok(a.x+a.width<=570);}for(const c of ctx.m.courses)assert.ok(r.audit.some(a=>a.text.includes(c.title)));fs.writeFileSync('output/pdf/冬期講座_'+n+'講座_2枚.pdf',r.bytes);console.log('PASS',n,'courses: 2 pages');}
const long=JSON.parse(JSON.stringify(model));long.fields.message='長い文章です。'.repeat(400);long.courses.forEach(c=>c.meaningNow='この冬に学ぶ意義です。'.repeat(400));ctx.m=long;const r=await run('WinterPDF.create(m)');assert.equal(r.pageCount,2);assert.ok(r.audit.every(a=>a.bottom>=27&&a.top<=790));console.log('PASS long text summarized without extra pages');
})().catch(e=>{console.error(e);process.exitCode=1});`);
