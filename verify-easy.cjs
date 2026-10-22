const fs=require('fs');
const harness=fs.readFileSync('verify-dom.cjs','utf8').split('(async()=>{')[0];
eval(harness+`
(async()=>{
 run("state.grade='中2';state.subject='英語';renderFilters();renderResults()");
 await run("addPlan(PLANS.find(p=>p.grade==='中2'&&p.subject==='英語'&&p.kind==='補強').id)");run('renderProposal()');
 assert.equal(run('state.fields.goalMode'),'auto');assert.equal(run('FAMILY_MESSAGES.length'),5);
 assert.ok(run('state.fields.goal').includes('英語 補強'));assert.ok(run('state.fields.goal').includes(run('state.selected[0].goal')));
 run("state.subject='理科';renderFilters();renderResults()");await run("addPlan(PLANS.find(p=>p.grade==='中2'&&p.subject==='理科'&&p.kind==='補強').id)");run('renderProposal()');
 assert.ok(run('state.fields.goal').includes('理科 補強'));
 run("state.selected[0].goal='選択講座に連動した目標';renderPaper()");assert.ok(run('state.fields.goal').includes('選択講座に連動した目標'));
 const selector=document.getElementById('family-message-choice');for(const id of ['together','basics','practice','next','confidence']){selector.value=id;selector.dispatchEvent(new window.Event('change'));assert.equal(run('parentPDFModel().fields.message'),document.getElementById('family-message-preview').textContent);}
 const message=document.getElementById('message');message.value='個別に調整した文章';message.dispatchEvent(new window.Event('input',{bubbles:true}));assert.equal(run('state.fields.messageChoice'),'custom');assert.equal(run('parentPDFModel().fields.message'),'個別に調整した文章');
 document.getElementById('link-winter-goal').checked=false;document.getElementById('link-winter-goal').dispatchEvent(new window.Event('change'));const goal=document.getElementById('goal');goal.value='手入力した目標';goal.dispatchEvent(new window.Event('input',{bubbles:true}));run("state.selected[0].goal='別の目標';renderProposal()");assert.equal(run('state.fields.goal'),'手入力した目標');
 document.getElementById('link-winter-goal').checked=true;document.getElementById('link-winter-goal').dispatchEvent(new window.Event('change'));assert.ok(run('state.fields.goal').includes('別の目標'));
 run("state.selected[0].price='99999';state.extras='12345';state.verified=true;renderProposal()");
 assert.ok(!document.getElementById('paper').textContent.includes('99,999'));assert.ok(!document.getElementById('paper').textContent.includes('受講料'));assert.ok(!document.getElementById('paper').textContent.includes('総額'));
 assert.ok(!run('parentDocumentHTML()').includes('99,999'));assert.equal(run('parentPDFModel().feeDetails'),undefined);assert.equal(run('parentPDFModel().totalLabel'),undefined);
 document.getElementById('save').click();run('reset()');document.getElementById('restore').click();assert.equal(run('state.fields.goalMode'),'auto');assert.equal(run('state.fields.messageChoice'),'custom');assert.equal(run('state.fields.message'),'個別に調整した文章');
 const legacy=JSON.parse(fs.readFileSync('samples/sample-data.json','utf8')).state;ctx.legacyData=legacy;run('applyPlanState(validatedPlanState(legacyData))');assert.equal(run('state.fields.goal'),legacy.fields.goal);assert.equal(run('state.fields.message'),legacy.fields.message);assert.equal(run('state.fields.goalMode'),'custom');
 run('reset();renderProposal()');assert.equal(run('state.fields.messageChoice'),'together');assert.equal(run('state.fields.goal'),'');
 console.log('PASS: linked course goals, five family messages, custom edits, reset, legacy text, persistence, no fees in parent outputs.');
})().catch(e=>{console.error(e);process.exitCode=1});
`);
