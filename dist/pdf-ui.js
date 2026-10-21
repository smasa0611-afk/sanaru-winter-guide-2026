'use strict';
function parentPDFModel(){
 const fields={};for(const key of ['student','school','teacher','goal','message','period','deadline','notes'])fields[key]=String(state.fields[key]||'');
 const flow=phaseDefaults();for(const key of Object.keys(flow))flow[key]=String(state.fields[key]||flow[key]);
 const courses=state.selected.map(x=>{const item={};for(const key of ['id','title','composition','description','reason','goal','focus','measure','home','meaningNow','meaningAfter'])item[key]=String(x[key]||'');item.meaning=WINTER_MEANING.get(planById(x.id),x);return item;});
 const counts=courses.map(x=>countOf(x.composition)),known=state.selected.every(x=>validMoney(x.price))&&validMoney(state.extras);
 const total=known?state.selected.reduce((s,x)=>s+Number(x.price),Number(state.extras)):null;
 const fees=state.selected.map(x=>x.title+'：'+(validMoney(x.price)?money(x.price):'確認中')).join(' / ')+'\n教材費・その他：'+(validMoney(state.extras)?money(state.extras):'確認中');
 return {fields,courses,grade:state.grade.replace(/^小/,'小学').replace(/^中/,'中学').replace(/^高/,'高校')+'年生',flow,includeMeaning:state.fields.includeMeaning!==false,countLabel:counts.every(n=>n!==null)?'合計'+counts.reduce((a,b)=>a+b,0)+'回':'個別相談',totalLabel:known&&state.verified?money(total):'確認中',feeDetails:fees+(known&&!state.verified?'\n入力済み合計 '+money(total)+'（受講条件の確認前）':'')};
}
const oldPrintPDF=$('print'),pdfButton=oldPrintPDF.cloneNode(true);oldPrintPDF.replaceWith(pdfButton);pdfButton.textContent='まとめてPDFを作成 ↓';
const pdfStatus=document.createElement('p');pdfStatus.id='pdf-status';pdfStatus.className='muted';pdfStatus.setAttribute('role','status');pdfStatus.setAttribute('aria-live','polite');
pdfStatus.textContent='サンプルと同じA4デザインで、提案書＋選択講座ごとの「この冬に学ぶ意義」を1つのPDFにします。文章が長い場合は続きのページを追加します。';
document.querySelector('.preview-column > .muted').replaceWith(pdfStatus);
const pdfPreview=document.createElement('section');pdfPreview.id='pdf-preview';pdfPreview.hidden=true;pdfPreview.innerHTML='<div class="pdf-actions"><b id="pdf-summary"></b><a id="pdf-save" class="primary linkbutton">PDFを保存 ↓</a><a id="pdf-open" class="secondary linkbutton" target="_blank" rel="noopener">PDFを開く ↗</a><button id="pdf-close" class="textbtn" type="button">プレビューを閉じる</button></div><p class="muted">下のPDFが保存されます。入力を変更した場合は「まとめてPDFを作成」で作り直してください。表示できない端末では「PDFを保存」をご利用ください。</p><iframe title="作成した保護者向けPDF" id="pdf-frame"></iframe>';
pdfStatus.after(pdfPreview);
const pdfUIStyle=document.createElement('style');pdfUIStyle.textContent='#pdf-preview{background:#edf5fb;border:1px solid #c9dfee;border-radius:16px;padding:18px;margin:15px 0}.pdf-actions{display:flex;flex-wrap:wrap;align-items:center;gap:12px}.pdf-actions b{margin-right:auto}#pdf-frame{width:100%;height:760px;border:0;border-radius:8px;background:white}#pdf-status[data-error=true]{color:#a34538}@media(max-width:650px){#pdf-frame{height:560px}.pdf-actions a{font-size:12px}}@media print{#pdf-preview,#pdf-status{display:none!important}}';document.head.append(pdfUIStyle);
let activePDFURL=null,pdfBusy=false;
$('pdf-close').onclick=()=>{pdfPreview.hidden=true;};
pdfButton.addEventListener('click',async()=>{
 if(pdfBusy||!state.selected.length)return;
 pdfBusy=true;pdfButton.disabled=true;pdfButton.textContent='冬の資料を作成中…';pdfStatus.dataset.error='false';pdfStatus.textContent='選んだ講座と入力内容からPDFを作成しています。';pdfPreview.hidden=true;
 const model=parentPDFModel();
 try{
  await new Promise(resolve=>setTimeout(resolve,30));
  const result=await WinterPDF.create(model);
  if(activePDFURL)URL.revokeObjectURL(activePDFURL);
  activePDFURL=URL.createObjectURL(new Blob([result.bytes],{type:'application/pdf'}));
  $('pdf-save').href=activePDFURL;$('pdf-save').download='2026冬期講座_ご提案書・冬の学び.pdf';$('pdf-open').href=activePDFURL;$('pdf-frame').src=activePDFURL;
  $('pdf-summary').textContent=result.pageCount+'ページのPDFができました';pdfPreview.hidden=false;pdfStatus.textContent='PDFを確認して「PDFを保存」を押してください。日本語フォントと雪景色を埋め込んでいます。';pdfPreview.scrollIntoView({behavior:'smooth',block:'start'});
 }catch(error){pdfStatus.dataset.error='true';pdfStatus.textContent='PDFを作成できませんでした。'+(error.message||'入力内容を確認して、もう一度お試しください。');}
 finally{pdfBusy=false;pdfButton.disabled=!state.selected.length;pdfButton.textContent='まとめてPDFを作成 ↓';}
});
