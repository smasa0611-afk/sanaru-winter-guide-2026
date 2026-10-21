'use strict';
const COACH={
 profiles:{unknown:{name:'未確認',case:'foundation',lead:'まだ生徒の状況を確認していません。講座は仮選択できます。'},blocked:{name:'説明から支えてほしい',case:'foundation',lead:'解き方の説明から必要な状態です。演習中心の講座だけで解決すると決めず、つまずいた箇所の説明をどう補うか確認します。'},knowledge:{name:'単語・漢字・知識が定着しない',case:'foundation',lead:'覚える時間と、見ずに答える確認をセットにします。暗記量を増やす前に、どの知識が抜けているか確認します。'},habit:{name:'何をどう勉強するか迷う',case:'foundation',lead:'課題・優先順位・取り組む日を具体化します。「終わった量」と「自力で解けた量」を分けて振り返ります。'},practice:{name:'説明はわかるが一人では解けない',case:'practice',lead:'説明後の自力演習と、時間を空けた解き直しを増やします。誤答が続く場合は理解の確認へ戻ります。'},stretch:{name:'基本はできる。応用や先取りへ',case:'ahead',lead:'基本の定着を答案で確認してから、難度を上げる・次の単元を学ぶ範囲を決めます。'},roots:{name:'読む・考える・英語の土台を育てたい',case:'roots',lead:'学ぶ楽しさや習慣づくりを目標にします。学校単元の補習と能力育成の目的を分けて選びます。'}},
 subject:{
 英語:{question:'読めない単語、文の組み立て、長文の読み方のどこで止まりますか？答案と単語テストを見せてもらいましょう。',measure:'学んだ単語・文法を見ずに答え、間違えた項目を次の回でもう一度確認する。',home:'塾で間違えた単語や例文を、答えを隠して短く復習する。'},
 算数:{question:'計算の途中、問題文の読み取り、図のイメージのどこで止まりますか？一問を解く過程を確認しましょう。',measure:'同じ単元の別の問題を、途中式や考え方を説明しながら自力で解く。',home:'授業で直した問題を一問選び、途中式を残して解き直す。'},
 数学:{question:'公式を知らないのか、使う場面を選べないのか、計算で崩れるのか。答案の途中式から確かめましょう。',measure:'重点単元の類題を自力で解き、間違いの原因を説明する。',home:'解説を見て終わりにせず、閉じて一問だけ解き直す。'},
 国語:{question:'漢字・語彙、文法、本文の根拠探しのどこが課題ですか？原資料の講座が扱う内容と一致するか確認しましょう。',measure:'知識問題の解き直しや、学習した文章で答えの根拠を示す確認を行う。',home:'知らなかった言葉を一つ、短い文で使ってみる。'},
 理科:{question:'用語の暗記、現象の理解、計算・実験考察のどこが課題ですか？学校の単元進度を確認しましょう。',measure:'用語だけでなく理由も説明し、学習した単元の確認問題を解く。',home:'授業で学んだ現象を、自分の言葉や簡単な図で説明する。'},
 社会:{question:'用語を思い出せないのか、流れや位置関係、資料の読み取りで迷うのか。誤答の種類を確かめましょう。',measure:'用語の確認と資料問題の解き直しを分けて行い、根拠を説明する。',home:'地図・年表・資料と用語を結びつけて短く振り返る。'},
 '閃きの力':{question:'答えを急いで求めますか？図形やパズルを試行錯誤することは好きですか？',measure:'試した考え方や工夫を言葉にし、粘り強く取り組めた場面を振り返る。',home:'正解を急がせず、「どんなふうに考えた？」と工夫を聞く。'},
 '読書の力':{question:'本の長さ、言葉の難しさ、読む習慣のどこにハードルがありますか？好きな題材も聞きましょう。',measure:'読んだ内容や印象に残った場面、新しく知った言葉を振り返る。',home:'読んだ本の好きな場面を、短い会話で聞いてみる。'},
 '英検®の力':{question:'目標級と受験時期は？前回結果があれば、読む・聞く・書く・話すの課題を確認しましょう。',measure:'目標級に合う課題で苦手技能を確認し、前回よりできた点を振り返る。',home:'授業で練習した表現を声に出す・短く書く機会をつくる。'},
 作文:{question:'書く題材が見つからない、言葉が浮かばない、順序が組めない、どこに支援が必要ですか？',measure:'学んだ言葉を使い、伝えたいことが分かる短い文や段落を書く。',home:'身近な出来事を「何があった・どう思った」の順で話す。'},
 中学受験:{question:'志望校・試験日・科目・直近の過去問結果を確認し、残り時間で優先する課題を絞りましょう。',measure:'選んだ課題を再確認し、過去問や類題で取り組みの成果を確かめる。',home:'担当者と決めた復習範囲に取り組み、質問を記録する。'}
 },
 explain(p,profile={}){
  const s=this.subject[p.subject]||this.subject.数学,k=profile.need||'habit',q=this.profiles[k]||this.profiles.habit;
  let reason='',checks=[],fit='確認して提案';const comp=p.composition.replace(/Ai/g,'AI');
  const isPower=p.kind==='力シリーズ';
  if(isPower){reason=p.subject==='読書の力'?'言葉や読書の経験を増やしたいお子さまに、音声と読書ワークを使って本に親しむ時間をつくるためです。':p.subject==='閃きの力'?'すぐに答えを求めず、自分で試して考える経験を増やし、図形や数量のイメージを育てるためです。':'受験級に合わせて英語を使う練習を行い、苦手な技能を確認しながら次の目標に取り組むためです。';fit=k==='roots'?'優先候補':'目的を分けて比較';checks.push('校舎の開講可否と現在の受講内容を確認。学校単元の補習とは目的を分ける。');}
  else if(p.kind==='オリジナル'){reason='志望校・答案・残り日程に合わせ、必要な科目と優先単元を個別に決める必要があるためです。';checks.push('内容・形式・教材・回数・料金を担当者が決定してから確定する。');fit='個別設計';}
  else if(p.kind==='作文'){reason='読む経験と語彙・表現の学習を組み合わせ、考えを言葉にする土台を整えるためです。';fit=k==='roots'?'優先候補':'目的を分けて比較';}
  else if(p.kind==='私立推薦'){reason='私立推薦入試までに、過去問で見えた疑問や必要な知識を整理し、本番へ向けた準備を進めるためです。';fit='進路に対応';checks.push('受験校の試験科目と出題内容を確認。学校推薦の条件をこの講座の受講で満たすと解釈しない。');}
  else if(p.kind==='難関高校'){reason='基礎の理解を確認したうえで、志望校に合わせた難度の演習と入試テーマに取り組むためです。';fit='進路に対応';checks.push('志望校の過去問と模試結果で、難度が合うかを確認する。');}
  else if(p.kind==='補強'){
   fit=['blocked','knowledge','habit'].includes(k)?'優先候補':'基本を確認する候補';
   if(p.subject==='英語'&&p.grade==='中3')reason='入試テーマと文法の弱点を確認し、理解を補う授業と演習を組み合わせて入試で使う基本を整えるためです。';
   else if(p.subject==='英語')reason='英単語の抜けを確認し、覚える・答える・覚え直す練習を繰り返して、英語学習の土台を整えるためです。';
   else if(p.subject==='国語'&&p.grade.startsWith('小'))reason='漢字を覚える学習と毎回のテストを組み合わせ、覚えたつもりになっている部分を確かめるためです。';
   else if(comp.includes('自立'))reason='学校や普段の教材を使い、取り組む課題と解き直しの順番を決めて、基本問題を確実にするためです。';
   else reason='現在の学習範囲を基本レベルから振り返り、理解や知識の抜けを一つずつ確認するためです。';
  }else{fit=['practice','stretch'].includes(k)?'優先候補':'理解度を確認して比較';reason=comp.includes('映像')&&!comp.includes('学トレ')?'学校の進度や理解度に合う映像単元を選び、学習後の確認まで進めて次のテストに備えるためです。':'既習内容を自力で使う演習を増やし、間違いの確認と解き直しを通じて知識を定着させるためです。';}
  if(k==='blocked'&&!isPower&&!p.kind.includes('オリジナル')&&!comp.includes('個別'))checks.unshift('解き方の説明が必要な場合、演習だけでは足りません。通常の個別指導や質問対応で理解を補う方法を確認してください。');
  if(p.grade==='高1'&&p.subject==='数学'&&p.kind==='強化'){checks.unshift('原資料の目安：河合偏差値50以上・学校テスト8割。個別担当の意見と映像を理解できるかも確認。');if(profile.readiness!=='ready')fit='理解度の確認が先';}
  if(p.grade==='高2'&&p.subject==='数学'&&p.kind==='強化')checks.push('模試から苦手単元を選定。教科書・共通テスト・国公立大入試のどのレベルが適切か、必要コマ数も確認。');
  if(p.subject==='国語'&&['小4','小5','小6'].includes(p.grade)&&p.kind==='強化')checks.push('確定資料の内容は主語・述語などの知識問題。初見の長文読解を中心とした講座と説明しない。');
  if(p.grade==='中3'&&p.subject==='社会')checks.push('夏期や入試対策プログラムで学習済みの単元と重複しないか確認。');
  if(['中1','中2'].includes(p.grade)&&p.subject==='理科')checks.push('学校・地域の進度に合わせて対象単元を選ぶ。強化の教材年度表記は担当者へ確認。');
  if(profile.prior)checks.push('既受講内容「'+profile.prior+'」と単元・教材の重複を照合。');
  if(!checks.length)checks.push('本人の答案・学校進度・開講日時を確認して最終決定。');
  let measure=s.measure;
  if(p.subject==='英語'&&p.kind==='補強'&&p.grade!=='中3')measure='学習した単語を見ずに答え、間違えた語を次の回でもう一度確認する。';
  if(p.grade==='中3'&&p.kind==='補強')reason='入試に向けて、'+p.subject+'の対象単元を学び、確認問題と解き直しで今優先する弱点を整えるためです。';
  if(p.grade==='中3'&&p.kind==='補強'&&p.subject==='英語')reason='入試テーマと文法の弱点を確認し、理解を補う授業と演習を組み合わせて入試で使う基本を整えるためです。';
  if(p.subject==='国語'&&p.grade.startsWith('小'))measure=p.kind==='補強'?'毎回の漢字テストと再テストで、学習した漢字を書けるか確認する。':p.kind==='強化'?'主語・述語など、学習した知識問題を自力で解いて確認する。':s.measure;
  if(p.grade==='高2'&&p.subject==='数学'&&p.kind==='強化')reason='模試で分かった苦手単元を、理解度に合う映像と確認テストで学び直し、受験学年へ向けた土台を整えるためです。';
  let home=s.home;
  if(p.subject==='英語')home='「今日はどの単語・表現を覚えた？」と一つ聞いてみてください。学習の確認や解説は校舎で行います。';
  if(['算数','数学','理科','社会'].includes(p.subject))home='「前よりできるようになったことは？」と短く聞き、取り組みをねぎらってください。難しい内容を教え直す必要はありません。';
  if(p.subject==='国語')home=p.grade.startsWith('小')&&p.kind==='補強'?'覚えた漢字を一つ聞き、できたことを一緒に喜んでください。間違いの確認は授業で続けます。':'新しく知った言葉や分かったことを一つ聞いてみてください。短い会話で十分です。';
  return {reason,checks,fit,question:s.question,measure,home,lead:q.lead};
 },
 load(selected,capacity,budget,extras){const counts=selected.map(x=>countOf(x.composition));const unknown=counts.some(x=>x===null),total=counts.reduce((a,b)=>a+(b||0),0);const hasCapacity=capacity!==''&&Number(capacity)>0;const feesKnown=selected.length>0&&selected.every(x=>validMoney(x.price))&&validMoney(extras);const amount=feesKnown?selected.reduce((a,x)=>a+Number(x.price),Number(extras)):null;return {total,unknown,over:hasCapacity&&total>Number(capacity),remaining:hasCapacity?Number(capacity)-total:null,feesKnown,amount,overBudget:feesKnown&&budget!==''&&Number(budget)>=0&&amount>Number(budget)};}
};

