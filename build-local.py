from pathlib import Path
import base64
p=Path(__file__).parent
s=(p/'dist/index.html').read_text(encoding='utf-8')
for name in ['style','winter','diagnosis']:
 css=(p/f'dist/{name}.css').read_text(encoding='utf-8')
 if name=='winter':
  image=base64.b64encode((p/'dist/assets/winter-landscape.png').read_bytes()).decode('ascii')
  css=css.replace('assets/winter-landscape.png','data:image/png;base64,'+image)
 s=s.replace(f'<link rel="stylesheet" href="{name}.css">','<style>'+css+'</style>')
names=['data','app','planning','selection-model','state-io','coach','meaning','winter-ui','parent-doc','vendor/pdf-lib.min','vendor/fontkit.min','pdf-assets','pdf-engine','pdf-ui','simple-ui','proposal-easy','booking-config','diagnosis']
scripts='\n'.join((p/f'dist/{name}.js').read_text(encoding='utf-8').replace('</script','<\\/script') for name in names)
for name in names:s=s.replace(f'<script defer src="{name}.js"></script>','')
s=s.replace('</body>','<script>'+scripts+'</script></body>')
(p/'冬期講座提案アプリ.html').write_text(s,encoding='utf-8')
print('Standalone HTML built with embedded winter artwork')
