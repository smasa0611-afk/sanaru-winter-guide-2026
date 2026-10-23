(function(){
'use strict';
const q={step:0,grade:'',subject:'',need:'',wish:'',chosen:''};
const needs=[['basic','基本から確かめたい','習った内容があいまいで、どこから復習するか迷う'],['practice','一人でも解けるようになりたい','説明はわかるけれど、自分で解くと手が止まる'],['stretch','得意をもっと伸ばしたい','今できることを土台に、次の目標へ進みたい']];
const wishes=['休み明けの授業に自信を持ちたい','テストで学んだことを発揮したい','受験に向けて課題を整理したい','学ぶ楽しさ・自分で進める力を育てたい'];
function recommend(a){
 const all=PLANS.filter(p=>p.grade===a.grade&&p.subject===a.subject);
 const kind=a.need==='basic'?'補強':'強化';
 return all.slice().sort((a,b)=>Number(b.kind===kind)-Number(a.kind===kind));
}
window.WinterDiagnosis={recommend,answers:q};
const panel=document.createElement('section');panel.id='winter-diagnosis';document.body.append(panel);
const entry=document.createElement('button');entry.className='diagnosis-return';entry.textContent='❄ 冬の学び診断へ';entry.onclick=()=>{document.body.classList.add('diagnosis-mode');draw();};document.body.append(entry);
function choices(items,key){return '<div class="snow-choices">'+items.map(([v,label,sub])=>`<button data-answer="${esc(v)}" data-key="${key}"><strong>${esc(label)}</strong>${sub?`<span>${esc(sub)}</span>`:''}<i>→</i></button>`).join('')+'</div>';}
function selected(){return recommend(q).find(p=>p.id===q.chosen)||recommend(q)[0];}
function echo(){return `${q.grade}の${q.subject}で「${needs.find(n=>n[0]===q.need)?.[1]||''}」。そして「${q.wish}」という気持ちですね。`;}
function draw(){
 let body='';
 if(q.step===0)body=`<div class="snow-hero"><p class="snow-kicker">YOUR WINTER, YOUR NEXT STEP</p><h1>この冬、<br>あなたの「できた」を<br><em>いっしょに見つけよう。</em></h1><p>苦手なことも、やってみたいことも。<br>4つの質問から、あなたに合う冬の学びをご提案。</p><button class="snow-primary" data-start>わたしに合う冬を見つける →</button><small>選ぶだけ・名前の入力なし</small><div class="snow-friends" aria-hidden="true">🎄 ⛄ 🎁</div></div>`;
 if(q.step===1)body='<h1>今の学年を教えてね。</h1><p>あなたの学年の講座から、一緒に探しましょう。</p>'+choices([...new Set(PLANS.map(p=>p.grade))].map(g=>[g,g]),'grade');
 if(q.step===2)body='<h1>この冬、何を学びたい？</h1><p>まずは、いちばん気になるものをひとつ。</p>'+choices([...new Set(PLANS.filter(p=>p.grade===q.grade).map(p=>p.subject))].map(s=>[s,s]),'subject')+'<p class="snow-small">要綱に掲載されている学びを表示しています。ここにない教科は校舎へご相談ください。</p>';
 if(q.step===3)body='<h1>今の気持ちに近いのは？</h1><p>できる・できないを決めるテストではありません。</p>'+choices(needs,'need');
 if(q.step===4)body='<h1>冬の終わり、どうなっていたい？</h1><p>小さな目標からで大丈夫。</p>'+choices(wishes.map(s=>[s,s]),'wish');
 if(q.step===5){const list=recommend(q),p=selected();body=`<p class="snow-kicker">A WINTER PLAN FOR YOU</p><h1>あなたの気持ちから、<br>この冬の一歩を。</h1><div class="snow-letter"><b>こんな冬にしたいんですね。</b><p>${esc(echo())}</p><p>まずは今の理解を確かめて、必要な内容と取り組む順番を一緒に決めましょう。</p></div><h2>相談したい講座を選ぼう</h2><p>回答に近い区分から並べています。講座ごとの内容を見て、気になるものを選んでください。</p><div class="snow-courses">${list.map((c,i)=>{const copy=copyFor(c);return `<button data-course="${c.id}" aria-pressed="${c.id===p.id}" class="${c.id===p.id?'picked':''}"><small>${i===0?'まず相談したい候補':'こちらも比較できます'}</small><h3>${esc(c.subject+' '+c.kind)}</h3><p>${esc(copy.desc)}</p><b>この冬に目指すこと</b><p>${esc(copy.goal)}</p><span>${esc(c.composition)}</span></button>`;}).join('')}</div><div class="snow-letter"><h2>この講座を提案する理由</h2><p>${esc(q.need==='basic'?'基本を確かめたいという希望に合わせ、取り組み始める内容を確認する候補です。':q.need==='practice'?'自分で取り組めるようになりたいという希望に合わせ、学んだ内容を確かめる進め方を相談する候補です。':'さらに伸ばしたいという希望に合わせ、今の理解と目標に合う内容を相談する候補です。')}</p><p>${esc(coursePurpose(p))}</p><p class="snow-small">回答だけで受講内容は確定しません。教材・レベル・回数や校舎での実施内容は、担当者が確認します。${q.grade==='中3'?'志望校と入試方式に合う区分も確認します。':''}</p></div><button class="snow-primary" data-review>この講座の体験を相談する →</button>`;}
 if(q.step===6){const p=selected();const url=window.WINTER_BOOKING_URL||'';const valid=/^https:\/\//.test(url);body=`<p class="snow-kicker">YOUR NEXT STEP</p><h1>まずは体験で、<br>自分に合う学び方を。</h1><div class="snow-letter"><h2>相談したい内容</h2><p>${esc(echo())}</p><h3>${esc(p.grade+' '+p.subject+' '+p.kind)}</h3><p>${esc(copyFor(p).desc)}</p><h3>体験・面談で一緒に確かめること</h3><ul><li>どこまで理解できていて、どこから取り組むか</li><li>目標に合う教材・レベルと学び方</li><li>校舎で体験できる内容と通える日程</li></ul></div>${valid?`<a class="snow-primary" href="${esc(url)}" target="_blank" rel="noopener">体験申し込みはこちら ↗</a><p>申込先で希望講座をお伝えください。予約は申込先で確定します。</p>`:'<button class="snow-primary" disabled>体験申し込みページは準備中</button><p>現在は相談内容の確認までご利用いただけます。体験をご希望の方は校舎へお問い合わせください。</p>'}<button class="snow-sub" data-copy>相談内容をコピー</button><p id="snow-copy-status" role="status"></p>`;}
 panel.innerHTML=`<header><b>＊ さなる個別 @will<small>冬のまなび診断 2026</small></b><button data-staff>社員向けツール</button></header><main tabindex="-1">${q.step>0?`<div class="snow-progress">${q.step<=4?`QUESTION ${q.step} / 4`:'あなたの冬プラン'}<progress max="6" value="${q.step}"></progress></div>`:''}${body}${q.step>0?'<div class="snow-actions"><button data-back>← ひとつ戻る</button><button data-restart>最初から選ぶ</button></div>':''}</main><footer>小さな一歩を、大きな自信へ。 ❄<br><small>さなる個別 @will 冬のまなび案内</small></footer>`;
 panel.querySelector('main').focus();window.scrollTo(0,0);
}
 panel.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-staff')){document.body.classList.remove('diagnosis-mode');return;}
 if(b.hasAttribute('data-start'))q.step=1;
 else if(b.dataset.key){q[b.dataset.key]=b.dataset.answer;q.step++;q.chosen='';}
 else if(b.dataset.course){q.chosen=b.dataset.course;}
 else if(b.hasAttribute('data-review'))q.step=6;
 else if(b.hasAttribute('data-back'))q.step=Math.max(0,q.step-1);
 else if(b.hasAttribute('data-restart'))Object.assign(q,{step:0,grade:'',subject:'',need:'',wish:'',chosen:''});
 else if(b.hasAttribute('data-copy')){try{await navigator.clipboard.writeText(echo()+'\n相談したい講座：'+selected().subject+' '+selected().kind);document.getElementById('snow-copy-status').textContent='相談内容をコピーしました。';}catch{document.getElementById('snow-copy-status').textContent='コピーできませんでした。上の相談内容を選択してコピーしてください。';}return;}else return;draw();
 });
 document.body.classList.add('diagnosis-mode');draw();
})();
