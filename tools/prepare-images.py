"""Optimise the source illustrations into WebP for the site.

    python tools/prepare-images.py        (needs Pillow: pip install pillow)

Writes, for every source image:
  - assets/images/<name>.webp        the main file (unchanged URL; used for og:image)
  - assets/images/<name>-<w>.webp    smaller widths for srcset (mobile-first)
  - assets/images/manifest.json      widths/heights read by build.mjs to emit
                                     srcset + sizes on every <img>
"""
import json
from pathlib import Path
from PIL import Image

DEST = Path(__file__).resolve().parents[1] / 'assets' / 'images'
SOURCE = Path(__file__).resolve().parents[1] / 'source-images'
VARIANT_WIDTHS = (480, 800, 1200)

IMAGES = {
    SOURCE / 'homepage-pozo-artesiano-original.png': ('pozo-artesiano-perforacion.webp', 2000, 82),
    SOURCE / 'servicio-pozo-artesiano-original.png': ('pozo-artesiano-servicio.webp', 1400, 80),
    SOURCE / 'bomba-tablero-original.png': ('bomba-pozo-artesiano.webp', 1400, 80),
    SOURCE / 'desague-camion-original.png': ('desague-pozo-ciego-camion.webp', 1400, 80),
    SOURCE / 'pozo-lleno-inspeccion-original.png': ('pozo-ciego-lleno-inspeccion.webp', 1400, 80),
    SOURCE / 'sistema-septico-original.png': ('pozo-septico-instalacion.webp', 1400, 80),
    SOURCE / 'tratamiento-agua-original.png': ('tratamiento-agua-filtros.webp', 1400, 80),
    SOURCE / 'analisis-agua-original.png': ('analisis-calidad-agua.webp', 1200, 80),
}

DEST.mkdir(parents=True, exist_ok=True)
manifest = {}


def resized(image, width):
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.LANCZOS)


for source_path, (dest_name, max_width, quality) in IMAGES.items():
    with Image.open(source_path) as original:
        original = original.convert('RGB')
        main = resized(original, max_width) if original.width > max_width else original
        main.save(DEST / dest_name, 'WEBP', quality=quality, method=6)
        variants = []
        for width in VARIANT_WIDTHS:
            if width >= main.width:
                continue
            stem = dest_name[:-5]
            resized(original, width).save(DEST / f'{stem}-{width}.webp', 'WEBP', quality=quality, method=6)
            variants.append(width)
        manifest[dest_name] = {'width': main.width, 'height': main.height, 'variants': variants}
        print(f'{dest_name}: {main.width}x{main.height}, variants {variants}')

(DEST / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
