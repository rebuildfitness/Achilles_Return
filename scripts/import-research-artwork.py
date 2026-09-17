"""Import selected built-in imagegen outputs; resize only, without changing artwork."""
import json
from pathlib import Path
from PIL import Image, ImageOps
root = Path(__file__).resolve().parents[1]
source = Path('C:/Users/jwalk/.codex/generated_images/01a0912b-a122-7951-a4cc-8af99692a2c5')
mapping = '''library-tibialis-raise 643c4f41-f244-4b82-be73-aa1265248df3
library-banded-ankle-dorsiflexion 398b4d6d-a38c-47ca-94b1-67ce791fe9d9
library-short-foot a74c2781-a725-4461-a880-fba3c1099d24
library-toe-yoga d1d42f40-3b6e-445c-bff1-dfced16ea13d
library-two-up-one-down-calf-raise 07b04e53-89d9-40da-8b6f-468b2b3f1ae2
library-bent-knee-soleus-isometric b1fe17b7-169e-44f5-93bd-5e469816a87f
library-banded-terminal-knee-extension ecd11151-3835-44f9-845b-72d71588a20c
library-cable-hip-adduction 9b9e7244-dceb-4e9d-91eb-8ada4127255a
library-cable-resisted-march 0fd8641e-0091-47b2-bf35-fc61e7266db0
library-trap-bar-romanian-deadlift 1c98ad4f-22bc-4046-affc-9431f135cc2c
library-trap-bar-farmer-carry b3cc122a-3b58-4a07-9b5e-e2b6ef4df70e
library-smith-romanian-deadlift 148465d6-5eb9-4e88-9da5-fbe4b117915a
library-smith-hip-thrust 9d4dce08-a449-410b-a15f-224ebc06a96a
library-belt-squat-calf-raise b3be2a44-c845-49b4-bff0-f50bc7dca4fa
library-belt-squat-isometric 65298f35-5778-4a7d-a053-a8296f8d927c
library-slant-board-squat d3a3ff06-1891-4fbe-ac15-073ce6f52a18
library-balance-cushion-single-leg-stance b8ab816a-afe0-4853-99cd-3bd470bfd0e0
library-push-up 1dd9a2a4-6e92-4c27-b42b-33fce12e3de4
library-chin-up d19d529e-53c1-4ce4-bd62-edcb6bd03ca6
library-single-arm-cable-row 82e99c40-4c9b-4210-9c6d-5772d3f74589
library-farmer-carry 43c7239b-1840-42fc-b7db-94130a6b4135
library-landmine-half-kneeling-press cedaea67-b3c4-4494-b8e6-838808b58e75
library-landmine-squat e539c731-c70e-44d8-8762-286447533ff4
library-landmine-meadows-row 0c605b91-def3-4340-b3d5-60c62237e288
library-rack-cable-leg-extension 5d9482d1-8ebb-4eca-ab29-99efd89d3266
library-rack-chest-supported-row 66659912-498a-4cea-9d24-63546cc0dcc2
library-rack-lat-pulldown 29c5d1cb-90fe-4cb4-8ba0-928fd4ebd677
backward-sled-drag bb3491aa-bd7c-4a6f-980a-f922fe205bb4
sled-push 3a25d661-54c2-42f0-ac32-a48a9b8d4bcb
forward-sled-drag 1fe4dc54-516c-44d1-8ea7-8ea7d60335ac
backward-treadmill-walk 7716a4d9-e8ad-4079-8029-f9f4ba5287b8'''
inventory = json.loads((root/'artifacts/research-artwork-inventory.json').read_text(encoding='utf-8-sig'))
manifest_path=root/'public/assets/exercises/manifests/exercise-illustrations.json'
manifest=json.loads(manifest_path.read_text(encoding='utf-8-sig'))
records={r['exerciseId']:r for r in manifest}
audit=[]
for line in mapping.splitlines():
    id, file=line.split(); ex=next(e for e in inventory if e['id']==id)
    full=f'/assets/exercises/strength-library/{id}.png'; thumb=f'/assets/exercises/thumbnails/{id}.png'
    im=Image.open(source/f'exec-{file}.png').convert('L')
    for path,size in [(full,(640,960)),(thumb,(192,288))]:
        target=root/'public'/path.lstrip('/'); target.parent.mkdir(parents=True,exist_ok=True)
        ImageOps.pad(im,size,method=Image.Resampling.LANCZOS,color=255).save(target,optimize=True)
    concept=id in ['library-belt-squat-calf-raise','library-belt-squat-isometric','backward-sled-drag','sled-push','forward-sled-drag']
    kind='equipment-reference' if id=='backward-treadmill-walk' else 'movement-concept' if concept else 'exercise-illustration'
    description=('Equipment reference only. Backward use of this treadmill is not authorized by this illustration.' if kind=='equipment-reference' else 'Movement concept only; exact attachment/setup review is still required.' if concept else ex['setup'])
    record=records.get(id,{})
    record.update(exerciseId=id,exerciseName=ex['name'],sourceCollections=['strength-library'],primaryCollection='strength-library',primaryCategory=ex['muscle'],bodyRegions=[ex['muscle']],equipment=ex['equipment'],motionFormat='reference' if concept else 'illustration',assetStatus='generated',assetPath=full,assetDimensions={'width':640,'height':960},assetFormat='png',assetFileSizeBytes=(root/'public'/full.lstrip('/')).stat().st_size,thumbnailPath=thumb,thumbnailDimensions={'width':192,'height':288},thumbnailFileSizeBytes=(root/'public'/thumb.lstrip('/')).stat().st_size,altText=f"{ex['name']}: {description}",panelDescription=description,illustrationVersion='1.6.0',illustrationKind=kind,existingDemoStatus=ex.get('verification','Review pending'),clinicalRuleReference='Existing readiness and progression rules unchanged.',mechanicsSources=[{'source':'src/data/researchExercises.js' if ex.get('candidateNumber') else 'src/data/equipmentContext.js' if not id.startswith('library-') else 'src/data/exerciseLibrary.js','setup':ex['setup'],'existingDemoUrl':ex.get('videoUrl'),'check':'Visual review completed; illustration is not clinical clearance or manufacturer certification.'}],notes='Built-in imagegen; selected output visually inspected; grayscale size optimization only.')
    if id not in records: manifest.append(record)
    audit.append({'exerciseId':id,'selectedOutput':f'exec-{file}.png','assetPath':full,'illustrationKind':kind,'generationBrief':description})
manifest_path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
(root/'docs/research/exercise-followup/ARTWORK_BATCH_2026-09-16.json').write_text(json.dumps({'method':'Built-in imagegen','style':'Portrait 2:3 grayscale realistic exercise-manual illustrations on white; diverse adult models; no invented loads, doses or readiness thresholds.','briefNote':'Per-asset generation briefs and selected outputs; briefs summarize the generation instructions.','assets':audit},indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(f'Imported {len(audit)} images; manifest contains {len(manifest)} records')
