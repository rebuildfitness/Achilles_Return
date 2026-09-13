"""Derive mobile thumbnails from reviewed artwork; never alter the full-size PNGs."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent / 'public/assets/exercises'
destination = root / 'thumbnails'
destination.mkdir(exist_ok=True)
for collection in ('prescribed', 'strength-library', 'movement-library'):
    for source in (root / collection).glob('*.png'):
        with Image.open(source) as original:
            if original.size != (640, 960):
                raise ValueError(f'Unexpected master dimensions: {source}')
            original.convert('L').resize((192, 288), Image.Resampling.LANCZOS).save(destination / source.name, optimize=True)
print('Thumbnails:', len(list(destination.glob('*.png'))))
