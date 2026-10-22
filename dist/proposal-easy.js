 'use strict';
// Generated prose is linked to selected courses; explicit edits are preserved.
const FAMILY_MESSAGES=[
 ['together','一緒に学びを選ぶ','お子さまの今の学びと、次に目指す姿を大切に、この冬の講座をご提案します。ご本人の希望も伺いながら、無理なく取り組める内容を一緒に選んでいきましょう。'],
 ['basics','基礎を確かにする','この冬は、選んだ講座で大切な基本を一つずつ確かめる機会にしたいと考えています。曖昧なところを整理し、できることを増やしながら、次の学習につなげていきます。'],
 ['practice','自分でできる力を育てる','わかったことを、自分の力でできることへ。この冬は、選んだ内容を練習し、間違いを振り返る過程を大切にします。小さな変化をご家庭とも共有していきたいと考えています。'],
 ['next','次の学びに備える','この冬の取り組みが、次の学期や目標に向かう一歩となるよう、学習内容を選びました。今の理解を確かめながら、取り組む課題と進め方を一緒に整えていきましょう。'],
 ['confidence','自信と意欲を育てる','この冬は、小さな「できた」を積み重ねる時間にしたいと考えています。結果だけでなく、考えたことや続けた工夫にも目を向け、お子さまが次の学びに向かう自信を育てていきます。']
];
function linkedWinterGoal(){return state.selected.map(x=>x.title+'：'+(x.focus?'重点は'+x.focus:coursePurpose(planById(x.id)))+'。'+(x.goal||'')).join('\n');}
function syncEasyProposal(){
 const f=state.fields;
 if(!f.goalMode)f.goalMode=f.goal?'custom':'auto';
 if(!f.messageChoice)f.messageChoice=f.message?'custom':'together';
 if(f.goalMode==='auto')f.goal=linkedWinterGoal();
 const chosen=FAMILY_MESSAGES.find(m=>m[0]===f.messageChoice);if(chosen)f.message=chosen[2];
}
const goalLabel=$('goal').closest('label'),messageLabel=$('message').closest('label');
const goalPanel=document.createElement('section');goalPanel.className='easy-proposal';goalLabel.before(goalPanel);
goalPanel.innerHTML='<h3>この冬に取り組むこと</h3><label class="check"><input type="checkbox" id="link-winter-goal">選んだ講座・目標から自動で作る</label><p id="linked-goal-preview" class="easy-preview"></p><p class="muted">講座や講座別の目標を変更すると、この内容も更新します。</p>';
goalPanel.append(goalLabel);goalLabel.firstChild.textContent='自分で文章を調整';
const messagePanel=document.createElement('section');messagePanel.className='easy-proposal';messageLabel.before(messagePanel);
messagePanel.innerHTML='<h3>ご家庭へのメッセージ</h3><label>伝えたいことを選ぶ<select id="family-message-choice">'+FAMILY_MESSAGES.map(([id,label])=>'<option value="'+id+'">'+label+'</option>').join('')+'<option value="custom">自分で書く・保存済みの文章</option></select></label><p id="family-message-preview" class="easy-preview"></p><details id="family-message-edit"><summary>文章を少し調整する</summary></details>';
messagePanel.querySelector('details').append(messageLabel);messageLabel.firstChild.textContent='メッセージの文章';
const optional=document.createElement('details');optional.className='easy-optional';optional.innerHTML='<summary>日程・連絡事項を添える（任意）</summary>';messagePanel.after(optional);optional.append($('period').closest('.fieldrow'),$('notes').closest('label'));
$('extras').closest('label').hidden=true;$('budget').closest('label').hidden=true;$('verified').closest('label').lastChild.textContent='講座ごとの条件を確認しました';
$('verified').closest('label').nextElementSibling.textContent='未確認の条件がある場合は、保護者資料に「確認中」と記載します。料金は掲載しません。';
common.querySelector('summary').textContent='共通情報：通える回数・社員用メモ';common.querySelector('p').textContent='回数の合計は授業枠数です。通塾日数ではありません。';
function refreshEasyEditor(){
 syncEasyProposal();$('link-winter-goal').checked=state.fields.goalMode==='auto';goalLabel.hidden=state.fields.goalMode==='auto';
 $('linked-goal-preview').hidden=state.fields.goalMode!=='auto';$('linked-goal-preview').textContent=state.fields.goal||'講座を選ぶと、取り組むことがここにまとまります。';
 $('goal').value=state.fields.goal||'';$('family-message-choice').value=state.fields.messageChoice;
 $('message').value=state.fields.message||'';$('family-message-preview').textContent=state.fields.message||'';
 for(const el of document.querySelectorAll('[data-edit="price"]'))el.closest('label').hidden=true;
}
$('link-winter-goal').addEventListener('change',()=>{state.fields.goalMode=$('link-winter-goal').checked?'auto':'custom';renderPaper();});
$('family-message-choice').addEventListener('change',()=>{state.fields.messageChoice=$('family-message-choice').value;if(state.fields.messageChoice==='custom')$('family-message-edit').open=true;else $('family-message-edit').open=false;renderPaper();});
const easyPaper=renderPaper;renderPaper=function(){syncEasyProposal();easyPaper();
 for(const el of $('paper').querySelectorAll('.amount,.paper-total'))el.remove();
 for(const el of $('paper').querySelectorAll('p.muted'))if(/^(教材費・その他|入力済み金額の合計)/.test(el.textContent))el.remove();
 const goal=$('paper').querySelector('.winter-goal>b');if(goal)goal.textContent='この冬に取り組むこと';refreshEasyEditor();};
const easyProposal=renderProposal;renderProposal=function(){syncEasyProposal();easyProposal();refreshEasyEditor();
 for(const item of $('selected-edit').querySelectorAll('.selected-item')){
  const details=document.createElement('details');details.className='easy-course-edit';details.innerHTML='<summary>この講座の文章を調整（任意）</summary>';
  const labels=[...item.children].filter(el=>el.matches('label')&&el.querySelector('[data-edit="reason"],[data-edit="goal"]'));
  const extra=[...item.children].filter(el=>el.matches('details'));
  item.append(details);for(const el of [...labels,...extra])details.append(el);
 }
};
const easyPDF=parentPDFModel;parentPDFModel=function(){syncEasyProposal();const model=easyPDF();model.fields.goalMode=state.fields.goalMode;delete model.totalLabel;delete model.feeDetails;return model;};
const easyStyle=document.createElement('style');easyStyle.textContent='.easy-proposal{border-top:1px solid #d6e4ee;padding:18px 0 6px;margin:14px 0}.easy-proposal h3{font-size:17px;margin:0 0 12px}.easy-preview{white-space:pre-wrap;background:#edf5fa;border-radius:12px;padding:14px;font-size:14px;line-height:1.9;color:#193e56}.easy-course-edit summary,.easy-proposal summary,.easy-optional summary{cursor:pointer;color:#275a78;font-size:14px}.easy-optional{padding:14px 0;margin-bottom:12px}.easy-proposal .check{font-weight:normal}.easy-proposal .muted{font-size:12px}.easy-proposal input[type=checkbox]{flex-shrink:0}.easy-proposal textarea{min-height:140px}';document.head.append(easyStyle);
