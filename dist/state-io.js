'use strict';
// Validate completely before replacing the user's current work.
function validatedPlanState(s){
 const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
 const str=(v,limit=5000)=>{if(v===undefined)return '';if(typeof v!=='string'||v.length>limit)throw Error('文字項目が不正です');return v;};
 const choice=(v,values,fallback)=>{if(v===undefined)return fallback;if(!values.includes(v))throw Error('選択項目が不正です');return v;};
 const cash=v=>{if(v===undefined||v==='')return '';if(!validMoney(v))throw Error('金額が不正です');return String(v);};
 if(!object(s)||!grades.includes(s.grade)||!Array.isArray(s.selected)||s.selected.length>30||!object(s.fields))throw Error('保存形式が不正です');
 const result={grade:s.grade,case:choice(s.case,cases.map(c=>c.id),'foundation'),subject:str(s.subject||'すべて',60),schoolType:choice(s.schoolType,['standard','self'],'standard'),route:choice(s.route,['general','recommend','advanced'],'general'),selected:[],fields:{},verified:s.verified===true,extras:cash(s.extras),showAll:s.showAll===true};
 if(s.verified!==undefined&&typeof s.verified!=='boolean')throw Error('確認状態が不正です');
 const ids=new Set();for(const x of s.selected){
  if(!object(x))throw Error('講座が不正です');const p=planById(x.id);
  if(!p||p.grade!==s.grade||ids.has(x.id))throw Error('学年または講座が不正です');ids.add(x.id);
  const item={id:p.id,custom:p.kind==='オリジナル',price:cash(x.price)};
  for(const key of ['composition','description','title','goal','reason']){if(typeof x[key]!=='string')throw Error('講座の文章が不正です');item[key]=str(x[key]);}
  for(const key of ['focus','measure','home','priority','meaningNow','meaningAfter'])item[key]=str(x[key]);
  result.selected.push(item);
 }
 for(const key of ['student','school','teacher','goal','message','period','deadline','notes','phaseStart','phaseDuring','phaseEnd','homeMessage'])result.fields[key]=str(s.fields[key]);
 if(s.fields.includeMeaning!==undefined&&typeof s.fields.includeMeaning!=='boolean')throw Error('添付設定が不正です');
 result.fields.includeMeaning=s.fields.includeMeaning!==false;
 const c=s.coach===undefined?{}:s.coach;if(!object(c))throw Error('面談情報が不正です');
 result.coach={need:choice(c.need,Object.keys(COACH.profiles),'habit'),readiness:choice(c.readiness,['unknown','support','ready'],'unknown')};
 for(const key of ['prior','evidence'])result.coach[key]=str(c[key]);
 for(const key of ['capacity','budget']){const v=c[key];if(v===undefined||v==='')result.coach[key]='';else{if(!validMoney(v)||(key==='capacity'&&Number(v)<1))throw Error('回数・予算が不正です');result.coach[key]=String(v);}}
 return result;
}
function applyPlanState(s){Object.assign(state,s);$('search').value='';if($('show-all'))$('show-all').checked=state.showAll;updateCount();renderFilters();renderResults();renderProposal();}
