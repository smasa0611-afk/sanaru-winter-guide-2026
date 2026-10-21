'use strict';
// One shared style for the in-app preview, print and downloaded parent HTML.
const PARENT_CSS=`
.parent-document{color:#163f5a;font-family:Meiryo,'Yu Gothic',sans-serif;font-size:13px;line-height:1.85;background:white;padding:36px;max-width:800px;margin:auto}
.parent-document *{box-sizing:border-box}
.parent-document .document-cover{position:relative;border:1px solid #d3e5f2;border-radius:20px;overflow:hidden;padding:26px 30px;margin:0 0 24px;background:#edf6fc}
.parent-document .document-cover:before{content:'';position:absolute;inset:0;background-image:linear-gradient(90deg,rgba(248,252,255,.98),rgba(248,252,255,.72) 52%,rgba(248,252,255,.05)),var(--winter-scene);background-size:cover;background-position:center;opacity:.95}
.parent-document .document-cover>*{position:relative}
.parent-document .document-cover .paper-top{font-size:11px;border:0;padding:0;margin:0 0 22px;display:flex;justify-content:space-between;gap:15px;color:#205b7d}
.parent-document h1{font-family:'Yu Mincho',serif;font-size:29px;line-height:1.6;letter-spacing:.04em;margin:12px 0;color:#103e5b}
.parent-document .salutation,.parent-document .meaning-kicker{font-size:11px;margin:0;color:#526c80}
.parent-document .letter{font-size:12px;max-width:440px}
.parent-document .winter-goal{background:#edf5fb;border-left:4px solid #31799f;border-radius:0 12px 12px 0;padding:16px 20px;white-space:pre-wrap;margin:18px 0}
.parent-document .winter-goal b{display:block;color:#1d6289;font-size:11px;letter-spacing:.1em;margin-bottom:6px}
.parent-document .paper-course{border:1px solid #d5e4ee;border-radius:14px;padding:18px 22px;margin:18px 0;break-inside:avoid;background:#fff}
.parent-document h2{font-size:18px;margin:8px 0;color:#155477}
.parent-document p{margin:9px 0;white-space:pre-wrap}
.parent-document .composition{font-size:11px;color:#466f88;border-bottom:1px solid #e1edf4;padding-bottom:10px}
.parent-document .amount{text-align:right;font-size:12px}
.parent-document .muted,.parent-document .paper-meta,.parent-document .paper-end{font-size:10px;color:#5b7282}
.parent-document .paper-total{display:flex;justify-content:space-between;background:#eaf3fa;border-radius:10px;padding:16px 20px;font-weight:bold}
.parent-document .winter-flow{border-top:1px solid #c9deed;margin-top:24px;padding-top:12px;break-inside:avoid}
.parent-document .winter-flow h2{font-family:'Yu Mincho',serif}
.parent-document .winter-flow p{font-size:11px}
.parent-document .paper-meta{border-top:1px solid #d5e4ee;margin-top:20px;padding-top:14px}
.parent-document .paper-end{margin-top:20px;line-height:1.7}
.parent-document .meaning-page{padding-top:0!important;margin-top:36px;break-before:page;page-break-before:always}
.parent-document .meaning-headline{font-family:'Yu Mincho',serif;font-size:21px;margin:18px 0;color:#185d82}
.parent-document .meaning-block{border-bottom:1px solid #dce9f2;padding:12px 0;break-inside:avoid}
.parent-document .meaning-block h3{font-size:13px;color:#b66e60;margin:0 0 8px}
.parent-document .meaning-block p{font-size:12px;line-height:1.9}
.parent-document .meaning-home{background:#edf5fb;border-radius:12px;padding:15px 20px;margin-top:20px;font-size:12px;break-inside:avoid}
@page{size:A4;margin:14mm}
@media print{.parent-document{padding:0!important;max-width:none;border:0!important;box-shadow:none!important;font-size:11px}.parent-document .document-cover{print-color-adjust:exact;-webkit-print-color-adjust:exact}.parent-document .meaning-page{margin-top:0}.parent-document h1{font-size:26px}.parent-document .paper-course{padding:14px 18px}.parent-document .paper-course p{font-size:11px}}
@media screen and (max-width:600px){.parent-document{padding:18px}.parent-document .document-cover{padding:20px}.parent-document h1{font-size:24px}}
`;
const parentStyle=document.createElement('style');parentStyle.textContent=PARENT_CSS;document.head.append(parentStyle);
const winterParentRender=renderPaper;
renderPaper=function(){winterParentRender();const paper=$('paper');paper.classList.add('parent-document');
 for(const root of [paper,...paper.querySelectorAll('.meaning-page')]){const cover=document.createElement('header');cover.className='document-cover';const end=root===paper?root.querySelector('.letter'):root.querySelector('h1');const nodes=[];for(let n=root.firstElementChild;n;n=n.nextElementSibling){nodes.push(n);if(n===end)break;}root.prepend(cover);nodes.forEach(n=>cover.append(n));}
};
function parentDocumentHTML(){const scene=document.querySelectorAll('style');let artwork='';for(const el of scene){const match=el.textContent.match(/--winter-scene\s*:\s*(url\([^)]*\))/);if(match){artwork=match[1];break;}}
 return '<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>2026冬期講座 ご提案書</title><style>:root{--winter-scene:'+ (artwork||'url("assets/winter-landscape.png")')+'}'+PARENT_CSS+'</style></head><body class="parent-document">'+$('paper').innerHTML+'</body></html>';
}
const oldDownload=$('download'),newDownload=oldDownload.cloneNode(true);oldDownload.replaceWith(newDownload);
newDownload.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([parentDocumentHTML()],{type:'text/html;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='2026冬期講座_ご提案書.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('冬のデザインで提案書と添付資料を保存しました');});
renderPaper();
