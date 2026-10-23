const boot=require('fs').readFileSync('verify-dom.cjs','utf8').split('(async()=>{')[0];
eval(boot+`(async()=>{
const click=s=>document.querySelector(s).click();
click('[data-start]');click('[data-answer="中2"]');click('[data-answer="英語"]');click('[data-answer="補強"]');click('[data-answer="テストで学んだことを発揮したい"]');
const en=run("PLANS.find(p=>p.grade==='中2'&&p.subject==='英語'&&p.kind==='補強').id");click('[data-course="'+en+'"]');
click('[data-more]');click('[data-answer="理科"]');click('[data-answer="強化"]');click('[data-answer="休み明けの授業に自信を持ちたい"]');
const sc=run("PLANS.find(p=>p.grade==='中2'&&p.subject==='理科'&&p.kind==='強化').id");click('[data-course="'+sc+'"]');
assert.equal(run('WinterDiagnosis.answers.basket.length'),2);assert.equal(run('WinterDiagnosis.answers.profiles.英語.need'),'補強');assert.equal(run('WinterDiagnosis.answers.profiles.理科.need'),'強化');
click('[data-review]');assert.equal(document.querySelectorAll('.enrollment-review').length,2);assert.ok(document.querySelector('#winter-diagnosis').textContent.includes('まだ申し込みは送信されていません'));assert.ok(!document.querySelector('#winter-diagnosis').textContent.includes('体験'));
click('[data-course="'+en+'"]');assert.equal(run('WinterDiagnosis.answers.basket.length'),1);assert.ok(run('WinterDiagnosis.summary()').includes('理科 強化'));
assert.ok(run("WinterDiagnosis.blocked(PLANS.find(p=>p.grade==='高3'&&p.subject==='数学'))"));
run("WinterDiagnosis.answers.grade='中3'");const social=run("PLANS.find(p=>p.grade==='中3'&&p.subject==='社会'&&p.kind==='補強').id");run('WinterDiagnosis.answers.options['+JSON.stringify(social)+']={prior:"Ⅰ",theme:"Ⅰ＋Ⅳ"}');assert.ok(run('WinterDiagnosis.issues(planById('+JSON.stringify(social)+')).some(x=>x.includes("重複"))'));
run('WinterDiagnosis.answers.options['+JSON.stringify(social)+']={prior:"Ⅰ",theme:"Ⅱ＋Ⅳ"}');assert.equal(run('WinterDiagnosis.issues(planById('+JSON.stringify(social)+')).length'),0);
click('[data-restart]');assert.equal(run('WinterDiagnosis.answers.basket.length'),0);assert.equal(run('WinterDiagnosis.answers.grade'),'');
console.log('PASS: multi-subject selection, independent answers, review/remove, no trial CTA, source constraints, theme overlap, reset');
})().catch(e=>{console.error(e);process.exit(1)});`);
