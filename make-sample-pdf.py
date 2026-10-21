from pathlib import Path
import json
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from PIL import Image,ImageDraw

root=Path(__file__).parent
d=json.loads((root/'samples/sample-data.json').read_text(encoding='utf8'))
s=d['state']; f=s['fields']; courses=s['selected']
pdfmetrics.registerFont(TTFont('JP','C:/Windows/Fonts/YuGothR.ttc',subfontIndex=0))
pdfmetrics.registerFont(TTFont('JPB','C:/Windows/Fonts/YuGothB.ttc',subfontIndex=0))
pdfmetrics.registerFont(TTFont('Mincho','C:/Windows/Fonts/msmincho.ttc',subfontIndex=0))
out=root/'output/pdf';out.mkdir(parents=True,exist_ok=True)
c=canvas.Canvas(str(out/'冬期講座_保護者向けサンプル.pdf'),pagesize=(595.28,841.89))
c.setTitle('2026冬期講座 ご提案書・この冬に学ぶ意義｜作成サンプル')
ink='#153f5c'; blue='#216386'; pale='#edf5fb'; coral='#b96f60'; muted='#587184'
art=Image.open(root/'dist/assets/winter-landscape.png').convert('RGBA')
overlay=Image.new('RGBA',art.size);dr=ImageDraw.Draw(overlay)
for x in range(art.width):dr.line((x,0,x,art.height),fill=(248,252,255,int(245*(1-x/art.width)**1.1)))
art=Image.alpha_composite(art,overlay).convert('RGB')
def text(t,x,y,w,size=10,font='JP',color=ink,leading=None):
    style=ParagraphStyle('p',fontName=font,fontSize=size,leading=leading or size*1.7,textColor=HexColor(color),wordWrap='CJK')
    p=Paragraph(escape(t).replace('\n','<br/>'),style);_,h=p.wrap(w,800)
    p.drawOn(c,x,y-h);return y-h
def box(x,y,w,h,color=pale):
    c.setFillColor(HexColor(color));c.roundRect(x,y-h,w,h,10,fill=1,stroke=0)
def top(page,title,kicker):
    c.setFillColor(HexColor('#ffffff'));c.rect(0,0,596,842,fill=1,stroke=0)
    c.drawImage(ImageReader(art),36,620,523,181,mask='auto')
    text('さなる個別 @will',52,786,250,11,'JPB',blue)
    text('WINTER LEARNING 2026',355,786,190,8,'JP',blue)
    text(kicker,52,755,480,9,color=muted)
    text(title,52,726,480,24,'Mincho',leading=37)
    c.setStrokeColor(HexColor('#d7e6f0'));c.line(36,49,559,49)
    text('作成サンプル · 架空の生徒／料金・日程は未確定',36,39,450,8,color=muted)
    text(f'{page} / 4',525,39,40,8,color=muted)
    return 600
def section(label,body,y):
    y=text(label,48,y,499,11,'JPB',coral)-6
    y=text(body,48,y,499,10)-15
    return y

y=top(1,'この冬の「できた」を、\n春の自信につなげよう。','冬期講座 ご提案書 / 小学5年生')
y=text(f['student']+' 様・保護者様へ',42,y,511,10,'JPB')-12
y=text(f['message'],42,y,511,10)-16
box(36,y,523,75);text('この冬に目指すこと',50,y-10,495,10,'JPB',blue);text(f['goal'],50,y-31,495,10);y-=94
for i,x in enumerate(courses):
    y=text(f"0{i+1}　{x['title']}",46,y,503,16,'Mincho',blue)-3
    y=text(x['composition']+' / 小学5年生',46,y,503,9,color=muted)-6
    y=text('おすすめする理由　'+x['reason'],46,y,503,10)-5
    y=text('冬の到達目標　'+x['goal'],46,y,503,10)-17
assert y>60,y
c.showPage()
y=top(2,'小さな一歩を、\n確かな手応えに。','冬期講座 ご提案書 / 学び方とご相談事項')
for i,x in enumerate(courses):
    y=section(f"0{i+1}　{x['title']}：取り組みと確認",'重点単元・課題：'+x['focus']+'\n成果の確かめ方：'+x['measure'],y)
y=section('冬の学びの進め方','はじめに：'+f['phaseStart']+'\n学習中：'+f['phaseDuring']+'\n終わりに：'+f['phaseEnd'],y)
y=section('ご家庭へ',f['homeMessage'],y)
box(36,y,523,57);text('受講回数 合計16回　／　ご提案総額（税込） 確認中',50,y-9,495,11,'JPB',blue);text('各講座の受講料・教材費等は校舎への確認後にご案内します。',50,y-33,495,9,color=muted);y-=72
y=text('受講期間：'+f['period']+'\n'+f['school']+'　担当：'+f['teacher'],42,y,511,9,color=muted)-10
y=text('開講日時・教材・受講条件は校舎と相談のうえ決定します。到達目標は学習の目安です。',42,y,511,8,color=muted)
assert y>55,y
c.showPage()
for i,(x,m) in enumerate(zip(courses,d['meanings'])):
    y=top(i+3,'この冬に、この学びを\n選ぶ理由。','保護者の皆さまへ / 小学5年生 / '+x['title'])
    y=text(m['headline'],42,y,511,20,'Mincho',blue)-12
    y=text('今回のご提案：'+x['composition'],42,y,511,9,color=muted)-20
    y=section('01　なぜ、この冬に？',m['now'],y)
    y=section('02　この講座で、どう学ぶ？',m['approach']+'\n今回の重点：'+x['focus'],y)
    y=section('03　次の学びへ、どうつなげる？',m['after']+'\n成長の確かめ方：'+x['measure'],y)
    box(36,y,523,70);text('ご家庭には、こんな応援を。',50,y-10,495,11,'JPB',blue);text(x['home'],50,y-33,495,10);y-=85
    y=text('理解度や学校の進度に合わせて調整します。学習の意義・到達目標はご提案の考え方であり、特定の点数や合格を約束するものではありません。',42,y,511,8,color=muted)
    assert y>55,(i,y)
    c.showPage()
c.save()
print('Created 4-page parent sample PDF')
