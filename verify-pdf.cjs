const fs=require('fs'),assert=require('assert/strict');
fs.mkdirSync('output/pdf',{recursive:true});
const harness=fs.readFileSync('verify-dom.cjs','utf8').split('(async()=>{')[0].replace('setTimeout(){},clearTimeout(){}','setTimeout,clearTimeout');
eval(harness+`
(async()=>{
 const sample=JSON.parse(fs.readFileSync('samples/sample-data.json','utf8')).state;
 run('Object.assign(state,'+JSON.stringify(sample)+');renderProposal()');
 const model=run('parentPDFModel()');
 assert.equal(model.courses.length,2);assert.equal(model.countLabel,'合計16回');
 const generate=async(m)=>{ctx.testModel=JSON.parse(JSON.stringify(m));return await run('WinterPDF.create(testModel)');};
 const result=await generate(model);
 fs.writeFileSync('output/pdf/アプリ出力_保護者向けサンプル.pdf',result.bytes);
 assert.equal(result.pageCount,4,'same sample must be four pages');
 assert.ok(result.audit.some(x=>x.page===3&&x.text.includes('使える算数')));
 assert.ok(result.audit.some(x=>x.page===4&&x.text.includes('書ける漢字')));
 const content=result.audit.map(x=>x.text).join('');assert.ok(content.includes('確認中'));assert.ok(content.includes('サンプル校'));
 function bounds(r){for(const a of r.audit){assert.ok(a.bottom>=27,'footer/content beyond page');assert.ok(a.x+a.width<=570,'text extends beyond page');assert.ok(a.top<=790);}}
 bounds(result);
 const noMeaning=JSON.parse(JSON.stringify(model));noMeaning.includeMeaning=false;
 assert.equal((await generate(noMeaning)).pageCount,2);
 const long=JSON.parse(JSON.stringify(model));long.fields.message='丁寧に振り返りながら学びます。'.repeat(95)+'【末尾メッセージ】';long.courses[0].meaningNow='学習の意義を確認します。'.repeat(120)+'【末尾意義】';long.courses=Array.from({length:5},(_,i)=>({...long.courses[i%2],title:'講座'+i}));
 const overflow=await generate(long);bounds(overflow);assert.ok(overflow.pageCount>7);const all=overflow.audit.map(x=>x.text).join('');assert.ok(all.includes('【末尾メッセージ】'));assert.ok(all.includes('【末尾意義】'));
 fs.writeFileSync('output/pdf/検証用_長文複数講座.pdf',overflow.bytes);
 run("state.selected.forEach(x=>x.price='12000');state.extras='1000';state.verified=true;state.coach.evidence='非公開社員メモ';state.selected[0].meaningNow='個別編集した冬の理由'");
 const priced=run('parentPDFModel()');assert.ok(priced.totalLabel.includes('25,000'));assert.ok(!JSON.stringify(priced).includes('非公開社員メモ'));assert.equal(priced.courses[0].meaningNow,'個別編集した冬の理由');
 const invalid=JSON.parse(JSON.stringify(model));invalid.fields.student='未対応🦄';await assert.rejects(()=>generate(invalid),/PDFに使えない文字/);
 const none=JSON.parse(JSON.stringify(model));none.courses=[];await assert.rejects(()=>generate(none),/講座を選んで/);
 run('Object.assign(state,'+JSON.stringify(sample)+');renderProposal()');
 document.getElementById('print').click();
 assert.equal(document.getElementById('print').disabled,true);
 for(let i=0;i<200&&document.getElementById('print').disabled;i++)await new Promise(r=>setTimeout(r,100));
 assert.equal(document.getElementById('pdf-preview').hidden,false);
 assert.ok(document.getElementById('pdf-save').href.startsWith('blob:'));
 assert.ok(document.getElementById('pdf-summary').textContent.includes('4ページ'));
 assert.equal(document.getElementById('pdf-status').dataset.error,'false');
 fs.writeFileSync('output/pdf/layout-audit.json',JSON.stringify(result.audit,null,2));
 console.log('PASS: same app PDF engine, sample 4 pages, optional handouts, long text, five courses, fees, edited meaning, private-note exclusion, overflow bounds and unsupported glyph handling.');
})().catch(e=>{console.error(e);process.exitCode=1});
`);
