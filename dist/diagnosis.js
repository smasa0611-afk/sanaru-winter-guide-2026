(function(){
'use strict';
const config=window.WINTER_ENROLLMENT||{}, key='sanaru-winter-internal-v1';
const q={step:0,grade:'',subject:'',need:'',wish:'',basket:[],profiles:{},options:{},consent:false};
const wishes=['休み明けの授業に自信を持ちたい','テストで学んだことを発揮したい','受験に向けて力をつけたい','学ぶ楽しさ・自分で進める力を育てたい'];
const panel=document.createElement('section');panel.id='winter-diagnosis';document.body.append(panel);
function plans(grade=q.grade,subject=q.subject){return PLANS.filter(p=>p.grade===grade&&(!subject||p.subject===subject));}
function override(p){const v=config.approvedPlans?.[p.id];return v&&['title','composition','materials','description','goal'].every(k=>typeof v[k]==='string'&&v[k].trim())?v:null;}
function copy(p){return override(p)||copyFor(p);}
function title(p){return override(p)?.title||(p.kind==='力シリーズ'||p.subject===p.kind?p.subject:p.subject+' '+p.kind);}
function opts(id){return q.options[id]||(q.options[id]={});}
function composition(p){return override(p)?.composition||(p.variable?p.subject.replace('の力','')+(opts(p.id).count||'未選択')+'回':p.composition);}
function material(p){return override(p)?.materials||opts(p.id).textbook||(p.kind==='力シリーズ'?'要綱に教材名の指定はありません。':courseMaterials(p));}
function description(p){return override(p)?.description||copyFor(p).desc;}
function blocked(p){
 if(Array.isArray(config.offeredIds)&&!config.offeredIds.includes(p.id))return 'この校舎の申込対象に登録されていません。';
 if(override(p))return '';
 if(p.kind==='オリジナル')return '要綱に回数・教材の指定がない個別設計の講座です。確定プランの登録後に選べます。';
 if(p.grade==='高1'&&p.subject==='数学'&&p.kind==='強化')return '要綱上、担当教師の判断が必要な講座です。受講条件を確認した確定プランの登録後に選べます。';
 if(p.grade==='高2'&&p.subject==='数学'&&p.kind==='強化')return '模試で選ぶ単元・教材レベル・12コマに収まる構成が未確定です。確定プランの登録後に選べます。';
 if(p.kind==='作文')return '読書4回との組み合わせ条件を確定したプランの登録後に選べます。';
 return '';
}
function availability(subject){const list=plans(q.grade,subject);return list.some(p=>!blocked(p));}
function methodHelp(p){const c=composition(p);return [['自立','学校のワークなどを使い、自分で演習と解き直しを進める学習です。'],['学トレ','プリントで問題を解き、理解に合わせて練習を重ねます。'],['映像','映像の説明を見て、教材や確認問題で理解を確かめます。'],['個別','教師の説明を受けながら、理解と演習を進めます。']].filter(([k])=>c.includes(k)).map(([,v])=>v).join(' ');}
function needsFor(grade,subject){return plans(grade,subject).map(p=>({value:p.kind,label:coursePurpose(p)||title(p),detail:description(p)+(blocked(p)?'【現在は選択できません】':'')})).filter((p,i,a)=>a.findIndex(x=>x.value===p.value)===i);}
function recommend(a){const list=plans(a.grade,a.subject);const kind=a.need==='basic'?'補強':a.need==='practice'||a.need==='stretch'?'強化':a.need;return list.slice().sort((a,b)=>Number(b.kind===kind)-Number(a.kind===kind));}
function echo(subject=q.subject){const a=q.profiles[subject];if(!a)return '';const n=needsFor(q.grade,subject).find(n=>n.value===a.need);return `${subject}で「${n?.label||a.need}」に取り組み、「${a.wish}」を目指す冬ですね。`;}
function persist(){try{localStorage.setItem(key,JSON.stringify(q));}catch{}}
try{const v=JSON.parse(localStorage.getItem(key)||'null');if(v&&grades.includes(v.grade)&&Array.isArray(v.basket)){Object.assign(q,{grade:v.grade,basket:[...new Set(v.basket)].filter(id=>PLANS.some(p=>p.id===id&&p.grade===v.grade)),profiles:v.profiles&&typeof v.profiles==='object'?v.profiles:{},options:v.options&&typeof v.options==='object'?v.options:{}});}}catch{}
function optionsMarkup(p){const o=opts(p.id);if(override(p))return '';let html='';
 if(p.variable)html+='<p class="snow-small">4回単位で選べます。回数は授業の回数で、通塾日数ではありません。普段の予定と合わせ、無理なく取り組める回数を選んでください。</p>'+select(p.id,'count','受講回数',['4','8','12','16','20'],o.count,'回');
 if(p.grade==='中3'&&p.subject==='社会'&&p.kind==='補強'){html+=select(p.id,'prior','これまでに受講したテーマ',['未受講','Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅰ・Ⅱ','Ⅰ・Ⅲ','Ⅱ・Ⅲ','Ⅰ・Ⅱ・Ⅲ','Ⅳを含む複数テーマ','わからない'],o.prior);html+=select(p.id,'theme','今回取り組むテーマ',['Ⅰ＋Ⅳ','Ⅱ＋Ⅳ','Ⅲ＋Ⅳ'],o.theme)+'<p class="snow-small">教材の表紙でテーマ番号を確かめてください。未受講ならⅠ＋Ⅳが要綱の推奨です。番号がわからないときは、仮に追加して保存し、教材を確認してから決められます。</p>';}
 if(['中1','中2'].includes(p.grade)&&p.subject==='数学'&&p.kind==='強化')html+=check(p.id,'units',p.grade==='中1'?'平面図形・空間図形に取り組む内容でよい':'三角形と四角形に取り組む内容でよい',o.units);
 if(p.grade.startsWith('高')&&p.subject==='英語'&&p.kind==='強化')html+=select(p.id,'textbook','現在指定されている教材',['楽勝英文法','ファーストステップ','ステップアップ','ビルドアップ'],o.textbook);
 if(p.subject==='英検®の力')html+=select(p.id,'level','現在受講している級',['5級','4級','3級','準2級','準2級プラス','2級'],o.level);
 return html;
}
function select(id,k,label,values,value,suffix=''){return `<label class="winter-option">${esc(label)}<select data-option="${id}" data-field="${k}"><option value="">選んでください</option>${values.map(v=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(v+suffix)}</option>`).join('')}</select></label>`;}
function check(id,k,label,value){return `<label class="winter-checkbox"><input type="checkbox" data-option="${id}" data-field="${k}" ${value?'checked':''}>${esc(label)}</label>`;}
function issues(p){const o=opts(p.id),out=[];const b=blocked(p);if(b)return [b];if(override(p))return [];
 if(p.variable&&!['4','8','12','16','20'].includes(o.count))out.push('受講回数を選んでください。');
 if(p.grade==='中3'&&p.subject==='社会'&&p.kind==='補強'){
  if(!['未受講','Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅰ・Ⅱ','Ⅰ・Ⅲ','Ⅱ・Ⅲ','Ⅰ・Ⅱ・Ⅲ','Ⅳを含む複数テーマ'].includes(o.prior))out.push('教材の表紙で、受講済みのテーマ番号を確認してください。');
  if(!['Ⅰ＋Ⅳ','Ⅱ＋Ⅳ','Ⅲ＋Ⅳ'].includes(o.theme))out.push('今回のテーマを選んでください。');
  if(o.prior&&o.prior!=='未受講'&&o.theme?.split('＋').some(t=>o.prior.split('・').includes(t)||(t==='Ⅳ'&&o.prior.includes('Ⅳ'))))out.push('受講済みテーマが重複しています。別の組み合わせを選んでください。');
 }
 if(['中1','中2'].includes(p.grade)&&p.subject==='数学'&&p.kind==='強化'&&!o.units)out.push('学ぶ図形の単元を確認してください。');
 if(p.grade.startsWith('高')&&p.subject==='英語'&&p.kind==='強化'&&!['楽勝英文法','ファーストステップ','ステップアップ','ビルドアップ'].includes(o.textbook))out.push('現在の教材の表紙を見て選んでください。未確認のまま保存し、あとで続きを選べます。');
 if(p.subject==='英検®の力'&&!['5級','4級','3級','準2級','準2級プラス','2級'].includes(o.level))out.push('受講している級を選んでください。');return out;
}
function toggle(id){const p=PLANS.find(p=>p.id===id&&p.grade===q.grade);if(!p)return false;if(q.basket.includes(id))q.basket=q.basket.filter(x=>x!==id);else {if(blocked(p))return false;q.basket.push(id);}q.consent=false;return true;}
function summary(){return ['2026 冬期講座 選択内容（未送信）',q.grade,...q.basket.map(id=>{const p=planById(id),o=opts(id);return '\n'+title(p)+'\n'+composition(p)+'\n教材：'+material(p)+'\n'+['textbook','level','theme'].filter(k=>o[k]).map(k=>o[k]).join('／')+'\n'+echo(p.subject)+(issues(p).length?'\n【まだ決める項目】'+issues(p).join('／'):'');})].join('\n');}
function applicationUrl(){try{const u=new URL(config.applicationUrl);return u.protocol==='https:'?u.href:'';}catch{return '';}}
function ready(){return q.basket.length>0&&q.basket.every(id=>issues(planById(id)).length===0);}
window.WinterDiagnosis={recommend,answers:q,needsFor,issues,blocked,toggle,summary,ready};
function choices(items,key){return '<div class="snow-choices">'+items.map(([v,label,sub])=>`<button data-answer="${esc(v)}" data-key="${key}"><strong>${esc(label)}</strong>${sub?`<span>${esc(sub)}</span>`:''}<i>→</i></button>`).join('')+'</div>';}
function card(p){const picked=q.basket.includes(p.id),b=blocked(p),a=q.profiles[p.subject],matched=a?.need===p.kind;return `<article class="enrollment-card ${picked?'picked':''}"><small>${matched?'あなたが選んだ学びに一致':'目的を比べて選べます'}</small><h3>${esc(title(p))}</h3><p class="course-focus">${esc(coursePurpose(p))}</p><p>${esc(description(p))}</p><dl><dt>冬の終わりに目指すこと</dt><dd>${esc(copy(p).goal)}</dd><dt>授業形式・回数</dt><dd>${esc(p.variable&&!override(p)?'4・8・12・16・20回から選択（まだ確定していません）':composition(p))}</dd>${methodHelp(p)?'<dt>どんな学び方？</dt><dd>'+esc(methodHelp(p))+'</dd>':''}<dt>使う教材</dt><dd>${esc(material(p))}</dd></dl>${p.kind==='強化'&&p.subject==='理科'?'<p class="course-caution">こちらは復習中心ではなく、映像を使った予習の講座です。</p>':''}${b?`<p class="course-caution">${esc(b)}</p>`:optionsMarkup(p)}${!b&&picked&&issues(p).length?'<p class="course-caution">追加済み・あと'+issues(p).length+'項目を選ぶと内容がそろいます。</p>':''}<button class="${picked?'snow-sub':'snow-primary'}" data-course="${p.id}" aria-pressed="${picked}" ${b?'disabled':''}>${b?'現在は選択できません':picked?'✓ 選択済み・外す':'この講座を追加 ＋'}</button></article>`;}
function draw(focus=true){panel.dataset.step=String(q.step);let body='';
 if(q.step===0)body=`<div class="snow-hero"><p class="snow-kicker">MY WINTER LEARNING PLAN</p><h1>この冬、<br>伸ばしたい力を、<br><em>自分で選ぼう。</em></h1><p>内部生のための冬期講座選び。<br>学ぶ内容を比べて、受講したい講座を組み合わせよう。</p><button class="snow-primary" data-start>冬の講座を選ぶ →</button>${q.basket.length?`<button class="snow-sub" data-review>前回選んだ${q.basket.length}講座を見る</button>`:''}<small>教科ごとに選べる・複数選択OK</small></div>`;
 if(q.step===1)body='<h1>今の学年を教えてね。</h1><p>学年に合う講座を表示します。学年を変更すると、選択した講座はリセットされます。</p>'+choices(grades.map(g=>[g,g]),'grade');
 if(q.step===2)body=`<h1>どの力を伸ばしたい？</h1><p>教科ごとに内容を選んで、冬のプランに追加できます。</p>${q.grade==='高3'?'<p class="course-caution">高3の英語・数学は、要綱では個別設計です。今ある資料だけでは受講内容を自動で決められません。詳細を見ることはできますが、確定内容の登録までは選択できません。</p>':''}${choices([...new Set(plans(q.grade,'').map(p=>p.subject))].map(s=>[s,s,q.basket.filter(id=>planById(id).subject===s).length?'選択済みの講座があります':availability(s)?'内容・学び方を見比べる':'内容の確定待ち・現在は選択できません']),'subject')}<p class="snow-small">掲載のない教科や、内容が未確定のプランは、この画面では申し込めません。</p>`;
 if(q.step===3)body=`<h1>${esc(q.subject)}で、何に取り組みたい？</h1><p>「補強」「強化」という名前より、実際に学ぶ内容で選びましょう。</p>${choices(needsFor(q.grade,q.subject).map(n=>[n.value,n.label,n.detail]),'need')}`;
 if(q.step===4)body='<h1>冬の終わり、どうなっていたい？</h1><p>この教科で目指したいことを選んでください。</p>'+choices(wishes.map(s=>[s,s]),'wish');
 if(q.step===5)body=`<p class="snow-kicker">YOUR WINTER CHOICES</p><h1>${esc(q.subject)}の冬を、選ぼう。</h1><div class="snow-letter"><b>あなたが目指す冬</b><p>${esc(echo()||'この教科で案内できる内容を確認してください。')}</p><p>選んだ学習内容に合う講座から表示しています。取り組む内容と回数を比べて、あなたの冬に必要な学びを選びましょう。</p></div><div class="snow-courses">${recommend(q).map(card).join('')}</div><p class="snow-small">同じ教科も複数選べます。学ぶ範囲が重なる場合は、目的と回数を見比べてください。</p><button class="snow-sub" data-more>＋ 別の教科・力も選ぶ</button>`;
 if(q.step===6){const valid=ready(),url=applicationUrl();body=`<p class="snow-kicker">MY WINTER PLAN</p><h1>この冬に受講する講座</h1><p>選んだ講座と回数を、ご家庭で確認してください。</p>${q.basket.length?q.basket.map(id=>{const p=planById(id),problems=issues(p);return `<article class="enrollment-review"><h2>${esc(title(p))}</h2><p>${esc(description(p))}</p><p><b>${esc(composition(p))}</b></p><p>${esc(echo(p.subject))}</p><p><b>教材：</b>${esc(material(p))}</p>${optionsMarkup(p)}${problems.length?'<ul class="course-caution">'+problems.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul>':''}<button class="snow-sub" data-course="${p.id}">この講座を外す</button></article>`;}).join(''):'<p class="snow-letter">まだ講座を選んでいません。</p>'}<button class="snow-sub" data-more>＋ 講座を追加する</button>${q.basket.length?`<div class="snow-letter"><h2>${q.basket.length}講座を選択中</h2><p>${q.basket.map(id=>{const p=planById(id);return esc(title(p)+'：'+composition(p));}).join('<br>')}</p><p>各講座の回数は授業枠数です。通塾日数ではありません。受講日程・校舎の申込条件は申込先の案内をご確認ください。</p>${new Set(q.basket.map(id=>planById(id).subject)).size<q.basket.length?'<p>同じ教科の講座が複数あります。内容の重なりと受講回数を確認してください。</p>':''}<label class="winter-checkbox"><input type="checkbox" id="enrollment-confirm" ${q.consent?'checked':''}>講座内容・回数を保護者と確認しました</label></div><button class="snow-sub" data-copy>申込内容をコピー</button> <button class="snow-sub" data-download>申込内容を保存</button><p id="snow-copy-status" role="status"></p>${url&&valid&&q.consent?`<a class="snow-primary" href="${esc(url)}" target="_blank" rel="noopener">選んだ内容で冬期講座の申し込みへ ↗</a><p>コピーした内容を申込フォームへ貼り付けてください。この画面から自動送信はされません。</p>`:`<button class="snow-primary" disabled>${!valid?'未選択の項目を確認してください':!q.consent?'保護者との確認にチェックしてください': '内部生用の申込先を準備中'}</button>${!url?'<p>講座選びと内容の保存まで利用できます。まだ申し込みは送信されていません。</p>':''}`}`:''}`;}
 panel.innerHTML=`<header><b>＊ さなる個別 @will<small>内部生の冬期講座選び 2026</small></b>${q.grade?`<button class="snow-sub" data-review>選んだ講座 ${q.basket.length}</button>`:''}</header><main tabindex="-1">${q.step>0?`<div class="snow-progress">${esc(q.grade)} ${q.step===6?'申込内容の確認':q.step===5?'講座を選ぶ':'学びたいことを選ぶ'}<progress max="6" value="${q.step}"></progress></div><div class="snow-scene-banner" aria-hidden="true"></div>`:''}${body}${q.step>0?`<div class="snow-actions"><button data-back>← 戻る</button>${q.step!==6?`<button data-review ${q.basket.length?'':'disabled'}>選んだ${q.basket.length}講座を確認 →</button>`:''}</div><details class="winter-reset"><summary>最初から選び直す</summary><p>保存している講座と回答をすべて消して、学年から選び直します。</p><button class="snow-sub" data-restart>選択を消して最初から</button></details>`:''}</main><footer>小さな一歩を、大きな自信へ。 ❄<br><small>さなる個別 @will 冬のまなび案内</small></footer>`;
 if(focus){panel.querySelector('main').focus();window.scrollTo(0,0);}persist();
}
 panel.addEventListener('change',e=>{const el=e.target;if(el.id==='enrollment-confirm'){q.consent=el.checked;draw(false);return;}if(el.dataset.option){const p=planById(el.dataset.option);if(!p||p.grade!==q.grade)return;opts(p.id)[el.dataset.field]=el.type==='checkbox'?el.checked:el.value;q.consent=false;draw(false);}});
 panel.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||b.disabled)return;let focus=true;
 if(b.hasAttribute('data-start'))q.step=q.grade?2:1;
 else if(b.dataset.key){const k=b.dataset.key,v=b.dataset.answer;if(k==='grade'&&v!==q.grade){q.basket=[];q.profiles={};q.options={};q.consent=false;}q[k]=v;q.consent=false;if(k==='subject'){q.need='';q.wish='';if(!availability(v)){q.step=5;draw();return;}}if(k==='wish')q.profiles[q.subject]={need:q.need,wish:q.wish};q.step++;}
 else if(b.dataset.course){toggle(b.dataset.course);focus=false;}
 else if(b.hasAttribute('data-review'))q.step=6;
 else if(b.hasAttribute('data-more'))q.step=2;
 else if(b.hasAttribute('data-back'))q.step=q.step===6||(q.step===5&&!availability(q.subject))?2:Math.max(0,q.step-1);
 else if(b.hasAttribute('data-restart'))Object.assign(q,{step:0,grade:'',subject:'',need:'',wish:'',basket:[],profiles:{},options:{},consent:false});
 else if(b.hasAttribute('data-copy')){try{await navigator.clipboard.writeText(summary());document.getElementById('snow-copy-status').textContent='申込内容をコピーしました。まだ送信されていません。';}catch{document.getElementById('snow-copy-status').textContent='コピーできませんでした。「申込内容を保存」をご利用ください。';}return;}
 else if(b.hasAttribute('data-download')){const a=document.createElement('a'),url=URL.createObjectURL(new Blob(['\ufeff'+summary()],{type:'text/plain;charset=utf-8'}));a.href=url;a.download='冬期講座_申込内容.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
 else return;draw(focus);
 });
 document.body.classList.add('diagnosis-mode');draw();
})();
