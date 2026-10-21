from pathlib import Path
p=Path(__file__).parent
s=(p/'dist/index.html').read_text(encoding='utf-8')
s=s.replace('<link rel="stylesheet" href="style.css">','<style>'+(p/'dist/style.css').read_text(encoding='utf-8')+'</style>')
for name in ['data','app','planning','coach','meaning']:
 content=(p/f'dist/{name}.js').read_text(encoding='utf-8').replace('</script','<\\/script')
 s=s.replace(f'<script defer src="{name}.js"></script>',f'<script>{content}</script>' if name=='data' else '') if name=='data' else s
# UI scripts must run after the document has been parsed.
scripts='\n'.join((p/f'dist/{name}.js').read_text(encoding='utf-8').replace('</script','<\\/script') for name in ['app','planning','coach','meaning'])
for name in ['app','planning','coach','meaning']:s=s.replace(f'<script defer src="{name}.js"></script>','')
s=s.replace('</body>','<script>'+scripts+'</script></body>')
(p/'冬期講座提案アプリ.html').write_text(s,encoding='utf-8')
print('Standalone HTML built')
