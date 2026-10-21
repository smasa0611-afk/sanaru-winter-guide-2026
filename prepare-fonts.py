from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).parent.parent/'tmp/pdf-font-tools'))
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
p=Path(__file__).parent/'dist/vendor'
for source,target,weight in [('NotoSansJP.ttf','WinterSans.ttf',400),('NotoSansJP.ttf','WinterSansBold.ttf',600),('NotoSerifJP.ttf','WinterSerif.ttf',400)]:
 font=TTFont(p/source)
 instantiateVariableFont(font,{'wght':weight},inplace=True)
 glyphset=font.getGlyphSet()
 # Fontkit's old subset writer cannot reliably remap these composite glyphs.
 # Flatten composites before browser subsetting, keeping every outline intact.
 replacements={}
 for name in font.getGlyphOrder():
  if font['glyf'][name].isComposite():
   recording=DecomposingRecordingPen(glyphset);glyphset[name].draw(recording)
   pen=TTGlyphPen(None);recording.replay(pen);replacements[name]=pen.glyph()
 for name,glyph in replacements.items():font['glyf'][name]=glyph
 # Preserve the full Japanese character set, including names and uncommon kanji.
 font.save(p/target)
 print(target,(p/target).stat().st_size)
