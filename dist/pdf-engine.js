/* Offline, deterministic A4 layout shared by the app and PDF verification. */
(function(root){
'use strict';
const W=595.28,H=841.89,BOTTOM=68;
const colors={ink:'#153f5c',blue:'#216386',pale:'#edf5fb',coral:'#b96f60',muted:'#587184'};
const clean=v=>String(v??'').replace(/\r\n?/g,'\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'');
async function create(model,assets=root.WINTER_PDF_ASSETS){
 if(!model.courses?.length)throw Error('先に講座を選んでください。');
 const {PDFDocument,rgb}=root.PDFLib,doc=await PDFDocument.create();
 const decode=s=>Uint8Array.from(atob(s),ch=>ch.charCodeAt(0));
 doc.registerFontkit(root.fontkit);
 const sansBytes=decode(assets.sans);
 // Embed complete static fonts: fontkit 1.x subsetting drops some Japanese outlines.
 const sans=await doc.embedFont(sansBytes,{subset:false});
 const bold=await doc.embedFont(decode(assets.bold),{subset:false});
 const serif=await doc.embedFont(decode(assets.serif),{subset:false});
 const fonts={sans,bold,serif},art=await doc.embedJpg(decode(assets.art));
 const supported=new Set(sans.getCharacterSet());const missing=new Set();
 function safe(t){return Array.from(clean(t),ch=>{if(ch==='\n'||supported.has(ch.codePointAt(0)))return ch;missing.add(ch);return '□';}).join('');}
 const color=k=>{const hex=colors[k]||k;return rgb(...[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255));};
 const lineEnd='（「『【〈《〔［｛';const lineStart='、。，．！？：；）」』】〉》〕］｝ーぁぃぅぇぉっゃゅょァィゥェォッャュョ';
 function lines(t,w,size=10,font='sans'){
  const result=[];
  for(const para of safe(t).split('\n')){let line='';for(const ch of Array.from(para)){
   if(line&&fonts[font].widthOfTextAtSize(line+ch,size)>w){
    if(lineStart.includes(ch)&&fonts[font].widthOfTextAtSize(line+ch,size)<=w+size){line+=ch;result.push(line);line='';continue;}
    let tail='';if(lineEnd.includes(line.slice(-1))){tail=line.slice(-1);line=line.slice(0,-1);}result.push(line);line=tail+ch;
   }else line+=ch;
  }result.push(line);}
  return result;
 }
 let page,y,title,kicker;const audit=[];
 function drawLine(t,x,top,size=10,font='sans',ink='ink'){
  page.drawText(t,{x,y:top-size,font:fonts[font],size,color:color(ink)});
  audit.push({page:doc.getPages().indexOf(page)+1,text:t,top,bottom:top-size,x,width:fonts[font].widthOfTextAtSize(t,size)});
 }
 function raw(t,x,top,w,size=10,font='sans',ink='ink',leading=size*1.7){const ls=lines(t,w,size,font);ls.forEach((line,i)=>drawLine(line,x,top-i*leading,size,font,ink));return top-ls.length*leading;}
 function newPage(continuation=false){
  page=doc.addPage([W,H]);page.drawImage(art,{x:36,y:620,width:523,height:181});
  raw('さなる個別 @will',52,786,250,11,'bold','blue');raw('WINTER LEARNING 2026',355,786,190,8,'sans','blue');
  const headerText=kicker+(continuation?' / 続き':'');const headerLines=lines(headerText,460,9);raw(headerLines[0]+(headerLines.length>1?'…':''),52,755,480,9,'sans','muted');raw(title,52,726,480,24,'serif','ink',37);y=600;
 }
 function start(t,k){title=t;kicker=k;newPage();}
 function ensure(h){if(y-h<BOTTOM&&y<599)newPage(true);}
 function paragraph(t,{x=42,w=511,size=10,font='sans',ink='ink',gap=12}={}){
  const ls=lines(t,w,size,font),leading=size*1.7;
  if(ls.length*leading<500)ensure(ls.length*leading+gap);
  for(const line of ls){ensure(leading);drawLine(line,x,y,size,font,ink);y-=leading;}y-=gap;
 }
 function section(label,body){const n=lines(body,499).length;ensure(25+Math.min(n*17,90));paragraph(label,{x:48,w:499,size:11,font:'bold',ink:'coral',gap:6});paragraph(body,{x:48,w:499,gap:15});}
 function rounded(x,top,w,h){
  const r=10;page.drawRectangle({x:x+r,y:top-h,width:w-2*r,height:h,color:color('pale')});page.drawRectangle({x,y:top-h+r,width:w,height:h-2*r,color:color('pale')});
  for(const cx of [x+r,x+w-r])for(const cy of [top-r,top-h+r])page.drawCircle({x:cx,y:cy,size:r,color:color('pale')});
 }
 function panel(label,body,minH=70){const ls=lines(body,495);const h=Math.max(minH,43+ls.length*17);if(h>500){section(label,body);return;}ensure(h+15);rounded(36,y,523,h);raw(label,50,y-10,495,10,'bold','blue');raw(body,50,y-31,495);y-=h+15;}
 const {fields:f,courses,grade,flow}=model;
 start('この冬の「できた」を、\n春の自信につなげよう。','冬期講座 ご提案書 / '+grade);
 paragraph((f.student?f.student+' 様':'お子さま')+'・保護者様へ',{font:'bold'});
 paragraph(f.message||'一人ひとりの今と、目指す姿に合わせて。この冬に取り組んでほしい学びをご提案します。',{gap:16});
 panel('この冬に目指すこと',f.goal||'一つひとつ確かめながら、自分の力でできることを増やしていきましょう。',75);
 courses.forEach((x,i)=>{
  const h=65+17*(lines('おすすめする理由　'+x.reason,503).length+lines('冬の到達目標　'+x.goal,503).length);ensure(Math.min(h,500));
  paragraph(String(i+1).padStart(2,'0')+'　'+x.title,{x:46,w:503,size:16,font:'serif',ink:'blue',gap:3});
  paragraph(x.composition.replace(/\n/g,' ')+' / '+grade,{x:46,w:503,size:9,ink:'muted',gap:6});
  if(x.description)paragraph(x.description,{x:46,w:503,size:9,ink:'muted',gap:7});
  paragraph('おすすめする理由　'+x.reason,{x:46,w:503,gap:5});paragraph('冬の到達目標　'+x.goal,{x:46,w:503,gap:17});
 });
 start('小さな一歩を、\n確かな手応えに。','冬期講座 ご提案書 / 学び方とご相談事項');
 courses.forEach((x,i)=>section(String(i+1).padStart(2,'0')+'　'+x.title+'：取り組みと確認','重点単元・課題：'+(x.focus||x.description)+'\n成果の確かめ方：'+(x.measure||x.goal)));
 section('冬の学びの進め方','はじめに：'+flow.phaseStart+'\n学習中：'+flow.phaseDuring+'\n終わりに：'+flow.phaseEnd);
 section('ご家庭へ',flow.homeMessage);
 panel('受講回数 '+model.countLabel+' ／ ご提案総額（税込） '+model.totalLabel,model.feeDetails,57);
 paragraph([f.period&&'受講期間：'+f.period,f.deadline&&'ご相談・申込期限：'+f.deadline,f.notes,(f.school||'校舎名 未入力')+(f.teacher?'　担当：'+f.teacher:'')].filter(Boolean).join('\n'),{size:9,ink:'muted',gap:10});
 paragraph('開講日時・教材・受講条件は校舎と相談のうえ決定します。到達目標は学習の目安です。',{size:8,ink:'muted'});
 if(model.includeMeaning)for(const x of courses){const m=x.meaning;
  start('この冬に、この学びを\n選ぶ理由。','保護者の皆さまへ / '+grade+' / '+x.title);
  if(lines(kicker,460,9).length>1)paragraph(x.title,{size:12,font:'bold',ink:'blue'});
  paragraph(m.headline,{size:20,font:'serif',ink:'blue',gap:12});paragraph('今回のご提案：'+x.composition.replace(/\n/g,' '),{size:9,ink:'muted',gap:20});
  section('01　なぜ、この冬に？',x.meaningNow||m.now);
  section('02　この講座で、どう学ぶ？',m.approach+(x.focus?'\n今回の重点：'+x.focus:''));
  section('03　次の学びへ、どうつなげる？',(x.meaningAfter||m.after)+'\n成長の確かめ方：'+(x.measure||x.goal));
  panel('ご家庭には、こんな応援を。',x.home||'取り組みの中でできるようになったことを、短い会話で聞いてみてください。');
  paragraph('理解度や学校の進度に合わせて調整します。学習の意義・到達目標はご提案の考え方であり、特定の点数や合格を約束するものではありません。',{size:8,ink:'muted'});
 }
 const pages=doc.getPages();pages.forEach((p,i)=>{page=p;p.drawLine({start:{x:36,y:49},end:{x:559,y:49},thickness:.6,color:color('#d7e6f0')});raw('2026冬期講座 ご提案書・冬の学びガイド',36,39,450,8,'sans','muted');raw((i+1)+' / '+pages.length,510,39,49,8,'sans','muted');});
 if(missing.size)throw Error('PDFに使えない文字があります：'+[...missing].join(' ')+'。別の表記に変更してください。');
 doc.setTitle('2026冬期講座 ご提案書・この冬に学ぶ意義');doc.setAuthor('さなる個別@will');
 return {bytes:await doc.save(),pageCount:pages.length,audit};
}
root.WinterPDF={create};
})(globalThis);
