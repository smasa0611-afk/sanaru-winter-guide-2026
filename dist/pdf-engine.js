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
 const compact=model.courses.length===1;
 let page,y,title,kicker;const audit=[];
 function drawLine(t,x,top,size=10,font='sans',ink='ink'){
  page.drawText(t,{x,y:top-size,font:fonts[font],size,color:color(ink)});
  audit.push({page:doc.getPages().indexOf(page)+1,text:t,top,bottom:top-size,x,width:fonts[font].widthOfTextAtSize(t,size)});
 }
 function raw(t,x,top,w,size=10,font='sans',ink='ink',leading=size*1.7){const ls=lines(t,w,size,font);ls.forEach((line,i)=>drawLine(line,x,top-i*leading,size,font,ink));return top-ls.length*leading;}
 function newPage(continuation=false){
  page=doc.addPage([W,H]);page.drawImage(art,{x:36,y:compact?680:620,width:523,height:compact?121:181});
  raw('さなる個別 @will',52,786,250,11,'bold','blue');raw('WINTER LEARNING 2026',355,786,190,8,'sans','blue');
  const headerText=kicker+(continuation?' / 続き':'');const headerLines=lines(headerText,460,9);raw(headerLines[0]+(headerLines.length>1?'…':''),52,755,480,9,'sans','muted');raw(title,52,compact?735:726,480,compact?20:24,'serif','ink',compact?28:37);y=compact?663:600;
 }
 function start(t,k){title=t;kicker=k;newPage();}
 function ensure(h){if(y-h<BOTTOM&&y<599)newPage(true);}
 function paragraph(t,{x=42,w=511,size=10,font='sans',ink='ink',gap=compact?8:12}={}){
  const ls=lines(t,w,size,font),leading=size*1.7;
  if(ls.length*leading<500)ensure(ls.length*leading+gap);
  for(const line of ls){ensure(leading);drawLine(line,x,y,size,font,ink);y-=leading;}y-=gap;
 }
 function section(label,body){const n=lines(body,499).length;ensure(25+Math.min(n*17,90));paragraph(label,{x:48,w:499,size:11,font:'bold',ink:'coral',gap:6});paragraph(body,{x:48,w:499,gap:compact?8:15});}
 function rounded(x,top,w,h){
  const r=10;page.drawRectangle({x:x+r,y:top-h,width:w-2*r,height:h,color:color('pale')});page.drawRectangle({x,y:top-h+r,width:w,height:h-2*r,color:color('pale')});
  for(const cx of [x+r,x+w-r])for(const cy of [top-r,top-h+r])page.drawCircle({x:cx,y:cy,size:r,color:color('pale')});
 }
 function panel(label,body,minH=70){const ls=lines(body,495);const h=Math.max(minH,43+ls.length*17);if(h>500){section(label,body);return;}ensure(h+15);rounded(36,y,523,h);raw(label,50,y-10,495,10,'bold','blue');raw(body,50,y-31,495);y-=h+15;}
 const {fields:f,courses,grade,flow}=model;
 if(courses.length>10)throw Error('読みやすい2枚にまとめられるのは10講座までです。講座を絞ってください。');
 // Keep font sizes fixed. Allocate space by course count, then select key sentences.
 function brief(text,maxLines,w,size=10.5){
  const value=clean(text).trim();let out=lines(value,w,size);
  if(out.length<=maxLines)return out;
  const sentences=value.match(/[^。！？\n]+[。！？]?/g)||[value];let chosen='';
  for(const sentence of sentences){if(lines(chosen+sentence,w,size).length>maxLines)break;chosen+=sentence;}
  if(chosen)return lines(chosen,w,size);
  out=out.slice(0,maxLines);let tail=out[out.length-1];while(fonts.sans.widthOfTextAtSize(tail+'…',size)>w)tail=tail.slice(0,-1);out[out.length-1]=tail+'…';return out;
 }
 function block(text,x,top,w,maxLines,size=10.5,font='sans',ink='ink'){
  const out=brief(text,maxLines,w,size);out.forEach((line,i)=>drawLine(line,x,top-i*15,size,font,ink));return top-out.length*15;
 }
 function header(title,sub){
  page=doc.addPage([W,H]);page.drawImage(art,{x:36,y:701,width:523,height:100});
  raw('さなる個別 @will',50,787,260,11,'bold','blue');raw('WINTER LEARNING 2026',362,787,180,8,'sans','blue');
  raw(title,50,757,490,22,'serif','ink',30);raw(sub,50,718,490,9,'sans','muted');
 }
 const columns=courses.length<=3?1:2,rows=Math.ceil(courses.length/columns),gap=12,cardW=(523-gap*(columns-1))/columns;
 const cardTop=600,cardBottom=159,cardH=(cardTop-cardBottom-gap*(rows-1))/rows;
 function cards(kind){courses.forEach((x,i)=>{
  const col=i%columns,row=Math.floor(i/columns),left=36+col*(cardW+gap),top=cardTop-row*(cardH+gap),width=cardW-24;
  rounded(left,top,cardW,cardH);let pos=top-10;
  pos=block(String(i+1).padStart(2,'0')+'  '+x.title,left+12,pos,width,1,12,'bold','blue')-5;
  if(kind==='proposal'){
   // Formats/counts are never summarized; every source unit remains visible.
   const compLines=lines(x.composition.replace(/\n/g,' '),width,10.5);
   compLines.forEach((line,j)=>drawLine(line,left+12,pos-j*15,10.5,'sans','muted'));pos-=compLines.length*15+7;
   const remaining=Math.max(1,Math.floor((pos-(top-cardH+8))/15));
   if(pos<top-cardH+23)throw Error('授業構成の文章が長すぎます。形式と回数を簡潔に整えてください。');
   if(remaining>=5){pos=block('取り組み：'+x.description,left+12,pos,width,2)-3;}
   block((x.focus?'重点：'+x.focus+'。':'')+'目標：'+x.goal,left+12,pos,width,remaining>=5?remaining-3:remaining);
  }else{
   const remaining=Math.max(2,Math.floor((pos-(top-cardH+8))/15));
   const why=x.meaningNow||x.meaning.now;
   const whyLines=remaining>=7?Math.ceil(remaining*.55):remaining;
   pos=block('この冬に：'+why,left+12,pos,width,whyLines);
   if(remaining>=7)block('次の学びへ：'+(x.meaningAfter||x.meaning.after),left+12,pos-5,width,remaining-whyLines-1);
  }
 });}
 header('この冬の学びをご提案します',grade+' / '+courses.length+'講座');
 block((f.student?f.student+' 様':'お子さま')+'・保護者様へ',42,682,511,1,11,'bold');
 block(f.message||'この冬の学びを通して、一つひとつ「できた」を増やしていきましょう。',42,657,511,f.goalMode==='custom'?2:3);
 if(f.goalMode==='custom'&&f.goal)block('この冬の目標：'+f.goal,42,625,511,1);
 cards('proposal');
 block('受講回数：'+model.countLabel,42,144,511,2,10);
 const contact=[f.period&&'受講期間：'+f.period,f.deadline&&'相談期限：'+f.deadline,(f.school||'校舎名 未入力')+(f.teacher?' ／ 担当：'+f.teacher:'')].filter(Boolean).join(' ／ ');
 block(contact,42,107,511,2,9);
 block('受講内容・日程は校舎と相談して決定します。'+(f.notes||''),42,76,511,1,8);
 if(model.includeMeaning){
  header('この冬に学ぶ意義',grade+' / ご家庭と共有したいこと');
  block('いまの課題を確かめ、選んだ講座で練習し、次の学びへつなげる冬に。',42,680,511,2,12,'bold','blue');
  block('講座ごとの「なぜ今取り組むか」をまとめました。',42,642,511,2);
  cards('meaning');
  block('ご家庭での応援',42,145,511,1,11,'bold','blue');
  block(flow.homeMessage||'できたことや工夫したことを聞き、日々の取り組みをねぎらってください。',42,123,511,2);
  block('内容は2枚で読みやすくするため要点を整理しています。到達目標は学習の目安です。',42,78,511,1,8);
 }
 const pages=doc.getPages();pages.forEach((p,i)=>{page=p;p.drawLine({start:{x:36,y:49},end:{x:559,y:49},thickness:.6,color:color('#d7e6f0')});raw('2026冬期講座 ご提案書・冬の学びガイド',36,39,450,8,'sans','muted');raw((i+1)+' / '+pages.length,510,39,49,8,'sans','muted');});
 if(missing.size)throw Error('PDFに使えない文字があります：'+[...missing].join(' ')+'。別の表記に変更してください。');
 doc.setTitle('2026冬期講座 ご提案書・この冬に学ぶ意義');doc.setAuthor('さなる個別@will');
 return {bytes:await doc.save(),pageCount:pages.length,audit};
}
root.WinterPDF={create};
})(globalThis);
