const boot=require('fs').readFileSync('verify-dom.cjs','utf8').split('(async()=>{')[0];
eval(boot+`(async()=>{
const click=s=>{const el=document.querySelector(s);assert.ok(el,s);el.click();};
const begin=(g,s,n)=>{if(document.querySelector('[data-restart]'))click('[data-restart]');click('[data-start]');click('[data-answer="'+g+'"]');click('[data-answer="'+s+'"]');if(n){click('[data-answer="'+n+'"]');click('[data-answer="休み明けの授業に自信を持ちたい"]');}};
const choose=(field,value)=>{const el=document.querySelector('[data-field="'+field+'"]');assert.ok(el,field);el.value=value;el.dispatchEvent(new window.Event('change',{bubbles:true}));};
const id=(g,s,k)=>run('PLANS.find(p=>p.grade==='+JSON.stringify(g)+'&&p.subject==='+JSON.stringify(s)+'&&p.kind==='+JSON.stringify(k)+').id');
begin('小2','読書の力','力シリーズ');assert.ok(document.querySelector('#winter-diagnosis').textContent.includes('まだ確定していません'));choose('count','8');click('[data-course="'+id('小2','読書の力','力シリーズ')+'"]');assert.equal(run('WinterDiagnosis.ready()'),true);assert.ok(run('WinterDiagnosis.summary()').includes('8回'));console.log('PASS 小2 読書8回');
begin('小5','算数','補強');click('[data-course="'+id('小5','算数','補強')+'"]');assert.equal(run('WinterDiagnosis.ready()'),true);assert.ok(document.querySelector('#winter-diagnosis').textContent.includes('どんな学び方'));console.log('PASS 小5 算数');
begin('中3','社会','補強');choose('prior','Ⅰ・Ⅱ');choose('theme','Ⅲ＋Ⅳ');click('[data-course="'+id('中3','社会','補強')+'"]');assert.equal(run('WinterDiagnosis.ready()'),true);choose('theme','Ⅰ＋Ⅳ');assert.equal(run('WinterDiagnosis.ready()'),false);assert.ok(run('WinterDiagnosis.summary()').includes('重複'));console.log('PASS 中3 社会・複数既受講と重複');
begin('高1','英語','強化');click('[data-course="'+id('高1','英語','強化')+'"]');assert.equal(run('WinterDiagnosis.ready()'),false);choose('textbook','ファーストステップ');assert.equal(run('WinterDiagnosis.ready()'),true);console.log('PASS 高1 英語・教材未確認/選択');
begin('高2','数学','強化');assert.equal(document.querySelector('[data-course="'+id('高2','数学','強化')+'"]').disabled,true);click('[data-course="'+id('高2','数学','補強')+'"]');assert.equal(run('WinterDiagnosis.ready()'),true);console.log('PASS 高2 数学・未確定区分と選択できる区分');
begin('高3','数学');assert.equal(run('WinterDiagnosis.answers.step'),5);assert.equal(run('WinterDiagnosis.answers.basket.length'),0);assert.ok(document.querySelector('#winter-diagnosis').textContent.includes('現在は選択できません'));console.log('PASS 高3 未確定講座は質問を省略し理由を表示');
begin('小2','作文');assert.equal(run('WinterDiagnosis.answers.step'),5);console.log('PASS 小2 作文・未確定を先に明示');
})().catch(e=>{console.error(e);process.exit(1)});`);
