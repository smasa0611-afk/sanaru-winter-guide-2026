"""Prepare offline PDF assets. Noto fonts are redistributed under SIL OFL."""
from pathlib import Path
from PIL import Image, ImageDraw
import base64,json,io
p=Path(__file__).parent
art=Image.open(p/'dist/assets/winter-landscape.png').convert('RGBA')
overlay=Image.new('RGBA',art.size);dr=ImageDraw.Draw(overlay)
for x in range(art.width):
 dr.line((x,0,x,art.height),fill=(248,252,255,int(245*(1-x/art.width)**1.1)))
art=Image.alpha_composite(art,overlay).convert('RGB')
buff=io.BytesIO();art.save(buff,format='JPEG',quality=92)
assets={n:base64.b64encode((p/f'dist/vendor/{file}').read_bytes()).decode() for n,file in [('sans','WinterSans.ttf'),('bold','WinterSansBold.ttf'),('serif','WinterSerif.ttf')]}
assets['art']=base64.b64encode(buff.getvalue()).decode()
(p/'dist/pdf-assets.js').write_text('globalThis.WINTER_PDF_ASSETS='+json.dumps(assets)+';\n',encoding='utf8')
print('Offline Japanese fonts and winter art prepared')
