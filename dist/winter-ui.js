'use strict';
function setWinterStep(n){steps.querySelectorAll('button').forEach(button=>{const active=button.dataset.stage===String(n);button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});}
const winterView=view;view=function(v){winterView(v);setWinterStep(v==='proposal'?3:1);};
steps.addEventListener('click',event=>{const button=event.target.closest('[data-stage]');if(button)setWinterStep(button.dataset.stage);});
$('show-candidates').addEventListener('click',()=>setWinterStep(2));
if(typeof IntersectionObserver!=='undefined'){
 const winterObserver=new IntersectionObserver(entries=>{if($('discover').hidden)return;for(const entry of entries){if(entry.isIntersecting)setWinterStep(entry.target.classList.contains('resulthead')?2:1);}}, {rootMargin:'-10% 0px -60% 0px',threshold:0});
 winterObserver.observe(document.querySelector('.profilebar'));winterObserver.observe(document.querySelector('.resulthead'));
}
document.querySelector('.journey').setAttribute('aria-label','提案作成の3ステップ');
document.querySelector('.hero .winter-art').setAttribute('aria-hidden','true');
setWinterStep(1);
