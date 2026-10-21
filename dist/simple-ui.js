'use strict';
document.body.classList.add('simple-ui','selection-v3');
document.querySelector('.hero h1').textContent='この子に合う冬を、教科ごとに。';
document.querySelector('.hero .intro').textContent='候補を比べる → 仮選択 → 条件を確かめる → ご家庭への提案へ。';
document.querySelector('.hero .linkbutton').textContent='教科を選ぶ ↓';
const subjectLine=document.querySelector('.subjectline');
document.querySelector('.question').before(subjectLine);
document.querySelector('.question').textContent='候補の表示条件（生徒の情報は変更しません）';
const staffTools=document.createElement('details');staffTools.className='staff-tools';staffTools.innerHTML='<summary>生徒の状況を確認する（教科別）</summary>';subjectLine.after(staffTools);staffTools.append(diagnosis,interview);
diagnosis.querySelector('h3').textContent='この教科の状況';
diagnosis.insertAdjacentHTML('beforeend','<label>今回の重点課題<input id="subject-focus" maxlength="1000"></label><label>この教科の講座を選んだ理由<textarea id="subject-reason" rows="2" maxlength="1000"></textarea></label><p class="muted">重点課題・理由は選択中の同じ教科にも反映します。社員用メモは保護者資料に出しません。</p>');
const common=document.createElement('details');common.className='common-tools';common.innerHTML='<summary>共通情報：通える回数・予算・社員用メモ</summary><p>予算との差は講座料金・教材費を入力した後に確認できます。回数の合計は授業枠数で、通塾日数ではありません。</p>';
document.querySelector('.profilebar').after(common);
for(const k of ['capacity','budget','evidence'])common.append($(k).closest('label'));
$('evidence').closest('label').firstChild.textContent='共通メモ（社員用）';
const legacy=document.createElement('p');legacy.id='legacy-notes';legacy.className='legacy-notes';common.append(legacy);
document.querySelector('.resulthead').after(resultControls);
resultControls.querySelector('label').lastChild.textContent=' この教科のプランを比較する（全区分）';
resultControls.insertAdjacentHTML('afterbegin','<button id="matched-mode" class="secondary">条件に合う候補を見る</button>');
$('matched-mode').onclick=()=>{state.showAll=false;$('show-all').checked=false;renderResults();};
const filtersBeforeSelection=renderFilters;
renderFilters=function(){
 filtersBeforeSelection();
 const subject=subjectProfile(),all=state.subject==='すべて';
 for(const k of ['need','readiness','prior']){$(k).value=subject[k];$(k).disabled=all;}
 $('subject-focus').value=subject.focus;$('subject-reason').value=subject.reason;$('subject-focus').disabled=all;$('subject-reason').disabled=all;
 diagnosis.querySelector('h3').textContent=all?'教科を選ぶと、教科別の状況を入力できます':state.subject+'の状況';
 for(const k of ['capacity','budget','evidence'])$(k).value=state.coach[k]||'';
 $('legacy-notes').textContent=state.legacyNotes||'';$('legacy-notes').hidden=!state.legacyNotes;
 const labels={foundation:state.grade==='中3'?'入試対策':state.grade==='高3'?'個別設計':'補強',practice:'強化',roots:'力・作文'};
 $('cases').innerHTML=Object.entries(labels).filter(([key])=>!(['中3','高3'].includes(state.grade)&&key==='practice')).map(([key,label])=>`<button class="case ${state.case===key?'selected':''}" data-case="${key}" aria-pressed="${state.case===key}">${label}</button>`).join('');
 $('route').closest('label').hidden=state.grade!=='中3'||state.case==='roots';
 $('route').querySelector('option[value="general"]').textContent='補強（～中堅公立高校）';
 $('show-all').checked=state.showAll;updateCoachLead();
};
function candidates(){
 const query=$('search').value.trim().toLowerCase();const subject=state.subject;
 if(subject==='すべて'&&!state.showAll&&!query)return [];
 let items=PLANS.filter(p=>p.grade===state.grade&&(subject==='すべて'||p.subject===subject));
 if(query)return items.filter(p=>(p.subject+p.kind+p.detail).toLowerCase().includes(query));
 if(state.showAll)return items;
 const kind=state.case==='roots'?'力シリーズ':state.grade==='中3'?({general:'補強',recommend:'私立推薦',advanced:'難関高校'}[state.route]):cases.find(c=>c.id===state.case).kind;
 return items.filter(p=>p.kind===kind||(state.case==='roots'?['作文','オリジナル'].includes(p.kind):['力シリーズ','作文','オリジナル'].includes(p.kind)));
}
renderResults=function(){
 const list=candidates();$('result-title').textContent=state.grade+'・'+(state.subject==='すべて'?'教科を選んで比較':state.subject+'の候補');
 $('match-note').textContent=state.subject==='すべて'&&!state.showAll&&!$('search').value?'まず取り組みたい教科を選んでください。状況が未確認でも仮選択できます。':list.length+'件／'+(state.showAll?'同じ教科の全区分を比較中':'表示条件で抽出中')+'。区分は単純な難易度の上下ではありません。';
 if(state.grade==='中3'&&state.route==='recommend'&&!state.showAll)$('match-note').textContent+=' 私立推薦用の理科・社会は要綱に標準プランの記載がありません。受講不可という意味ではありません。';
 $('results').innerHTML=list.map(p=>{
  const copy=copyFor(p),info=COACH.explain({...p,composition:effective(p)},profileFor(p.subject)),selected=state.selected.some(x=>x.id===p.id),note=curriculumNote(p);
  return `<article class="card"><div class="card-body"><p class="eyebrow">${esc(p.grade)} / ${esc(p.kind)}</p><h3>${esc(p.subject+(p.subject===p.kind?'':' '+p.kind))}</h3><p class="course-purpose"><b>目的</b>${esc(coursePurpose(p))}</p><p class="desc"><b>主な学習内容</b>${esc(copy.desc)}</p><p class="materials"><b>使用教材</b>${esc(courseMaterials(p))}</p><p class="composition"><b>授業形式と回数</b>${esc(effective(p))}</p>${p.variable?`<label>${esc(p.subject)}の受講回数<select data-count="${p.id}">${[4,8,12,16,20].map(n=>`<option value="${n}" ${n===countOf(effective(p))?'selected':''}>${n}回</option>`).join('')}</select></label>`:''}<div class="checks"><b>${esc(info.fit)}</b><p>${esc(info.fit==='優先候補'?'入力した状況：'+COACH.profiles[profileFor(p.subject).need].name:'選ぶ前に確認したいこと')}</p>${note?'<p>'+esc(note)+'</p>':''}<ul>${info.checks.map(c=>'<li>'+esc(c)+'</li>').join('')}</ul></div><details><summary>要綱の原文・参照セル／面談のヒント</summary><p>確定Excel：${esc(p.source)}</p><div class="detailtext">${esc(p.detail)}</div><p>提案例：${esc(info.reason)}</p><button type="button" class="textbtn" data-talk="${p.id}">面談での伝え方を見る</button></details></div><div class="card-bottom"><button class="${selected?'secondary':'primary'}" data-add="${p.id}" ${selected?'disabled':''}>${selected?'✓ 仮選択済み':'この講座を仮選択 ＋'}</button></div></article>`;
 }).join('')||'<p class="empty">教科・区分を選ぶか、「この教科のプランを比較する」をお試しください。</p>';
 updateTray();
};
$('results').addEventListener('click',e=>{const b=e.target.closest('[data-talk]');if(b)showTalk(planById(b.dataset.talk));});
for(const [id,key] of [['subject-focus','focus'],['subject-reason','reason']])$(id).addEventListener('input',()=>{
 if(state.subject==='すべて')return;subjectProfile()[key]=$(id).value;invalidateSubject(state.subject);
 for(const x of state.selected)if(planById(x.id).subject===state.subject)x[key]=$(id).value;
 updateTray();
});
const selectOriginal=addPlan;
addPlan=async function(id){
 if(state.selected.some(x=>x.id===id))return;
 await selectOriginal(id);const x=state.selected.find(x=>x.id===id);if(!x)return;
 const info=subjectProfile(planById(id).subject);x.focus=info.focus||'';if(info.reason)x.reason=info.reason;
 courseConfirmation(id);resetChecks(id);updateTray();renderResults();
};
function confirmationMarkup(x){
 const p=planById(x.id),c=courseConfirmation(x.id),spec=confirmationSpec(p),issues=courseIssues(x);
 const fields=spec.fields.map(([key,label,type,options])=>{
  if(type==='multi')return `<fieldset><legend>${esc(label)}</legend>${options.map(v=>`<label class="check"><input type="checkbox" data-check-id="${x.id}" data-check-value="${key}" value="${esc(v)}" ${(c.values[key]||[]).includes(v)?'checked':''}>${esc(v)}</label>`).join('')}</fieldset>`;
  return `<label>${esc(label)}${type==='select'?`<select data-check-id="${x.id}" data-check-value="${key}"><option value="">未確認</option>${options.map(v=>`<option ${c.values[key]===v?'selected':''}>${esc(v)}</option>`).join('')}</select>`:`<input type="${type==='number'?'number':'text'}" ${type==='number'?'min="0" step="any"':'maxlength="1000"'} data-check-id="${x.id}" data-check-value="${key}" value="${esc(c.values[key]||'')}">`}</label>`;
 }).join('');
 return `<details class="course-confirmation" ${issues.length?'open':''}><summary>${esc(x.title)}：${issues.length?'未確認・要相談':'確認済み'}</summary><p>${esc(courseMaterials(p))}<br>${esc(x.composition)}<br>参照：${esc(p.source)}</p>${p.grade==='高1'&&p.subject==='数学'?'<p>数値は受講の目安です。基準未満でも機械的に受講不可にはしません。担当教師と相談してください。</p>':''}${p.grade==='中3'&&p.subject==='社会'&&p.kind==='補強'?'<p>テーマⅣ＋Ⅰ〜Ⅲの一つ。未受講ならⅠ＋Ⅳを推奨。受講済みの選択なしを「未受講」と扱うには、下の既受講確認を完了してください。</p>':''}${fields}${spec.checks.map(([key,label])=>`<label>${esc(label)}<select data-check-id="${x.id}" data-check-status="${key}">${[['unknown','未確認'],['done','確認済み'],['consult','担当教師と相談']].map(([v,l])=>`<option value="${v}" ${(c.statuses[key]||'unknown')===v?'selected':''}>${l}</option>`).join('')}</select></label>`).join('')}${issues.length?'<ul>'+issues.map(t=>'<li>'+esc(t)+'</li>').join(''):'<p>この講座の確認項目は入力済みです。</p>'}</details>`;
}
renderReview=function(){
 const load=reviewData();const pending=pendingCourses();
 $('plan-review').innerHTML=`<div><p class="eyebrow">社員向け・渡す前の確認</p><h2>${state.selected.length}講座 ／ ${esc(lessonCountLabel())}</h2><p>1回・1コマを集計上1授業枠として合算。通塾日数・時間数ではありません。</p>${load.over?'<p>受講可能回数を'+(load.total-Number(state.coach.capacity))+'授業枠超えています。組み合わせを見直してください。</p>':''}${load.overBudget?'<p>入力料金が予算を'+money(load.amount-Number(state.coach.budget))+'超えています。</p>':''}<p>${load.feesKnown?'金額入力済み':'料金・教材費は確認中'}／${pending.length?pending.length+'講座に未確認・相談事項があります':'選択講座の確認項目は入力済み'}</p></div><div class="staff-registration"><h3>教材・単元・レベル・回数の確認一覧（社員用）</h3>${state.selected.map(confirmationMarkup).join('')}</div>`;
};
$('plan-review').addEventListener('change',e=>{
 const el=e.target,id=el.dataset.checkId;if(!id)return;const c=courseConfirmation(id);
 if(el.dataset.checkValue){const key=el.dataset.checkValue;if(el.type==='checkbox'){const values=new Set(c.values[key]||[]);if(el.checked)values.add(el.value);else values.delete(el.value);c.values[key]=[...values];}else c.values[key]=el.value;c.statuses={};}
 if(el.dataset.checkStatus)c.statuses[el.dataset.checkStatus]=el.value;
 state.verified=false;renderPaper();
});
updateTray=function(){
 const expanded=(typeof matchMedia==='function'&&matchMedia('(min-width:1200px)').matches)||tray.querySelector('details')?.open||false;
 tray.innerHTML=`<div id="tray-summary"><b>${state.selected.length}講座を仮選択</b><span>${esc(lessonCountLabel())}</span></div><details ${expanded?'open':''}><summary>選択中の講座・確認事項</summary><div class="tray-list">${state.selected.map((x,i)=>`<article><b>${esc(x.title)}</b><p>${esc(x.composition)}</p><label>優先順位<select data-priority="${i}">${['最優先','次に取り組む','余裕があれば'].map(v=>`<option ${x.priority===v?'selected':''}>${v}</option>`).join('')}</select></label><p>${courseIssues(x).length?'未確認・相談 '+courseIssues(x).length+'件':'確認済み'}</p>${courseIssues(x).length?'<ul>'+courseIssues(x).map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>':''}<button class="textbtn" data-change="${i}">同じ教科で変更</button><button class="textbtn" data-remove-choice="${i}">削除</button></article>`).join('')||'<p>教科ごとに講座を選んでください。</p>'}<p>合計は授業枠数です。通塾日数ではありません。</p></div></details><button class="primary" id="to-proposal" ${state.selected.length?'':'disabled'}>確認して提案書へ →</button>`;
 $('to-proposal').onclick=()=>view('proposal');renderComparison();
};
tray.addEventListener('click',e=>{
 const remove=e.target.closest('[data-remove-choice]'),change=e.target.closest('[data-change]');
 if(remove){state.selected.splice(Number(remove.dataset.removeChoice),1);state.verified=false;updateCount();renderResults();}
 if(change){state.subject=planById(state.selected[Number(change.dataset.change)].id).subject;state.showAll=true;renderFilters();renderResults();$('results').scrollIntoView({behavior:'smooth'});}
});
tray.addEventListener('change',e=>{if(e.target.dataset.priority!==undefined){state.selected[Number(e.target.dataset.priority)].priority=e.target.value;updateTray();}});
async function changeSchoolType(next){
 const old=state.schoolType;if(old===next)return;
 const changed=state.selected.filter(x=>effective(planById(x.id),old)!==effective(planById(x.id),next));
 if(changed.length&&!await ask('構成を変更します。変更する講座の料金と確認状態は再確認になります。その他の講座・入力は保持します。\n'+changed.map(x=>x.title+'：'+x.composition+' → '+effective(planById(x.id),next)).join('\n'))){$('schoolType').value=old;return;}
 state.schoolType=next;
 for(const x of changed){const before=x.composition;x.composition=effective(planById(x.id),next);x.price='';resetChecks(x.id);x.description=x.description.replaceAll(old==='standard'?'個別指導':'自立学習',next==='self'?'自立学習':'個別指導');x.schoolChange=before+' → '+x.composition;}
 for(const x of state.selected)if(x.composition.includes('個別'))resetChecks(x.id);
 state.verified=false;updateCount();renderResults();renderProposal();
 toast(changed.length?'影響する講座だけを変更しました。料金と受講条件を再確認してください。':'指導形態を変更しました。選択した講座は保持しています。');
}
const selectionPaper=renderPaper;
renderPaper=function(){if(pendingCourses().length)state.verified=false;selectionPaper();$('verified').checked=state.verified;if(pendingCourses().length)$('paper').insertAdjacentHTML('afterbegin','<p class="parent-pending">受講内容・条件は確認中のご提案です。校舎との相談後に確定します。</p>');};
const selectionPDFModel=parentPDFModel;
parentPDFModel=function(){const m=selectionPDFModel();if(pendingCourses().length){m.totalLabel='確認中';m.fields.notes=[m.fields.notes,'受講内容・条件は確認中のご提案です。校舎との相談後に確定します。'].filter(Boolean).join('\n');}m.countLabel=lessonCountLabel()+'（1回・1コマ＝1授業枠／通塾日数ではありません）';return m;};
const selectionProposal=renderProposal;
renderProposal=function(){selectionProposal();for(const x of state.selected)if(x.schoolChange)$('plan-review').insertAdjacentHTML('afterbegin','<p>校舎変更：'+esc(x.schoolChange)+'（金額・条件は再確認）</p>');};
const selectionReset=reset;
reset=function(){selectionReset();renderFilters();renderResults();};
const css=document.createElement('style');css.textContent=`
.selection-v3 [hidden]{display:none!important}.selection-v3{color:#163f5a}.selection-v3 .hero{min-height:0;padding:20px 28px;margin-top:14px}.selection-v3 .hero h1{font-size:30px;line-height:1.4;margin:5px 0}.selection-v3 .hero .intro{font-size:14px}.selection-v3 .hero .winter-art,.selection-v3 .hero-note,.selection-v3 .hero .eyebrow{display:none}.selection-v3 .hero .linkbutton{padding:9px 18px;min-height:38px;font-size:14px}.selection-v3 .sectionhead{margin:24px 0 12px}.selection-v3 .sectionhead h2{font-size:25px}.selection-v3 .sectionhead>p{display:none}.selection-v3 .finder{background:#fff;border-radius:20px;padding:24px}.selection-v3 .profilebar{padding:16px;background:#f2f7fb}.selection-v3 .profilebar label[hidden]{display:none}.selection-v3 .subjectline{margin:20px 0;display:block}.selection-v3 .subjectline>span{display:block;font-size:18px;font-weight:bold;margin-bottom:10px}.selection-v3 .question{font-size:14px;margin:18px 0 8px}.selection-v3 .cases{display:flex;gap:8px}.selection-v3 .case{padding:10px 20px;min-height:0;flex:0 1 auto;font-size:15px}.selection-v3 .case.selected:after{display:none}.selection-v3 .result-controls{display:flex;flex-wrap:wrap;gap:14px;padding:12px;background:#edf5fb;border-radius:12px;margin:12px 0}.selection-v3 .cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.selection-v3 .card h3{font-size:22px}.selection-v3 .card-body{padding:20px}.selection-v3 .card p,.selection-v3 .card li{font-size:14px;line-height:1.8;color:#193e56;white-space:pre-wrap}.selection-v3 .card p>b{display:block;color:#175775}.selection-v3 .card .composition{font-weight:bold;background:#edf5fa;padding:12px;border-radius:8px}.selection-v3 .checks{border-top:1px solid #d3e1eb;padding-top:14px;margin-top:14px}.selection-v3 .checks>b{font-size:14px}.selection-v3 .checks ul{padding-left:20px}.selection-v3 .card details{font-size:13px}.selection-v3 .card-bottom{padding:16px 20px}.selection-v3 label{font-size:14px;color:#173e57}.selection-v3 input,.selection-v3 select,.selection-v3 textarea{font-size:15px;color:#173e57;background:#fff}.selection-v3 :focus-visible{outline:3px solid #dc8854;outline-offset:3px}.staff-tools,.common-tools{padding:14px;background:#f5f9fc;border:1px solid #cfdfeb;border-radius:12px;margin:12px 0}.staff-tools>summary,.common-tools>summary{cursor:pointer;font-weight:bold;font-size:14px}.common-tools>label{margin:12px 0}.legacy-notes{white-space:pre-wrap}.selection-v3 .interview{display:none}.selection-v3 .diagnosis{border:0;padding:16px 0}.selection-v3 .diagnosis-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.selection-v3 .plan-review{display:block;background:#fff}.course-confirmation{padding:15px;border:1px solid #cfdfeb;border-radius:10px;margin:12px 0;background:#f5f9fc}.course-confirmation summary{font-weight:bold;cursor:pointer}.course-confirmation label{display:block;margin:10px 0}.course-confirmation .check{display:flex}.course-confirmation fieldset{border:1px solid #b9cdda;border-radius:8px}.course-confirmation li{margin:5px 0}.parent-pending{background:#edf5fa;padding:12px;color:#254d67}.selection-v3 .selection-tray{display:block;background:#fff;padding:16px;border:1px solid #c8dce9;box-shadow:0 8px 30px #254b6720}.selection-tray>details{margin:10px 0}.selection-tray>details>summary{cursor:pointer;font-weight:bold}.tray-list article{border-top:1px solid #cddce7;padding:12px 0}.tray-list li{font-size:12px;line-height:1.6}.tray-list ul{padding-left:18px}.tray-list p{font-size:13px;white-space:pre-wrap;margin:6px 0}.tray-list select{padding:8px}.selection-tray>button{width:100%}.selection-v3 .muted{color:#466277}.selection-v3 .preview-toolbar{background:#fff;border-radius:10px;padding:12px}.selection-v3 .editor{background:#fff}.selection-v3 .journey{margin:14px auto}
@media(min-width:1200px){.selection-v3 #discover{padding-right:330px;max-width:1600px}.selection-v3 .selection-tray{top:100px;bottom:auto;left:auto;right:18px;width:290px;max-height:calc(100vh - 120px);overflow:auto;border-radius:16px}.selection-tray>details>.tray-list{display:block!important}.selection-tray>details>summary{display:none}.selection-v3 .selection-tray details:not([open])>*:not(summary){display:block}}
@media(max-width:1199px){.selection-v3 .selection-tray{left:10px;right:10px;bottom:8px;border-radius:14px;max-height:55vh;overflow:auto}.selection-v3 main{padding-bottom:160px}.selection-v3 #tray-summary{display:flex;gap:14px}.selection-v3 .cards{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:700px){.selection-v3 .hero h1{font-size:23px}.selection-v3 .hero{padding:16px}.selection-v3 .finder{padding:14px}.selection-v3 .cards,.selection-v3 .diagnosis-grid{grid-template-columns:1fr}.selection-v3 .case{padding:10px 13px}.selection-v3 .profilebar{grid-template-columns:1fr}.selection-v3 .resulthead{display:block}.selection-v3 .top{flex-wrap:wrap}.selection-v3 .brand{font-size:16px}.selection-v3 .result-controls{align-items:flex-start}.selection-v3 .chip{font-size:14px}.selection-v3 .plan-review{padding:14px}.selection-v3 .preview-toolbar{flex-wrap:wrap}.selection-v3 .proposal-layout{min-width:0}.selection-v3 .selection-tray{font-size:13px}.selection-v3 .pageintro h1{font-size:26px}}
@media print{.selection-tray,.staff-registration,.staff-tools,.common-tools{display:none!important}}
`;document.head.append(css);
renderFilters();renderResults();

if(typeof matchMedia==='function'){const layout=matchMedia('(min-width:1200px)');layout.addEventListener('change',()=>{const detail=tray.querySelector('details');if(detail)detail.open=layout.matches;});}
