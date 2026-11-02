from pathlib import Path
import base64
import runpy
root=Path(__file__).resolve().parent
runpy.run_path(str(root/'tools/build_pages.py'))
html=(root/'tools/standalone-template.html').read_text()
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+(root/'style.css').read_text()+'</style>')
html=html.replace('<script src="catalog.js"></script>','<script>'+(root/'catalog.js').read_text()+'</script>')
html=html.replace('<script src="app.js"></script>','<script>'+(root/'app.js').read_text()+'</script>')
html=html.replace('<div data-view="catalog">','<div data-view="catalog" hidden>').replace('<div data-view="product">','<div data-view="product" hidden>')
for p in (root/'assets').iterdir():
 if p.suffix not in ['.png','.svg']:continue
 html=html.replace('assets/'+p.name,'data:'+('image/svg+xml' if p.suffix=='.svg' else 'image/png')+';base64,'+base64.b64encode(p.read_bytes()).decode())
output=root.parent/'bannaya-catalog.html'
output.write_text(html)
print(output,output.stat().st_size)
