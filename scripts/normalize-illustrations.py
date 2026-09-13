"""Normalize selected built-in image-generation masters, never generate artwork.

Requires Pillow. Production records retain the original local master path; run
only after reviewing that master. Final images still require visual inspection.
"""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
records = json.loads((root / 'artifacts/illustration-reviews.json').read_text())
manifest = json.loads((root / 'public/assets/exercises/manifests/exercise-illustrations.json').read_text())
collections = {r['exerciseId']: r['primaryCollection'] for r in manifest}
for record in records:
    if record.get('rejected'):
        continue
    target = root / 'public/assets/exercises' / collections[record['id']] / (record['id'] + '.png')
    if target.exists():
        continue
    source = Path(record['source'])
    with Image.open(source) as original:
        if original.width * 3 != original.height * 2:
            raise ValueError(f"Review aspect ratio before normalization: {record['id']}")
        final = original.convert('L').resize((640, 960), Image.Resampling.LANCZOS)
        target.parent.mkdir(parents=True, exist_ok=True)
        final.save(target, optimize=True)
    print(f"{record['id']}: {target.stat().st_size} bytes")
