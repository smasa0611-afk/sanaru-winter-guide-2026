'use strict';
// Source PLANS remains immutable in meaning; these fields are staff-entered facts.
state.schemaVersion=3;state.subjectProfiles={};state.confirmations={};state.legacyNotes='';
function emptySubject(){return {need:'unknown',readiness:'unknown',prior:'',focus:'',reason:''};}
function subjectProfile(subject=state.subject){if(subject==='すべて')return emptySubject();return state.subjectProfiles[subject]||(state.subjectProfiles[subject]=emptySubject());}
function profileFor(subject){return {...state.coach,...subjectProfile(subject)};}
function resetChecks(id){if(state.confirmations[id])state.confirmations[id].statuses={};state.verified=false;}
function invalidateSubject(subject){for(const x of state.selected)if(planById(x.id).subject===subject)resetChecks(x.id);}
function confirmationSpec(p){
 const fields=[],checks=[['opening','開講・対象・使用教材を確認']];
 if(p.grade==='中3'&&p.subject==='社会'&&p.kind==='補強'){
  fields.push(['priorThemes','既受講テーマ','multi',['Ⅰ','Ⅱ','Ⅲ','Ⅳ']],['theme','今回の組み合わせ','select',['Ⅰ＋Ⅳ','Ⅱ＋Ⅳ','Ⅲ＋Ⅳ']]);
  checks.push(['prior','既受講テーマを確認（未受講なら選択なしで確認）'],['theme','今回のテーマと重複回避を確認']);
 }
 if(p.grade==='高1'&&p.subject==='数学'&&p.kind==='強化'){
  fields.push(['deviation','河合偏差値（目安50以上）','number'],['schoolScore','学校テスト得点率％（目安80）','number'],['teacher','担当教師の見解・相談事項','text']);
  checks.push(['benchmarks','偏差値・得点率の目安を確認'],['teacher','担当教師の判断を確認'],['video','映像授業を理解できるか確認']);
 }
 if(p.grade==='高2'&&p.subject==='数学'&&p.kind==='強化'){
  fields.push(['units','模試から選んだ単元','text'],['level','教材レベル','select',['教科書レベル','共通テストレベル','国公立大入試レベル']],['periods','選択単元に必要なコマ数（正式な数を確認して入力）','number']);
  checks.push(['units','模試結果と選択単元を確認'],['level','教材レベルを確認'],['periods','12コマに収まるか必要コマ数を確認']);
 }
 if(['中1','中2'].includes(p.grade)&&p.subject==='数学'&&p.kind==='強化'){
  fields.push(['progress','学校進度・今回の学習範囲','text'],['registered','登録した要綱の単元','multi',p.grade==='中1'?['平面図形','空間図形']:['三角形と四角形']]);
  checks.push(['progress','学校進度を確認'],['registered','要綱の登録単元を確認']);
 }
 if(p.kind==='オリジナル')checks.push(['design','授業形式・回数・教材・重点内容を個別に決定']);
 if(p.kind==='作文')checks.push(['reading','読書4回の組み合わせ条件を校舎と確認']);
 return {fields,checks};
}
function courseConfirmation(id){return state.confirmations[id]||(state.confirmations[id]={values:{},statuses:{}});}
function courseIssues(x){
 const p=planById(x.id),spec=confirmationSpec(p),c=state.confirmations[x.id]||{values:{},statuses:{}},v=c.values||{},status=c.statuses||{};
 const issues=spec.checks.filter(([key])=>status[key]!=='done').map(([key,label])=>label+'：'+(status[key]==='consult'?'担当教師と相談':'未確認'));
 const requireValue=(key,label)=>{if(!String(v[key]||'').trim())issues.push(label+'を入力してください');};
 if(p.grade==='中3'&&p.subject==='社会'&&p.kind==='補強'){
  requireValue('theme','今回のテーマ');const used=v.priorThemes||[],selected=(v.theme||'').split('＋'),overlap=used.filter(t=>selected.includes(t));
  if(overlap.length)issues.push('テーマ'+overlap.join('・')+'が受講済みと重複しています。今回の組み合わせを見直してください');
 }
 if(p.grade==='高1'&&p.subject==='数学'&&p.kind==='強化')requireValue('teacher','担当教師の見解');
 if(p.grade==='高2'&&p.subject==='数学'&&p.kind==='強化'){
  for(const [k,l] of [['units','選択単元'],['level','教材レベル'],['periods','必要コマ数']])requireValue(k,l);
  if(v.periods&&(!Number.isInteger(Number(v.periods))||Number(v.periods)<=0||Number(v.periods)>12))issues.push('必要コマ数を確認し、12コマのプランに収まる単元を相談してください');
 }
 if(['中1','中2'].includes(p.grade)&&p.subject==='数学'&&p.kind==='強化'){
  requireValue('progress','学校進度');const expected=p.grade==='中1'?['平面図形','空間図形']:['三角形と四角形'];
  if(expected.some(k=>!(v.registered||[]).includes(k)))issues.push('要綱にある登録単元が未確認です：'+expected.join('・'));
 }
 if(x.custom&&countOf(x.composition)===null)issues.push('授業形式と回数が未確定です');
 if(state.schoolType==='self'&&x.composition.includes('個別'))issues.push('個別指導を含むため、この校舎での実施方法を相談してください（要綱に代替なし）');
 return [...new Set(issues)];
}
function pendingCourses(){return state.selected.filter(x=>courseIssues(x).length);}
function coursePurpose(p){
 if(p.kind==='オリジナル')return '志望校と答案から個別設計';
 if(p.kind==='作文')return '読書と語彙・表現の土台づくり';
 if(p.kind==='力シリーズ')return {'読書の力':'本に親しみ言葉を増やす','閃きの力':'図形・数を試行錯誤して考える','英検®の力':'目標級に向けた英語学習'}[p.subject];
 if(p.grade==='中3')return p.kind==='私立推薦'?'私立推薦に向けた準備':p.kind==='難関高校'?'難関校の内容・難度へ':'入試で使う基本の整理';
 if(p.subject==='英語')return p.kind==='補強'?'英単語の暗記・確認':p.grade.startsWith('高')?'習熟度別の英文法':'学年末範囲の問題演習';
 if(p.subject==='理科')return p.kind==='補強'?'既習範囲を基本から復習':'映像で学年末に向けた予習';
 if(p.subject==='数学')return p.kind==='補強'?'学校ワーク等の演習・解き直し':p.grade==='高1'?'ステップアップ映像・確認テスト':p.grade==='高2'?'模試の弱点を映像で学習':'既習範囲・図形の問題演習';
 if(p.subject==='算数')return p.kind==='補強'?'2学期単元の解き直し':'指定単元の演習と解き直し';
 if(p.subject==='社会')return p.kind==='補強'?'学校教材・ワークの反復':'学校進度に合う単元演習';
 return p.grade.startsWith('小')?(p.kind==='補強'?'学年相当の漢字と毎回のテスト':'主語・述語などの知識の総復習'):(p.kind==='補強'?'文法・古典を基本から確認':'文法・古典の確認・内容吟味');
}
function courseMaterials(p){const text=p.detail.split('◆使用テキスト')[1];if(text)return text.split('◆')[0].trim();return p.kind==='作文'?(p.grade<='小3'?'原資料に教材名の指定なし':'語彙力養成コース ベーシックコース'):p.kind==='力シリーズ'?'校舎で教材・対象を確認':'面談で決定（原資料に指定なし）';}
const factualExplain=COACH.explain.bind(COACH);
COACH.explain=function(p,profile={}){const info=factualExplain(p,profile);if(confirmationSpec(p).checks.length>1&&confirmationSpec(p).checks.some(([k])=>state.confirmations[p.id]?.statuses[k]!=='done'))info.fit='確認が必要';else if(!profile.need||profile.need==='unknown')info.fit='条件に該当する講座';else if(profile.readiness==='unknown'||profile.readiness==='support'&&p.kind==='強化')info.fit='確認が必要';else if(['blocked','knowledge','habit'].includes(profile.need)&&p.kind==='強化'){info.fit='確認が必要';info.checks.unshift('入力したつまずきと、この講座の目的が合うか確認してください。生徒情報は変更していません。');}else if(info.fit==='優先候補'){info.checks.unshift('入力した状況：'+COACH.profiles[profile.need].name+'／'+(profile.readiness==='ready'?'類題を自力で解ける':'説明やヒントが必要'));}return info;};
