'use strict';
// Keep the everyday path short; retain staff tools as optional disclosure.
document.body.classList.add('simple-ui');
const staffTools=document.createElement('details');staffTools.className='staff-tools';staffTools.innerHTML='<summary>必要に応じて：生徒の状況・予算・面談のヒント</summary>';
document.querySelector('.subjectline').after(staffTools);
for(const el of [diagnosis,interview,resultControls])staffTools.append(el);
const simpleFilters=renderFilters;renderFilters=function(){
 if(['小1','小2','小3'].includes(state.grade)&&state.case!=='roots'){state.case='roots';coachProfile().need='roots';}
 if(state.grade==='高3'&&['practice','ahead'].includes(state.case))state.case='foundation';
 simpleFilters();
 const labels={foundation:[state.grade==='中3'?'入試対策':state.grade==='高3'?'受験・個別設計':'補強','基本を固めたい'],practice:['強化','演習で力を伸ばしたい'],roots:[state.grade.startsWith('小')?'力・作文':'力の講座','読む・考える・英語・表現']};
 $('cases').innerHTML=Object.entries(labels).filter(([key])=>!((['小1','小2','小3'].includes(state.grade)&&key!=='roots')||(['中3','高3'].includes(state.grade)&&key==='practice'))).map(([key,[name,sub]])=>`<button class="case ${state.case===key||(key==='practice'&&state.case==='ahead')?'selected':''}" data-case="${key}" aria-pressed="${state.case===key||(key==='practice'&&state.case==='ahead')}"><b>${name}</b><small>${sub}</small></button>`).join('');
 $('route').closest('label').hidden=state.grade!=='中3'||state.case==='roots';
 const target=state.case==='roots';
 const subjects=['すべて',...new Set(PLANS.filter(p=>p.grade===state.grade&&(target?(['力シリーズ','作文'].includes(p.kind)||p.subject==='中学受験'):!['力シリーズ','作文'].includes(p.kind))).map(p=>p.subject))];
 if(!subjects.includes(state.subject))state.subject='すべて';
 $('subjects').innerHTML=subjects.map(s=>`<button class="chip ${s===state.subject?'selected':''}" data-subject="${s}" aria-pressed="${s===state.subject}">${s}</button>`).join('');
 $('route').querySelector('option[value="general"]').textContent='入試の基礎補強';
 document.querySelector('.question').textContent='この冬、取り組みたいこと';
};
const simpleResults=renderResults;renderResults=function(){simpleResults();document.querySelectorAll('#results .card').forEach(card=>{
 const p=planById(card.querySelector('[data-add]').dataset.add),body=card.querySelector('.card-body'),details=card.querySelector('details');
 card.querySelector('h3').textContent=p.subject+' '+((p.kind==='力シリーズ'||p.subject===p.kind)?'':p.kind==='オリジナル'?'個別設計':p.kind);
 card.querySelector('.eyebrow').textContent=p.grade+' / '+(p.id.startsWith('force-')?'開講対象は校舎で確認':'冬期講座');
 const note=curriculumNote(p);if(note){const el=document.createElement('p');el.className='curriculum-note';el.textContent=note;card.querySelector('.badge').after(el);}
 details.querySelector('summary').textContent='学習内容・教材・提案のポイントを見る';
 for(const el of [body.querySelector('.desc'),body.querySelector('.goal'),card.querySelector('.explain-button')])if(el)details.append(el);
 });
 $('result-title').textContent=state.grade+'の冬期講座の候補';
 if(state.grade==='中3'&&state.case!=='roots'&&state.route==='recommend')$('match-note').textContent='私立推薦用は英語・数学・国語の3教科。理科・社会の専用プランは要綱に記載がありません。';
 if(state.grade==='高3'&&state.case!=='roots')$('match-note').textContent='高3は英語・数学ともオリジナルプラン。回数・教材・授業形式を面談で決めます。';
};
const simpleCSS=document.createElement('style');simpleCSS.textContent=`
.simple-ui .hero{min-height:280px;padding-top:24px;padding-bottom:24px}.simple-ui .hero h1{font-size:46px}.simple-ui .hero .intro{font-size:15px}.simple-ui .hero .linkbutton{min-height:48px;font-size:15px}.simple-ui .hero .winter-art{bottom:16px}
.simple-ui .sectionhead{margin-bottom:16px}.simple-ui .sectionhead h2{font-size:30px}.simple-ui .profilebar{padding:20px 24px}.simple-ui .profilebar label[hidden]{display:none}.simple-ui .cases{display:flex;gap:12px}.simple-ui .case{flex:1;padding:15px;text-align:left;min-height:0}.simple-ui .case b{font-size:18px}.simple-ui .case small{margin-top:4px}.simple-ui .question{margin-top:22px}
.curriculum-note{font-size:12px;line-height:1.8;padding:10px 12px;background:#edf5fa;border-radius:8px;color:#345971}.staff-tools{border:1px solid #cbdfea;background:#ffffffb8;border-radius:14px;margin:20px 0;padding:14px 20px}.staff-tools>summary{cursor:pointer;color:#496b83;font-size:13px}.staff-tools .diagnosis{margin-top:16px}.staff-tools .interview{margin:16px 0}.simple-ui .resulthead{margin-top:25px}.simple-ui .card h3{font-size:23px;margin:8px 0 14px}.simple-ui .card .reason{font-size:13px;line-height:1.8;margin:16px 0}.simple-ui .card .reason b{font-size:11px;color:#5a7b93}.simple-ui .card details{font-size:12px}.simple-ui .card .card-bottom{padding-top:10px}.simple-ui .card-body{padding:22px}.simple-ui .card .explain-button{display:block;margin-top:14px}.simple-ui .result-controls{margin:16px 0 0}
@media(max-width:760px){.simple-ui .hero{min-height:300px;padding:24px 22px 65px}.simple-ui .hero h1{font-size:31px}.simple-ui .hero .intro{font-size:12px}.simple-ui .hero .linkbutton{font-size:13px}.simple-ui .cases{gap:7px}.simple-ui .case{padding:11px 8px}.simple-ui .case b{font-size:16px}.simple-ui .case small{font-size:10px}.simple-ui .sectionhead h2{font-size:25px}.staff-tools{padding:13px}.simple-ui .profilebar{padding:16px}}
@media print{.staff-tools{display:none!important}}
`;document.head.append(simpleCSS);
renderFilters();renderResults();


