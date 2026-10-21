const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const elements=new Map();const element=id=>{if(!elements.has(id))elements.set(id,{value:'',innerHTML:'',textContent:'',disabled:false,checked:false,addEventListener(){},classList:{add(){},remove(){},toggle(){}}});return elements.get(id)};
const ctx=vm.createContext({console,Intl,Date,Set,Number,String,Array,JSON,Math,CSS:{escape:s=>s},setTimeout(){},clearTimeout(){},document:{getElementById:element,querySelectorAll:()=>[],querySelector:()=>null},window:{scrollTo(){}},confirm:()=>true});
vm.runInContext(fs.readFileSync('dist/data.js','utf8').replace('window.PLANS=','var PLANS='),ctx);
vm.runInContext(fs.readFileSync('dist/app.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
assert.equal(run("PLANS.filter(p=>/^p[0-9]+$/.test(p.id)).length"),61);
assert.equal(run('new Set(PLANS.map(p=>p.id)).size'),run('PLANS.length'));
assert.equal(run("countOf('（合計：20回）映像授業：4回 AI学トレ：8回 自立学習：8回')"),20);
assert.equal(run("countOf('映像8回＋個別8回＋学トレ4回')"),20);
assert.equal(run("countOf('オリジナルプラン')"),null);
assert.equal(run("countOf('個別1.5回')"),null);
assert.equal(run("countOf('個別8回＋映像は要相談')"),null);
assert.equal(run("countOf('個別-8回')"),null);
assert.equal(run("countOf(effective(PLANS.find(p=>p.grade==='中2'&&p.subject==='理科'&&p.kind==='補強')))"),12);
assert.equal(run("countOf(effective(PLANS.find(p=>p.grade==='高2'&&p.subject==='数学'&&p.kind==='強化')))"),12);
assert.equal(run("countOf(effective(PLANS.find(p=>p.grade==='中3'&&p.subject==='理科'&&p.kind==='難関高校')))"),24);
run("state.schoolType='self'");assert.ok(run("effective(PLANS.find(p=>p.grade==='中3'&&p.subject==='英語'&&p.kind==='補強')).includes('自立学習8回')"));
assert.ok(run("effective(PLANS.find(p=>p.grade==='小1'&&p.subject==='作文')).includes('個別指導')"));
for(const g of ['小1','小4','小6','中1','中2','中3','高1','高2','高3']){run(`state.grade='${g}';state.case='foundation';state.subject='すべて';renderResults()`);assert.ok(element('results').innerHTML.length>50);}
run("state.grade='中1';state.schoolType='standard';state.selected=[{id:'p19',title:'test',description:'test',composition:'自立学習8回',goal:'test',reason:'test',price:''}];state.extras='0';state.verified=true;renderPaper()");assert.ok(element('paper').innerHTML.includes('ご提案総額（税込）</span><span>確認中'));
run("state.selected[0].price='13200';state.extras='1000';renderPaper()");assert.ok(element('paper').innerHTML.includes('¥14,200'));
run("state.selected[0].price='-1';renderPaper()");assert.ok(element('paper').innerHTML.includes('ご提案総額（税込）</span><span>確認中'));
run("state.fields.student='<img src=x onerror=alert(1)>';renderPaper()");assert.ok(!element('paper').innerHTML.includes('<img'));
for(const p of run('PLANS')){assert.ok(!p.detail.includes('10.254.'));assert.ok(!p.detail.includes('共有'));}
console.log('PASS: 61 source plans, unique IDs, composition totals, grade-specific counts, school substitution, unknown/negative fees, 14,200 total, HTML escaping, internal path removal.');
