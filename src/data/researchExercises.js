// Reviewed library content only. Never imported by the prescription catalog.
import {withReferenceDemo} from './referenceDemos.js';
export const RESEARCH_EXERCISES = [
  {
    "id": "library-tibialis-raise",
    "name": "Tibialis raise",
    "equipment": [],
    "muscle": "Calf & ankle",
    "setup": "Stand with upper back against a wall and feet slightly forward. Keep heels planted and begin with toes relaxed on the floor. Lift the forefeet toward the shins without rocking onto the heels. Lower under control while the heels stay down.",
    "review": "Anterior lower-leg strength and ankle dorsiflexion control. Catalog inclusion does not establish current tolerance for repeated ankle motion. Stop and apply the existing symptom/red-flag process if symptoms change.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "Hinge Health",
    "verifiedAt": "2026-09-16",
    "guideUrl": "https://www.hingehealth.com/resources/articles/tibialis-raises/",
    "contentStatus": "library-reference",
    "verification": "Exercise guide checked; video playback not verified. This link is educational reference, not a verified Short Demo.",
    "candidateNumber": 1,
    "aliases": [
      "anterior tibialis raise",
      "wall tib raise"
    ],
    "loadConvention": "Bodyweight; record no numeric load unless an independently reviewed resistance setup is used.",
    "loggingFields": [
      {
        "key": "reps",
        "label": "Repetitions",
        "unit": "count",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "load",
        "label": "External load",
        "unit": "lb",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "assistance",
        "label": "Assistance",
        "unit": "text",
        "sideSpecific": false,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 1,
      "originalRecommendation": "add",
      "claims": [],
      "demos": [
        {
          "url": "https://www.hingehealth.com/resources/articles/tibialis-raises/",
          "sourcePage": "https://www.hingehealth.com/resources/articles/tibialis-raises/",
          "title": "Tibialis Raises: Exercise Guide",
          "provider": "Hinge Health",
          "durationSeconds": null,
          "startSeconds": null,
          "endSeconds": null,
          "access": "public",
          "pageVerified": true,
          "playbackVerified": false,
          "exactMovementVerified": true,
          "verifiedAt": "2026-09-16",
          "verificationNotes": "Public page and exact written wall-raise sequence verified; embedded video playback was not checked."
        }
      ],
      "existingMatches": [],
      "prerequisites": [],
      "unresolvedPrerequisites": [
        "Current ankle range and symptom response are not supplied."
      ],
      "reviewQuestions": [
        "Should this remain optional movement support or be reviewed for a specific training slot?"
      ],
      "regressions": [
        {
          "name": "Seated toe lift",
          "existingId": null,
          "rationale": "Reduces balance demand while preserving active dorsiflexion; still requires review.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Single-leg tibialis raise",
          "existingId": null,
          "rationale": "Adds unilateral demand and is not an automatic progression.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": {
      "startPosition": "Adult standing with back against a wall, heels down and toes on floor.",
      "endPosition": "Same stance with forefeet lifted toward shins.",
      "equipment": "Wall",
      "importantAnatomyAndAlignment": "Heels remain planted; motion occurs at ankles.",
      "cameraAngle": "Three-quarter side view showing feet and shins.",
      "avoid": "Do not show heel lift, deep knee bend, or a loaded device."
    }
  },
  {
    "id": "library-banded-ankle-dorsiflexion",
    "name": "Banded ankle dorsiflexion",
    "equipment": [
      "rehab-bands"
    ],
    "muscle": "Calf & ankle",
    "setup": "Sit with the working heel supported and the band anchored in front of the foot. Place the band across the forefoot without compressing the toes. Draw the forefoot toward the shin while the heel stays still. Return slowly without letting the band pull the foot inward or outward.",
    "review": "Resisted ankle dorsiflexion control. This is not equivalent to dorsiflexion range clearance. Band tension and ankle range require individual setup review.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "",
    "verifiedAt": null,
    "guideUrl": null,
    "contentStatus": "library-reference",
    "verification": "Exact video demo remains under review. The illustration and setup notes do not establish readiness or a prescribed dose.",
    "candidateNumber": 2,
    "aliases": [
      "resisted ankle dorsiflexion"
    ],
    "loadConvention": "Record the band identifier/color and anchor distance; do not convert band resistance to pounds.",
    "loggingFields": [
      {
        "key": "side",
        "label": "Side",
        "unit": "left/right",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "reps",
        "label": "Repetitions",
        "unit": "count",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "band",
        "label": "Band identifier",
        "unit": "text",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "anchor",
        "label": "Anchor setup",
        "unit": "text",
        "sideSpecific": true,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 2,
      "originalRecommendation": "add",
      "claims": [],
      "demos": [
        {
          "url": "https://www.cornell.edu/video/ankle-dorsiflexion-with-band",
          "sourcePage": "https://www.cornell.edu/video/ankle-dorsiflexion-with-band",
          "title": "Ankle Dorsiflexion with Band",
          "provider": "Cornell Physical Therapy",
          "durationSeconds": null,
          "startSeconds": null,
          "endSeconds": null,
          "access": "unknown",
          "pageVerified": false,
          "playbackVerified": false,
          "exactMovementVerified": false,
          "verifiedAt": null,
          "verificationNotes": "Exercise-specific result was located, but direct page access returned 403; neither movement nor playback was verified."
        }
      ],
      "existingMatches": [
        {
          "collection": "movementExercises",
          "id": "knee-to-wall-dorsiflexion-mobility",
          "name": "Knee-to-wall dorsiflexion mobility",
          "relationship": "related",
          "reason": "Existing item trains mobility; candidate adds external dorsiflexion resistance."
        }
      ],
      "prerequisites": [
        "knee-to-wall-dorsiflexion-mobility"
      ],
      "unresolvedPrerequisites": [
        "Safe anchor, band resistance and permitted ankle range are not confirmed."
      ],
      "reviewQuestions": [
        "Which band and anchor configuration should the developer document?",
        "What ankle range is currently permitted for resisted dorsiflexion?"
      ],
      "regressions": [
        {
          "name": "Active seated dorsiflexion",
          "existingId": null,
          "rationale": "Removes external resistance; still monitor symptoms and range.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Higher band tension",
          "existingId": null,
          "rationale": "Changes load and requires separate review rather than automatic progression.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": {
      "startPosition": "Seated adult with heel supported, band anchored in front and looped over forefoot.",
      "endPosition": "Forefoot drawn toward shin while heel remains fixed.",
      "equipment": "Rehab band and stable low anchor",
      "importantAnatomyAndAlignment": "Knee and heel remain still; foot stays neutral.",
      "cameraAngle": "Side view centered on lower leg and anchor.",
      "avoid": "Do not show band around the toes, an unsecured anchor, or forced end range."
    }
  },
  {
    "id": "library-short-foot",
    "name": "Short-foot / arch-dome exercise",
    "equipment": [],
    "muscle": "Calf & ankle",
    "setup": "Sit or stand with heel, base of the great toe and base of the little toe contacting the floor. Relax the toes before beginning. Gently shorten the foot by drawing the ball of the foot toward the heel. Keep all three contact points and the toes long.",
    "review": "Intrinsic foot control without curling the toes. Indirect evidence does not establish postoperative need or timing. Standing versions add weight-bearing demand and require their own eligibility check.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "",
    "verifiedAt": null,
    "guideUrl": null,
    "contentStatus": "library-reference",
    "verification": "Exact video demo remains under review. The illustration and setup notes do not establish readiness or a prescribed dose.",
    "candidateNumber": 3,
    "aliases": [
      "foot doming",
      "arch lift"
    ],
    "loadConvention": null,
    "loggingFields": [
      {
        "key": "side",
        "label": "Side",
        "unit": "left/right",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "reps",
        "label": "Repetitions",
        "unit": "count",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "durationSeconds",
        "label": "Hold time",
        "unit": "seconds",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "position",
        "label": "Position",
        "unit": "seated/standing",
        "sideSpecific": true,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 3,
      "originalRecommendation": "add",
      "claims": [
        {
          "text": "Short-foot exercise has been studied for arch and lower-extremity outcomes in people with flat feet.",
          "sourceIds": [
            "src-cheng-2024"
          ],
          "evidenceType": "systematic review and meta-analysis",
          "applicabilityToPostSurgicalAchilles": "indirect",
          "uncertainty": "The population and target condition differ from postoperative Achilles rehabilitation; no readiness conclusion follows."
        }
      ],
      "demos": [],
      "existingMatches": [],
      "prerequisites": [],
      "unresolvedPrerequisites": [
        "Whether seated or standing weight-bearing is appropriate is not documented."
      ],
      "reviewQuestions": [
        "Should the initial content show seated only, pending weight-bearing review?"
      ],
      "regressions": [
        {
          "name": "Seated short-foot",
          "existingId": null,
          "rationale": "Reduces weight-bearing and balance demand.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Standing short-foot",
          "existingId": null,
          "rationale": "Adds weight-bearing demand and requires separate review.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": {
      "startPosition": "Seated adult with bare foot flat, tripod contact points visible.",
      "endPosition": "Arch gently lifted while toes remain long and on floor.",
      "equipment": "None",
      "importantAnatomyAndAlignment": "Heel and metatarsal contact retained; no toe curl.",
      "cameraAngle": "Low front three-quarter view of foot.",
      "avoid": "Do not exaggerate arch height or show clawed toes."
    }
  },
  {
    "id": "library-toe-yoga",
    "name": "Toe yoga / independent great-toe control",
    "equipment": [],
    "muscle": "Calf & ankle",
    "setup": "Sit or stand with the foot supported and all toes relaxed. Keep the heel and ball of the foot in contact. Lift the great toe while the lesser toes stay down. Then press the great toe down while lifting the lesser toes; move only as far as control allows.",
    "review": "Independent great-toe and lesser-toe coordination. Foot coordination is not a clearance test or automatic prerequisite. Standing adds weight-bearing demand.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "Sharp HealthCare",
    "verifiedAt": "2026-09-16",
    "guideUrl": "https://www.sharp.com/health-news/relieving-plantar-fasciitis-pain-with-toe-yoga-video",
    "contentStatus": "library-reference",
    "verification": "Exercise guide checked; video playback not verified. This link is educational reference, not a verified Short Demo.",
    "candidateNumber": 4,
    "aliases": [
      "great-toe dissociation",
      "independent toe control"
    ],
    "loadConvention": null,
    "loggingFields": [
      {
        "key": "side",
        "label": "Side",
        "unit": "left/right",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "reps",
        "label": "Controlled cycles",
        "unit": "count",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "position",
        "label": "Position",
        "unit": "seated/standing",
        "sideSpecific": true,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 4,
      "originalRecommendation": "add",
      "claims": [],
      "demos": [
        {
          "url": "https://www.sharp.com/health-news/relieving-plantar-fasciitis-pain-with-toe-yoga-video",
          "sourcePage": "https://www.sharp.com/health-news/relieving-plantar-fasciitis-pain-with-toe-yoga-video",
          "title": "Relieving plantar fasciitis pain with toe yoga",
          "provider": "Sharp HealthCare",
          "durationSeconds": null,
          "startSeconds": null,
          "endSeconds": null,
          "access": "public",
          "pageVerified": true,
          "playbackVerified": false,
          "exactMovementVerified": true,
          "verifiedAt": "2026-09-16",
          "verificationNotes": "Public page and written toe-yoga sequence verified; embedded video playback was not checked. Page is plantar-fasciitis education, not Achilles evidence."
        }
      ],
      "existingMatches": [],
      "prerequisites": [],
      "unresolvedPrerequisites": [
        "Appropriate seated versus standing start is not confirmed."
      ],
      "reviewQuestions": [
        "Should the first version be seated only?"
      ],
      "regressions": [
        {
          "name": "Seated assisted toe dissociation",
          "existingId": null,
          "rationale": "Allows light hand guidance and reduces balance demand.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Standing toe yoga",
          "existingId": null,
          "rationale": "Adds weight-bearing and must be reviewed separately.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": {
      "startPosition": "Supported foot with all toes resting on floor.",
      "endPosition": "Two small panels: great toe up/lesser toes down, then great toe down/lesser toes up.",
      "equipment": "None",
      "importantAnatomyAndAlignment": "Foot tripod stays in contact; ankle remains neutral.",
      "cameraAngle": "Top-front close view of foot.",
      "avoid": "Do not show foot rolling, toe clawing, or unsupported balance."
    }
  },
  {
    "id": "library-two-up-one-down-calf-raise",
    "name": "Straight-knee 2-up/1-down calf raise",
    "equipment": [],
    "muscle": "Calf & ankle",
    "setup": "Use a stable support and stand on a flat floor; keep both feet fully supported. Rise with both legs before shifting only enough to lower on the selected side. Keep the working knee straight but not locked. Lower only to floor level under control; do not drop the heel below the floor.",
    "review": "Controlled plantarflexor loading with shared ascent and unilateral lowering. Floor-level is mandatory in this candidate content unless additional dorsiflexion has specifically been cleared. The floor-level constraint does not establish readiness for eccentric loading. Healthy-adult biomechanics show setup-dependent loading; postoperative eligibility remains a clinical decision.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "",
    "verifiedAt": null,
    "guideUrl": null,
    "contentStatus": "library-reference",
    "verification": "Exact video demo remains under review. The illustration and setup notes do not establish readiness or a prescribed dose.",
    "candidateNumber": 5,
    "aliases": [
      "double-up single-down calf raise",
      "bilateral-up unilateral-down heel raise"
    ],
    "loadConvention": "Bodyweight by default; if separately cleared for external load, record total external load without inferring tendon load.",
    "loggingFields": [
      {
        "key": "side",
        "label": "Lowering side",
        "unit": "left/right",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "reps",
        "label": "Controlled lowerings",
        "unit": "count",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "load",
        "label": "External load",
        "unit": "lb",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "assistance",
        "label": "Hand support",
        "unit": "text",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "range",
        "label": "Lowering endpoint",
        "unit": "floor-level",
        "sideSpecific": true,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 5,
      "originalRecommendation": "add",
      "claims": [
        {
          "text": "In healthy younger adults, unilateral portions of heel-raising/lowering tasks produced higher estimated Achilles loading than seated or bilateral variants.",
          "sourceIds": [
            "src-revak-2017"
          ],
          "evidenceType": "laboratory biomechanics study",
          "applicabilityToPostSurgicalAchilles": "indirect",
          "uncertainty": "This does not establish postoperative safety, eligibility, depth, load, dose or timing."
        }
      ],
      "demos": [],
      "existingMatches": [
        {
          "collection": "activeCatalog",
          "id": "bilateral-calf",
          "name": "Bilateral calf raise",
          "relationship": "related",
          "reason": "Both phases are bilateral in the existing item."
        },
        {
          "collection": "activeCatalog",
          "id": "single-calf",
          "name": "Single-leg calf raise",
          "relationship": "related",
          "reason": "Both phases are unilateral in the existing item."
        },
        {
          "collection": "exerciseLibrary",
          "id": "calf-assisted",
          "name": "Assisted single-leg calf raise",
          "relationship": "related",
          "reason": "Assistance differs from bilateral ascent and unilateral lowering."
        }
      ],
      "prerequisites": [
        "bilateral-calf",
        "single-calf",
        "calf-assisted",
        "calf-dumbbell-single",
        "calf-smith"
      ],
      "unresolvedPrerequisites": [
        "Readiness for unilateral eccentric lowering and acceptable range are not documented."
      ],
      "reviewQuestions": [
        "Has unilateral eccentric lowering been specifically reviewed?",
        "Should the library enforce the floor-level endpoint in text and illustration metadata?"
      ],
      "regressions": [
        {
          "name": "Bilateral calf raise",
          "existingId": "bilateral-calf",
          "rationale": "Keeps ascent and descent bilateral; eligibility still follows existing rules.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Loaded 2-up/1-down calf raise",
          "existingId": null,
          "rationale": "Adds load and requires a separate starting-load assessment.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": {
      "startPosition": "Adult on flat floor using light fingertip support at the top of a bilateral heel raise.",
      "endPosition": "One foot lifted slightly while the other heel lowers only to floor level.",
      "equipment": "Stable support; flat floor",
      "importantAnatomyAndAlignment": "Working knee straight, heel aligned, pelvis level.",
      "cameraAngle": "Rear three-quarter view showing both feet and support.",
      "avoid": "Do not show a step, heel below floor, loaded bar, or loss of balance."
    }
  },
  {
    "id": "library-bent-knee-soleus-isometric",
    "name": "Seated bent-knee soleus isometric",
    "equipment": [],
    "muscle": "Calf & ankle",
    "setup": "Sit upright on a stable bench with knees bent and forefeet on the floor. Lift the heels within your reviewed range and hold without bouncing. The illustration shows an unloaded bilateral position; external loading and hold duration require individual review.",
    "review": "Sustained plantarflexor loading with the knee flexed. Knee angle, heel height, ankle range and external load all change the task. A clinical commentary depicts flexed-knee plantarflexion isometrics but does not prescribe this candidate's dose or eligibility.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "",
    "verifiedAt": null,
    "guideUrl": null,
    "contentStatus": "library-reference",
    "verification": "Exact video demo remains under review. The illustration and setup notes do not establish readiness or a prescribed dose.",
    "candidateNumber": 6,
    "aliases": [
      "seated soleus isometric",
      "bent-knee calf hold"
    ],
    "loadConvention": "Bodyweight or external load only after setup review; record the external load and setup separately.",
    "loggingFields": [
      {
        "key": "side",
        "label": "Side",
        "unit": "left/right",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "durationSeconds",
        "label": "Hold time",
        "unit": "seconds",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "load",
        "label": "External load",
        "unit": "lb",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "position",
        "label": "Setup",
        "unit": "text",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "heelHeight",
        "label": "Heel-height note",
        "unit": "text",
        "sideSpecific": true,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 6,
      "originalRecommendation": "add",
      "claims": [
        {
          "text": "A postoperative Achilles repair clinical commentary includes flexed-knee plantarflexion isometric loading among staged rehabilitation examples.",
          "sourceIds": [
            "src-marrone-2024"
          ],
          "evidenceType": "clinical commentary",
          "applicabilityToPostSurgicalAchilles": "direct but non-prescriptive",
          "uncertainty": "It is not a surgeon-specific protocol and does not establish the user's current eligibility, position, dose or load."
        }
      ],
      "demos": [],
      "existingMatches": [
        {
          "collection": "exerciseLibrary",
          "id": "calf-isometric-single",
          "name": "Single-leg calf isometric",
          "relationship": "related",
          "reason": "Existing isometric uses a straight-knee single-leg setup."
        },
        {
          "collection": "activeCatalog",
          "id": "seated-calf",
          "name": "Seated calf raise",
          "relationship": "related",
          "reason": "Existing bent-knee work is dynamic."
        },
        {
          "collection": "exerciseLibrary",
          "id": "calf-bent-standing",
          "name": "Bent-knee standing calf raise",
          "relationship": "related",
          "reason": "Existing bent-knee work is dynamic."
        }
      ],
      "prerequisites": [
        "seated-calf",
        "calf-bent-standing",
        "calf-isometric-single"
      ],
      "unresolvedPrerequisites": [
        "Seated versus standing setup, knee angle, heel height, unilateral status and starting load are unresolved."
      ],
      "reviewQuestions": [
        "Which position and knee angle should be the canonical entry?",
        "Has a plantarflexion isometric at that range/load been reviewed?"
      ],
      "regressions": [
        {
          "name": "Seated calf raise",
          "existingId": "seated-calf",
          "rationale": "Existing dynamic bent-knee calf work; not automatically interchangeable with an isometric.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Bent-knee standing calf raise",
          "existingId": "calf-bent-standing",
          "rationale": "Existing dynamic alternative with different balance and loading demands.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": null
  },
  {
    "id": "library-banded-terminal-knee-extension",
    "name": "Banded terminal knee extension",
    "equipment": [
      "rehab-bands"
    ],
    "muscle": "Legs",
    "setup": "Face a secure band anchor at knee height. Loop the band behind the working knee, so it pulls forward. From a small bend, tighten the thigh and straighten the knee without forcing hyperextension; return with control. Use stable hand support as needed.",
    "review": "Controlled final-range knee extension in standing. Standing support and ankle comfort must be checked. This does not establish gait, running or sport readiness.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "The Prehab Guys",
    "verifiedAt": "2026-09-16",
    "guideUrl": "https://library.theprehabguys.com/vimeo-video/terminal-knee-extension/",
    "contentStatus": "library-reference",
    "verification": "Exercise guide checked; video playback not verified. This link is educational reference, not a verified Short Demo.",
    "candidateNumber": 7,
    "aliases": [
      "TKE",
      "standing band knee extension"
    ],
    "loadConvention": "For cable, record displayed stack setting and setup; for band, record band identifier and anchor distance. Do not convert between them.",
    "loggingFields": [
      {
        "key": "side",
        "label": "Side",
        "unit": "left/right",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "reps",
        "label": "Repetitions",
        "unit": "count",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "resistanceMode",
        "label": "Resistance mode",
        "unit": "band/cable",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "load",
        "label": "Cable stack setting",
        "unit": "displayed setting",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "band",
        "label": "Band identifier",
        "unit": "text",
        "sideSpecific": true,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 7,
      "originalRecommendation": "add",
      "claims": [],
      "demos": [],
      "existingMatches": [],
      "prerequisites": [],
      "unresolvedPrerequisites": [
        "Permitted knee range, preferred band/cable setup and stable anchor are not confirmed."
      ],
      "reviewQuestions": [
        "Should band and cable be separate content records?",
        "Which attachment is approved behind the knee?"
      ],
      "regressions": [
        {
          "name": "Seated knee extension",
          "existingId": null,
          "rationale": "Reduces standing demand but is not an exact equivalent and requires review.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Cable terminal knee extension",
          "existingId": null,
          "rationale": "Adds machine-specific resistance and requires an independent starting-load check.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": null
  },
  {
    "id": "library-cable-hip-adduction",
    "name": "Cable hip adduction",
    "equipment": [
      "cable-station"
    ],
    "muscle": "Legs",
    "setup": "Stand side-on to the low pulley. Put the ankle cuff on the leg nearest the pulley and hold stable support. Draw that leg inward toward the standing leg without rotating the pelvis; return with control. Keep the stance foot planted.",
    "review": "Standing hip adduction strength using an ankle cuff. The stance leg bears the balance demand; this is not an Achilles clearance test. Cable path and cuff placement must not destabilize the user.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "Muscle & Strength",
    "verifiedAt": "2026-09-16",
    "guideUrl": "https://www.muscleandstrength.com/exercises/cable-hip-adduction.html",
    "contentStatus": "library-reference",
    "verification": "Exercise guide checked; video playback not verified. This link is educational reference, not a verified Short Demo.",
    "candidateNumber": 8,
    "aliases": [
      "standing cable hip adduction"
    ],
    "loadConvention": "Record displayed stack setting, pulley position and cuff setup; pulley ratio is unknown, so do not convert to free-weight pounds.",
    "loggingFields": [
      {
        "key": "side",
        "label": "Working side",
        "unit": "left/right",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "reps",
        "label": "Repetitions",
        "unit": "count",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "load",
        "label": "Cable stack setting",
        "unit": "displayed setting",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "pulley",
        "label": "Pulley/attachment setup",
        "unit": "text",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "assistance",
        "label": "Hand support",
        "unit": "text",
        "sideSpecific": true,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 8,
      "originalRecommendation": "add",
      "claims": [],
      "demos": [],
      "existingMatches": [
        {
          "collection": "exerciseLibrary",
          "id": "library-cable-hip-abduction",
          "name": "Cable hip abduction",
          "relationship": "related",
          "reason": "Opposite frontal-plane direction; not a duplicate."
        }
      ],
      "prerequisites": [],
      "unresolvedPrerequisites": [
        "Cable ratio, lowest pulley geometry, cuff fit, stance tolerance and safe starting resistance are not confirmed."
      ],
      "reviewQuestions": [
        "Is the cuff comfortable and secure for medial cable pull?",
        "What support position preserves balance without contacting the cable?"
      ],
      "regressions": [
        {
          "name": "Supported side-lying hip adduction",
          "existingId": null,
          "rationale": "Removes cable and standing-balance demands but is a different setup.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Greater cable resistance",
          "existingId": null,
          "rationale": "Requires its own starting-load assessment and is not automatic.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": {
      "startPosition": "Adult standing side-on to low cable with cuff on far ankle and hand support.",
      "endPosition": "Cuffed leg moved inward toward neutral without crossing.",
      "equipment": "Cable station, ankle cuff, stable support",
      "importantAnatomyAndAlignment": "Pelvis level, trunk quiet, stance foot flat.",
      "cameraAngle": "Front three-quarter view showing cable direction.",
      "avoid": "Do not show trunk lean, crossed legs, or unsupported balance."
    }
  },
  {
    "id": "library-cable-resisted-march",
    "name": "Cable resisted march / hip flexion",
    "equipment": [
      "cable-station"
    ],
    "muscle": "Legs",
    "setup": "Face away from a low pulley with the cuff on the working ankle and use stable hand support. Stand tall with both feet controlled before taking up cable tension. Lift the working knee without leaning back. Lower the foot under control and reset balance before the next repetition.",
    "review": "Controlled standing hip flexion against cable resistance. The stance leg and lowering step create balance and Achilles demands. Do not treat a seated march as proof of standing cable readiness.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "",
    "verifiedAt": null,
    "guideUrl": null,
    "contentStatus": "library-reference",
    "verification": "Exact video demo remains under review. The illustration and setup notes do not establish readiness or a prescribed dose.",
    "candidateNumber": 9,
    "aliases": [
      "standing cable hip flexion",
      "cable march"
    ],
    "loadConvention": "Record displayed stack setting, pulley position and cuff setup; do not infer true external force from the stack label.",
    "loggingFields": [
      {
        "key": "side",
        "label": "Working side",
        "unit": "left/right",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "reps",
        "label": "Repetitions",
        "unit": "count",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "load",
        "label": "Cable stack setting",
        "unit": "displayed setting",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "pulley",
        "label": "Pulley/attachment setup",
        "unit": "text",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "assistance",
        "label": "Hand support",
        "unit": "text",
        "sideSpecific": true,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 9,
      "originalRecommendation": "add",
      "claims": [],
      "demos": [],
      "existingMatches": [
        {
          "collection": "activeCatalog",
          "id": "seated-march",
          "name": "Seated march",
          "relationship": "related",
          "reason": "Seated and unresisted; lower stance demand."
        },
        {
          "collection": "movementExercises",
          "id": "seated-core-march",
          "name": "Seated core march",
          "relationship": "related",
          "reason": "Trunk-control exercise rather than standing cable hip flexion."
        }
      ],
      "prerequisites": [
        "seated-march",
        "seated-core-march"
      ],
      "unresolvedPrerequisites": [
        "Stance tolerance, cuff fit, pulley geometry, permitted hip height and starting resistance are unknown."
      ],
      "reviewQuestions": [
        "What stance support and knee-lift range are approved?",
        "Should the name use 'hip flexion' to avoid implying gait-speed training?"
      ],
      "regressions": [
        {
          "name": "Seated march",
          "existingId": "seated-march",
          "rationale": "Existing lower-balance-demand hip-flexion pattern; not a resisted equivalent.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Higher cable resistance",
          "existingId": null,
          "rationale": "Changes stance and cable forces and needs separate review.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": {
      "startPosition": "Adult facing away from low cable, cuff on one ankle, upright with hand support.",
      "endPosition": "Cuffed knee lifted to a modest height while stance foot stays planted.",
      "equipment": "Cable station, ankle cuff, stable support",
      "importantAnatomyAndAlignment": "Pelvis level, trunk upright, stance heel controlled.",
      "cameraAngle": "Side view showing cable behind working leg.",
      "avoid": "Do not show sprint posture, backward lean, or unsupported single-leg balance."
    }
  },
  {
    "id": "library-trap-bar-romanian-deadlift",
    "name": "Trap-bar Romanian deadlift",
    "equipment": [
      "trap-hex-bar",
      "weight-plates"
    ],
    "muscle": "Legs",
    "setup": "Stand centered in the trap bar with the selected handles and safeties/space verified. Begin from a controlled standing lockout using a separately reviewed start load. Push the hips back while keeping the bar close to the body's center. Stop the descent at the reviewed range and stand by extending the hips.",
    "review": "Hip-hinge strength using a trap/hex bar. Loaded hinging adds whole-body load and may change ankle stabilization demands. General RDL technique and strength evidence do not establish postoperative eligibility or starting load.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "Muscle & Strength",
    "verifiedAt": "2026-09-16",
    "guideUrl": "https://www.muscleandstrength.com/content/trap-bar-romanian-deadlift",
    "contentStatus": "library-reference",
    "verification": "Exercise guide checked; video playback not verified. This link is educational reference, not a verified Short Demo.",
    "candidateNumber": 13,
    "aliases": [
      "hex-bar RDL"
    ],
    "loadConvention": "Record total external load including the verified empty bar weight; handle height and plate setup remain separate fields. Empty bar weight is currently unknown.",
    "loggingFields": [
      {
        "key": "reps",
        "label": "Repetitions",
        "unit": "count",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "load",
        "label": "Total external load",
        "unit": "lb",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "handle",
        "label": "Handle height",
        "unit": "high/low",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "range",
        "label": "Range/endpoint",
        "unit": "text",
        "sideSpecific": false,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 13,
      "originalRecommendation": "add",
      "claims": [
        {
          "text": "The RDL is a hip-hinge exercise used in general strength training.",
          "sourceIds": [
            "src-nsca-rdl",
            "src-acsm-2026"
          ],
          "evidenceType": "professional technique education plus position stand",
          "applicabilityToPostSurgicalAchilles": "indirect",
          "uncertainty": "Neither source validates a trap-bar-specific postoperative starting load or readiness.",
          "developerScope": "General training context only; not proof of exercise-specific cues, configuration or Achilles eligibility."
        }
      ],
      "demos": [
        {
          "url": "https://www.muscleandstrength.com/content/trap-bar-romanian-deadlift",
          "sourcePage": "https://www.muscleandstrength.com/content/trap-bar-romanian-deadlift",
          "title": "Trap Bar Romanian Deadlift",
          "provider": "Muscle & Strength",
          "durationSeconds": null,
          "startSeconds": null,
          "endSeconds": null,
          "access": "public",
          "pageVerified": true,
          "playbackVerified": false,
          "exactMovementVerified": true,
          "verifiedAt": "2026-09-16",
          "verificationNotes": "Public exercise-specific page and written movement match verified; embedded video playback was not checked. Provider is a general fitness source, not clinical evidence."
        }
      ],
      "existingMatches": [
        {
          "collection": "activeCatalog",
          "id": "dumbbell-romanian-deadlift",
          "name": "Dumbbell Romanian deadlift",
          "relationship": "related",
          "reason": "Same hinge family with different implement and load position."
        },
        {
          "collection": "exerciseLibrary",
          "id": "library-barbell-romanian-deadlift",
          "name": "Barbell Romanian deadlift",
          "relationship": "related",
          "reason": "Same named hinge with different bar geometry."
        },
        {
          "collection": "exerciseLibrary",
          "id": "library-trap-bar-deadlift",
          "name": "Trap-bar deadlift",
          "relationship": "related",
          "reason": "Trap-bar floor-start deadlift is not an RDL."
        }
      ],
      "prerequisites": [],
      "unresolvedPrerequisites": [
        "Trap-bar empty weight, handle heights, plate clearance, floor protection, start load and permitted hinge range are unknown."
      ],
      "reviewQuestions": [
        "What is the empty bar weight and which handle height will be canonical?",
        "Is the walking/lifting area large enough for safe setup and plate clearance?"
      ],
      "regressions": [
        {
          "name": "Dumbbell Romanian deadlift",
          "existingId": "dumbbell-romanian-deadlift",
          "rationale": "Existing hinge with known dumbbell ownership; load is not equivalent.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Trap-bar deadlift",
          "existingId": "library-trap-bar-deadlift",
          "rationale": "Existing floor-start pattern; not an automatic progression from the RDL.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": {
      "startPosition": "Adult standing centered inside trap bar, arms long and knees softly bent.",
      "endPosition": "Hips shifted back with neutral trunk and bar hanging vertically inside frame.",
      "equipment": "Trap/hex bar and plates",
      "importantAnatomyAndAlignment": "Feet flat, bar centered, spine neutral, shins nearly vertical.",
      "cameraAngle": "Side three-quarter view showing bar geometry.",
      "avoid": "Do not show floor-start deadlift, maximal depth, or a stated plate load."
    }
  },
  {
    "id": "library-trap-bar-farmer-carry",
    "name": "Trap-bar farmer carry",
    "equipment": [
      "trap-hex-bar",
      "weight-plates"
    ],
    "muscle": "Full body",
    "setup": "Set the trap bar on a level route with verified clearance and a reviewed load. Stand inside, lift to a stable tall position, then confirm the route is clear before walking. Take controlled steps and keep the bar from swinging. Turn only with adequate space and set down under control.",
    "review": "Bilateral loaded carry inside a trap bar. Loaded walking adds repeated stance and propulsion demands. Carry readiness is separate from static trap-bar lifting readiness.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "Muscle & Strength",
    "verifiedAt": "2026-09-16",
    "guideUrl": "https://www.muscleandstrength.com/exercises/trap-bar-farmers-carry",
    "contentStatus": "library-reference",
    "verification": "Exercise guide checked; video playback not verified. This link is educational reference, not a verified Short Demo.",
    "candidateNumber": 14,
    "aliases": [
      "trap-bar carry",
      "hex-bar farmer walk"
    ],
    "loadConvention": "Record total external load including verified empty bar weight; do not compare directly with dumbbell carries.",
    "loggingFields": [
      {
        "key": "distance",
        "label": "Distance",
        "unit": "m",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "durationSeconds",
        "label": "Duration",
        "unit": "seconds",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "load",
        "label": "External load",
        "unit": "lb",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "turns",
        "label": "Turns",
        "unit": "count",
        "sideSpecific": false,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 14,
      "originalRecommendation": "add",
      "claims": [
        {
          "text": "Loaded carries are general resistance-training tasks; load and volume should be individualized.",
          "sourceIds": [
            "src-acsm-2026"
          ],
          "evidenceType": "position stand / overview of reviews",
          "applicabilityToPostSurgicalAchilles": "indirect",
          "uncertainty": "The source does not establish a postoperative Achilles carry prescription or trap-bar readiness.",
          "developerScope": "General training context only; not proof of exercise-specific cues, configuration or Achilles eligibility."
        }
      ],
      "demos": [
        {
          "url": "https://www.muscleandstrength.com/exercises/trap-bar-farmers-carry",
          "sourcePage": "https://www.muscleandstrength.com/exercises/trap-bar-farmers-carry",
          "title": "Trap Bar Farmer's Carry",
          "provider": "Muscle & Strength",
          "durationSeconds": null,
          "startSeconds": null,
          "endSeconds": null,
          "access": "public",
          "pageVerified": true,
          "playbackVerified": false,
          "exactMovementVerified": true,
          "verifiedAt": "2026-09-16",
          "verificationNotes": "Public exercise-specific page and written movement match verified; embedded video playback was not checked. Not clinical evidence."
        }
      ],
      "existingMatches": [
        {
          "collection": "movementExercises",
          "id": "suitcase-carry",
          "name": "Suitcase carry",
          "relationship": "related",
          "reason": "Unilateral load and different trunk demand."
        },
        {
          "collection": "exerciseLibrary",
          "id": "library-trap-bar-deadlift",
          "name": "Trap-bar deadlift",
          "relationship": "related",
          "reason": "Shares pickup equipment but does not include loaded walking."
        }
      ],
      "prerequisites": [],
      "unresolvedPrerequisites": [
        "Empty bar weight, handle height, route width/length, turning method, floor clearance and starting load are unknown."
      ],
      "reviewQuestions": [
        "What clear walking distance and turn strategy are available?",
        "What is the empty bar weight and reviewed pickup method?"
      ],
      "regressions": [
        {
          "name": "Farmer carry",
          "existingId": "library-farmer-carry",
          "rationale": "Dumbbells reduce frame width but create a different load distribution.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Suitcase carry",
          "existingId": "suitcase-carry",
          "rationale": "Existing unilateral carry has different trunk and stance demands.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": {
      "startPosition": "Adult standing inside trap bar on a clear level lane after lifting it.",
      "endPosition": "Controlled short step with bar level and arms long.",
      "equipment": "Trap/hex bar and plates",
      "importantAnatomyAndAlignment": "Upright trunk, level bar, clear foot path.",
      "cameraAngle": "Front three-quarter view showing route clearance.",
      "avoid": "Do not show running, tight turns, clutter, or an asserted load."
    }
  },
  {
    "id": "library-smith-romanian-deadlift",
    "name": "Smith Romanian deadlift",
    "equipment": [
      "smith-machine"
    ],
    "muscle": "Legs",
    "setup": "Set the Smith safeties and bar start height for a reviewed standing setup. Choose foot position relative to the fixed bar path before unracking. Push the hips back while keeping the bar path close to the legs. Stop at the reviewed range and stand without bouncing off the safeties.",
    "review": "Hip-hinge strength using the Smith machine. Machine path and stance can change balance/ankle demands. A separate start-load and range assessment is required.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "Zing Coach",
    "verifiedAt": "2026-09-16",
    "guideUrl": "https://www.zing.coach/exercises/smith-machine-romanian-deadlifts",
    "contentStatus": "library-reference",
    "verification": "Exercise guide checked; video playback not verified. This link is educational reference, not a verified Short Demo.",
    "candidateNumber": 15,
    "aliases": [
      "Smith-machine RDL"
    ],
    "loadConvention": "Record added plates plus machine identity/setup. Effective starting resistance is unknown; do not report added plates as equivalent free-weight load.",
    "loggingFields": [
      {
        "key": "reps",
        "label": "Repetitions",
        "unit": "count",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "load",
        "label": "Added plates",
        "unit": "lb",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "barStart",
        "label": "Bar/safety setting",
        "unit": "text",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "footPosition",
        "label": "Foot position",
        "unit": "text",
        "sideSpecific": false,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 15,
      "originalRecommendation": "add",
      "claims": [
        {
          "text": "The RDL is a general hip-hinge strength exercise.",
          "sourceIds": [
            "src-nsca-rdl",
            "src-acsm-2026"
          ],
          "evidenceType": "professional technique education plus position stand",
          "applicabilityToPostSurgicalAchilles": "indirect",
          "uncertainty": "Neither source validates the user's Smith setup, postoperative eligibility or starting resistance.",
          "developerScope": "General training context only; not proof of exercise-specific cues, configuration or Achilles eligibility."
        }
      ],
      "demos": [
        {
          "url": "https://www.zing.coach/exercises/smith-machine-romanian-deadlifts",
          "sourcePage": "https://www.zing.coach/exercises/smith-machine-romanian-deadlifts",
          "title": "Smith Machine Romanian Deadlifts",
          "provider": "Zing Coach",
          "durationSeconds": null,
          "startSeconds": null,
          "endSeconds": null,
          "access": "public",
          "pageVerified": true,
          "playbackVerified": false,
          "exactMovementVerified": true,
          "verifiedAt": "2026-09-16",
          "verificationNotes": "Public exercise-specific page and written movement match verified; video playback was not checked. General fitness source, not clinical evidence."
        }
      ],
      "existingMatches": [
        {
          "collection": "exerciseLibrary",
          "id": "library-smith-deadlift",
          "name": "Smith deadlift",
          "relationship": "related",
          "reason": "Floor-start deadlift differs from standing RDL."
        },
        {
          "collection": "exerciseLibrary",
          "id": "library-barbell-romanian-deadlift",
          "name": "Barbell Romanian deadlift",
          "relationship": "related",
          "reason": "Same hinge family with free bar path."
        },
        {
          "collection": "activeCatalog",
          "id": "dumbbell-romanian-deadlift",
          "name": "Dumbbell Romanian deadlift",
          "relationship": "related",
          "reason": "Different implement and loading geometry."
        }
      ],
      "prerequisites": [],
      "unresolvedPrerequisites": [
        "Smith effective resistance, bar path orientation, safety positions, foot placement, start load and hinge range are unknown."
      ],
      "reviewQuestions": [
        "What is the Smith rail direction and effective starting resistance?",
        "Which safety and start positions allow a controlled unrack/rerack?"
      ],
      "regressions": [
        {
          "name": "Dumbbell Romanian deadlift",
          "existingId": "dumbbell-romanian-deadlift",
          "rationale": "Existing free-moving implement option; not load-equivalent.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Smith deadlift",
          "existingId": "library-smith-deadlift",
          "rationale": "Existing floor-start pattern; not the same range or start position.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": {
      "startPosition": "Adult holding Smith bar at thighs with safeties visible and feet positioned for the machine path.",
      "endPosition": "Hips shifted back, bar following fixed rail close to legs.",
      "equipment": "Smith machine",
      "importantAnatomyAndAlignment": "Feet flat, neutral trunk, soft knees, safeties set.",
      "cameraAngle": "Side view showing rail angle and foot placement.",
      "avoid": "Do not show free bar path, floor-start deadlift, or a claimed bar weight."
    }
  },
  {
    "id": "library-smith-hip-thrust",
    "name": "Smith hip thrust",
    "equipment": [
      "smith-machine",
      "adjustable-bench"
    ],
    "muscle": "Legs",
    "setup": "Secure a compatible bench so it cannot slide and set Smith safeties for entry/exit. Use a reviewed bar pad and foot position; begin only after a no-load setup check. Drive through both feet and extend the hips without overextending the low back. Pause in the reviewed top position and lower under control.",
    "review": "Hip extension strength using a Smith bar and bench. Foot pressure and entry/exit can load the ankle despite a hip-extension emphasis. Bench, safety and starting-load review are prerequisites.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "REP Fitness",
    "verifiedAt": "2026-09-16",
    "guideUrl": "https://repfitness.com/blogs/guides/smith-machine-hip-thrust",
    "contentStatus": "library-reference",
    "verification": "Exercise guide checked; video playback not verified. This link is educational reference, not a verified Short Demo.",
    "candidateNumber": 16,
    "aliases": [
      "Smith-machine hip thrust"
    ],
    "loadConvention": "Record added plates and the exact Smith/bench setup; effective bar resistance is unknown and not equivalent to barbell loading.",
    "loggingFields": [
      {
        "key": "reps",
        "label": "Repetitions",
        "unit": "count",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "load",
        "label": "Added plates",
        "unit": "lb",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "bench",
        "label": "Bench/setup",
        "unit": "text",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "barStart",
        "label": "Bar/safety setting",
        "unit": "text",
        "sideSpecific": false,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 16,
      "originalRecommendation": "add",
      "claims": [
        {
          "text": "Hip thrusts are general resistance-training exercises; exercise selection and load remain individualized.",
          "sourceIds": [
            "src-acsm-2026"
          ],
          "evidenceType": "position stand / overview of reviews",
          "applicabilityToPostSurgicalAchilles": "indirect",
          "uncertainty": "The source does not validate this machine setup or postoperative Achilles readiness.",
          "developerScope": "General training context only; not proof of exercise-specific cues, configuration or Achilles eligibility."
        }
      ],
      "demos": [
        {
          "url": "https://repfitness.com/blogs/guides/smith-machine-hip-thrust",
          "sourcePage": "https://repfitness.com/blogs/guides/smith-machine-hip-thrust",
          "title": "How to Do a Smith Machine Hip Thrust",
          "provider": "REP Fitness",
          "durationSeconds": null,
          "startSeconds": null,
          "endSeconds": null,
          "access": "public",
          "pageVerified": true,
          "playbackVerified": false,
          "exactMovementVerified": true,
          "verifiedAt": "2026-09-16",
          "verificationNotes": "Public exercise-specific page and written movement match verified; embedded video playback was not checked. Equipment-company instruction is not clinical evidence."
        }
      ],
      "existingMatches": [
        {
          "collection": "activeCatalog",
          "id": "bridge",
          "name": "Bridge / Hip Thrust",
          "relationship": "related",
          "reason": "Movement family overlaps, but equipment and setup are broader/simpler."
        },
        {
          "collection": "exerciseLibrary",
          "id": "library-barbell-hip-thrust",
          "name": "Barbell hip thrust",
          "relationship": "related",
          "reason": "Free bar versus fixed Smith path."
        },
        {
          "collection": "exerciseLibrary",
          "id": "library-barbell-glute-bridge",
          "name": "Barbell glute bridge",
          "relationship": "related",
          "reason": "Floor bridge has different range and bench setup."
        }
      ],
      "prerequisites": [
        "bridge",
        "library-barbell-hip-thrust",
        "library-barbell-glute-bridge"
      ],
      "unresolvedPrerequisites": [
        "Bench height/capacity, anti-slip method, bar pad, Smith path, safeties, entry/exit and starting resistance are unknown."
      ],
      "reviewQuestions": [
        "Can the bench be positively secured and is its height/capacity appropriate?",
        "What pad and safety settings permit safe entry and exit?"
      ],
      "regressions": [
        {
          "name": "Bridge / Hip Thrust",
          "existingId": "bridge",
          "rationale": "Existing simpler setup; its current rules remain authoritative.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Barbell hip thrust",
          "existingId": "library-barbell-hip-thrust",
          "rationale": "Free-bar setup differs and is not an automatic substitute.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": {
      "startPosition": "Adult seated on floor with upper back against secured bench, padded Smith bar across hip crease.",
      "endPosition": "Hips extended to a neutral trunk-thigh line while feet remain planted.",
      "equipment": "Smith machine, secured bench, bar pad",
      "importantAnatomyAndAlignment": "Bench stable, shins near vertical at top, ribs controlled.",
      "cameraAngle": "Side view showing bench, safeties and rail.",
      "avoid": "Do not show an unsecured bench, bare bar on pelvis, or lumbar hyperextension."
    }
  },
  {
    "id": "library-belt-squat-calf-raise",
    "name": "Belt-squat calf raise",
    "equipment": [
      "belt-squat",
      "weight-plates"
    ],
    "muscle": "Legs",
    "setup": "Setup review required. Fringe Sport advertises calf raises using a changed handle attachment. The exact compatible attachment, foot surface, hand support and lever clearance have not been verified for your setup. Do not improvise this from a generic belt-squat illustration.",
    "review": "Calf raising with belt-squat resistance and reduced hand loading. Flat-floor default avoids inventing additional dorsiflexion. Manufacturer compatibility does not establish clinical readiness, load or range.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "",
    "verifiedAt": null,
    "guideUrl": null,
    "contentStatus": "setup-review-required",
    "verification": "Exact video demo remains under review. The illustration and setup notes do not establish readiness or a prescribed dose.",
    "candidateNumber": 17,
    "aliases": [
      "lever belt-squat calf raise"
    ],
    "loadConvention": "Record added plates and exact lever/handle setup; do not equate lever loading with free weights. Neither 225 lb nor 380 lb is a candidate start load or readiness threshold.",
    "loggingFields": [
      {
        "key": "reps",
        "label": "Repetitions",
        "unit": "count",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "load",
        "label": "Added plates",
        "unit": "lb",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "setup",
        "label": "Handle/attachment setup",
        "unit": "text",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "range",
        "label": "Foot surface/range",
        "unit": "text",
        "sideSpecific": false,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 17,
      "originalRecommendation": "add",
      "claims": [
        {
          "text": "The Mammoth product page advertises calf raises as a supported use when the belt is exchanged for another handle attachment.",
          "sourceIds": [
            "src-fringe-mammoth-2026"
          ],
          "evidenceType": "manufacturer product information",
          "applicabilityToPostSurgicalAchilles": "equipment-only",
          "uncertainty": "Does not confirm the user's exact attachment, stance, range, load, eligibility or safe execution."
        }
      ],
      "demos": [
        {
          "url": "https://www.fringesport.com/collections/squat-rack-attachments/products/mammoth-belt-squat",
          "sourcePage": "https://www.fringesport.com/collections/squat-rack-attachments/products/mammoth-belt-squat",
          "title": "Mammoth Belt Squat product page",
          "provider": "Fringe Sport",
          "durationSeconds": null,
          "startSeconds": null,
          "endSeconds": null,
          "access": "public",
          "pageVerified": true,
          "playbackVerified": false,
          "exactMovementVerified": false,
          "verifiedAt": "2026-09-16",
          "verificationNotes": "Page verified and it advertises calf raises by changing the handle attachment. No exact exercise demo or playback was verified, and the user's attachment configuration is unknown."
        }
      ],
      "existingMatches": [
        {
          "collection": "activeCatalog",
          "id": "bilateral-calf",
          "name": "Bilateral calf raise",
          "relationship": "related",
          "reason": "Same broad joint action without belt-squat resistance."
        },
        {
          "collection": "activeCatalog",
          "id": "belt-squat",
          "name": "Belt squat",
          "relationship": "related",
          "reason": "Same device but different movement."
        },
        {
          "collection": "exerciseLibrary",
          "id": "calf-smith",
          "name": "Smith calf raise",
          "relationship": "related",
          "reason": "Loaded calf raise using a different machine path."
        }
      ],
      "prerequisites": [
        "bilateral-calf",
        "belt-squat",
        "calf-smith"
      ],
      "unresolvedPrerequisites": [
        "Exact handle/attachment, hand support, foot surface, lever clearance, start load and clinical eligibility are unresolved."
      ],
      "reviewQuestions": [
        "Resolve belt versus handle configuration against manufacturer instructions and exact demo."
      ],
      "regressions": [
        {
          "name": "Bilateral calf raise",
          "existingId": "bilateral-calf",
          "rationale": "Existing bodyweight pattern with less equipment complexity.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Smith calf raise",
          "existingId": "calf-smith",
          "rationale": "Existing loaded machine option with different mechanics and start-load assessment.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": null
  },
  {
    "id": "library-belt-squat-isometric",
    "name": "Belt-squat isometric",
    "equipment": [
      "belt-squat",
      "weight-plates"
    ],
    "muscle": "Legs",
    "setup": "Setup review required. A specific hold position, lever stop and safe entry/exit method must be reviewed before performing a Mammoth belt-squat isometric. No hold depth, duration or load is prescribed by this library entry.",
    "review": "Static knee/hip loading in a belt-squat position. Static does not mean low demand; ankle, knee and hip demand depend on depth and stance. No manufacturer or clinical source verified this exact isometric setup.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "",
    "verifiedAt": null,
    "guideUrl": null,
    "contentStatus": "setup-review-required",
    "verification": "Exact video demo remains under review. The illustration and setup notes do not establish readiness or a prescribed dose.",
    "candidateNumber": 18,
    "aliases": [
      "belt squat hold",
      "belt-squat squat isometric"
    ],
    "loadConvention": "Record added plates, lever setup and hold position. Do not equate lever load to free weights or use 225/380 lb as a start load.",
    "loggingFields": [
      {
        "key": "durationSeconds",
        "label": "Hold time",
        "unit": "seconds",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "load",
        "label": "Added plates",
        "unit": "lb",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "position",
        "label": "Hold position",
        "unit": "text",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "support",
        "label": "Support/bailout setup",
        "unit": "text",
        "sideSpecific": false,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 18,
      "originalRecommendation": "add",
      "claims": [],
      "demos": [],
      "existingMatches": [
        {
          "collection": "activeCatalog",
          "id": "belt-squat",
          "name": "Belt squat",
          "relationship": "related",
          "reason": "Dynamic repetitions differ from a sustained hold and bailout needs."
        }
      ],
      "prerequisites": [
        "belt-squat"
      ],
      "unresolvedPrerequisites": [
        "Hold depth, stance, load, duration, support, lever stop/bailout and clinical eligibility are unknown."
      ],
      "reviewQuestions": [
        "What exact hold position and bailout method are feasible on the Mammoth?",
        "Has that position and static loading been clinically reviewed?"
      ],
      "regressions": [
        {
          "name": "Belt squat",
          "existingId": "belt-squat",
          "rationale": "Existing dynamic record; not automatically interchangeable with a hold.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Bodyweight supported squat hold",
          "existingId": null,
          "rationale": "Removes external load but still requires depth and symptom review.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": {
      "startPosition": "Adult in a verified partial belt-squat position with support and lever stop visible.",
      "endPosition": "Same static position with hold symbol and no motion arrow.",
      "equipment": "Mammoth belt squat and verified safety setup",
      "importantAnatomyAndAlignment": "Knees track over feet; torso controlled; lever path clear.",
      "cameraAngle": "Side-front view showing depth and bailout hardware.",
      "avoid": "Do not imply a depth, duration or load before review; do not omit the safety stop."
    }
  },
  {
    "id": "library-slant-board-squat",
    "name": "Slant-board squat",
    "equipment": [
      "slant-board"
    ],
    "muscle": "Legs",
    "setup": "Place the board on a non-slip surface and verify its angle, width and rating. Stand with both heels fully supported and use external support if reviewed. Descend only through the reviewed range with knees tracking over the feet. Keep the heels supported and stand under control.",
    "review": "Squat pattern with heels supported on a slant board. Heel elevation changes ankle position and knee/hip mechanics but does not establish a safe range. No direct postoperative Achilles evidence or exact demo was verified.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "",
    "verifiedAt": null,
    "guideUrl": null,
    "contentStatus": "library-reference",
    "verification": "Exact video demo remains under review. The illustration and setup notes do not establish readiness or a prescribed dose.",
    "candidateNumber": 19,
    "aliases": [
      "heel-elevated squat",
      "wedge squat"
    ],
    "loadConvention": "Bodyweight unless external load is separately reviewed; record board angle/setting and load independently.",
    "loggingFields": [
      {
        "key": "reps",
        "label": "Repetitions",
        "unit": "count",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "load",
        "label": "External load",
        "unit": "lb",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "boardAngle",
        "label": "Board angle",
        "unit": "degrees/setting",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "range",
        "label": "Squat depth",
        "unit": "text",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "assistance",
        "label": "Support",
        "unit": "text",
        "sideSpecific": false,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 19,
      "originalRecommendation": "add",
      "claims": [],
      "demos": [],
      "existingMatches": [
        {
          "collection": "movementExercises",
          "id": "box-squat-pattern",
          "name": "Box squat pattern",
          "relationship": "related",
          "reason": "Provides a depth target without a slant board."
        },
        {
          "collection": "activeCatalog",
          "id": "belt-squat",
          "name": "Belt squat",
          "relationship": "related",
          "reason": "Loaded squat family but different ankle geometry and equipment."
        }
      ],
      "prerequisites": [
        "box-squat-pattern",
        "belt-squat"
      ],
      "unresolvedPrerequisites": [
        "Board angle, dimensions, rating, non-slip behavior, squat depth, support and eligibility are unknown."
      ],
      "reviewQuestions": [
        "What are the board's angle, width, surface and rating?",
        "What squat depth and support are clinically appropriate?"
      ],
      "regressions": [
        {
          "name": "Box squat pattern",
          "existingId": "box-squat-pattern",
          "rationale": "Existing depth target without the same heel-elevation geometry.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Belt squat",
          "existingId": "belt-squat",
          "rationale": "Existing externally loaded squat pattern with different setup.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": {
      "startPosition": "Adult standing with both heels fully supported on a slant board, toes on floor/platform.",
      "endPosition": "Controlled reviewed-depth squat with heels remaining supported.",
      "equipment": "Slant board and optional stable support",
      "importantAnatomyAndAlignment": "Board stable; knees track with feet; weight distributed symmetrically.",
      "cameraAngle": "Side three-quarter view clearly showing board angle.",
      "avoid": "Do not label an angle, show deep range, or imply reduced tendon load."
    }
  },
  {
    "id": "library-balance-cushion-single-leg-stance",
    "name": "Balance-cushion single-leg stance",
    "equipment": [
      "dyno-pad"
    ],
    "muscle": "Balance",
    "setup": "Inflatable cushion beside stable support on a nonslip floor; use device manufacturer inflation instructions. Stand tall with a soft knee and use support as needed. Step off if the cushion shifts or alignment/control changes.",
    "review": "Single-leg balance on an inflatable cushion. Unstable-surface balance is a capacity task, not an automatic Achilles progression criterion. Floor or foam-pad balance does not prove readiness for an inflatable cushion.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "Physitrack",
    "verifiedAt": "2026-09-16",
    "guideUrl": "https://ca.physitrack.com/home-exercise-video/single-leg-balance-on-a-cushion",
    "contentStatus": "library-reference",
    "verification": "Exercise guide checked; video playback not verified. This link is educational reference, not a verified Short Demo.",
    "candidateNumber": 20,
    "aliases": [
      "wobble-cushion single-leg stance",
      "inflatable-disc balance"
    ],
    "loadConvention": "Bodyweight; record cushion identity, inflation and support rather than an external load.",
    "loggingFields": [
      {
        "key": "side",
        "label": "Side",
        "unit": "left/right",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "durationSeconds",
        "label": "Hold time",
        "unit": "seconds",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "assistance",
        "label": "Hand support",
        "unit": "text",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "inflation",
        "label": "Cushion inflation/setting",
        "unit": "text",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "contacts",
        "label": "Foot-down contacts",
        "unit": "count",
        "sideSpecific": true,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 20,
      "originalRecommendation": "add",
      "claims": [],
      "demos": [
        {
          "url": "https://ca.physitrack.com/home-exercise-video/single-leg-balance-on-a-cushion",
          "sourcePage": "https://ca.physitrack.com/home-exercise-video/single-leg-balance-on-a-cushion",
          "title": "Single leg balance on a cushion",
          "provider": "Physitrack",
          "durationSeconds": null,
          "startSeconds": null,
          "endSeconds": null,
          "access": "public",
          "pageVerified": true,
          "playbackVerified": false,
          "exactMovementVerified": true,
          "verifiedAt": "2026-09-16",
          "verificationNotes": "Public page and exact written movement match verified; playback was not checked. Generic cushion instruction does not verify the user's Trideer device or clinical readiness."
        }
      ],
      "existingMatches": [
        {
          "collection": "activeCatalog",
          "id": "single-balance",
          "name": "Single-leg balance",
          "relationship": "related",
          "reason": "Existing floor-based balance lacks the inflatable surface."
        },
        {
          "collection": "exerciseLibrary",
          "id": "library-single-leg-foam-pad-balance",
          "name": "Single-leg foam-pad balance",
          "relationship": "related",
          "reason": "Foam pad and inflatable cushion are distinct equipment."
        },
        {
          "collection": "movementExercises",
          "id": "supported-single-leg-stance",
          "name": "Supported single-leg stance",
          "relationship": "related",
          "reason": "Stable-surface supported option."
        }
      ],
      "prerequisites": [
        "single-balance",
        "library-single-leg-foam-pad-balance",
        "supported-single-leg-stance"
      ],
      "unresolvedPrerequisites": [
        "Inflation guidance, non-slip behavior, step-on/off method, support level and current single-leg balance capacity are unknown."
      ],
      "reviewQuestions": [
        "What inflation guidance and non-slip setup apply to the Trideer cushion?",
        "What stable-surface balance prerequisite should gate this optional variant?"
      ],
      "regressions": [
        {
          "name": "Supported single-leg stance",
          "existingId": "supported-single-leg-stance",
          "rationale": "Existing stable-surface support option with lower instability.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Single-leg foam-pad balance",
          "existingId": "library-single-leg-foam-pad-balance",
          "rationale": "Existing foam surface; mechanically distinct from inflatable cushion.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": {
      "startPosition": "Adult beside stable support with one foot centered on round inflatable cushion.",
      "endPosition": "Upright single-leg stance with free foot slightly lifted and support hand hovering.",
      "equipment": "Inflatable balance cushion and stable support",
      "importantAnatomyAndAlignment": "Cushion flat on non-slip floor; knee softly aligned over foot.",
      "cameraAngle": "Front three-quarter view showing cushion and support.",
      "avoid": "Do not depict a foam pad, BOSU flat-up use, eyes closed, or hands far from support."
    }
  },
  {
    "id": "library-push-up",
    "name": "Floor push-up",
    "equipment": [],
    "muscle": "Chest",
    "setup": "Hands on floor, supported through hands and toes. Incline and kneeling positions require separate records. Lower the chest under control with elbows tracking comfortably. Press away while keeping trunk and pelvis together.",
    "review": "Horizontal pushing strength using bodyweight. Lower-limb loading is usually secondary but foot/ankle support position still matters. Do not let added strength work displace essential rehabilitation or silently increase total volume.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "",
    "verifiedAt": null,
    "guideUrl": null,
    "contentStatus": "library-reference",
    "verification": "Exact video demo remains under review. The illustration and setup notes do not establish readiness or a prescribed dose.",
    "candidateNumber": 21,
    "aliases": [
      "press-up"
    ],
    "loadConvention": "Bodyweight; record the support height/variation because leverage changes demand.",
    "loggingFields": [
      {
        "key": "reps",
        "label": "Repetitions",
        "unit": "count",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "variation",
        "label": "Variation/surface height",
        "unit": "text",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "assistance",
        "label": "Assistance",
        "unit": "text",
        "sideSpecific": false,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 21,
      "originalRecommendation": "add",
      "claims": [
        {
          "text": "Push-ups are a general resistance-training option; variation and training volume should be individualized.",
          "sourceIds": [
            "src-acsm-2026"
          ],
          "evidenceType": "position stand / overview of reviews",
          "applicabilityToPostSurgicalAchilles": "indirect",
          "uncertainty": "Healthy-adult guidance does not determine the user's entry variation, total program volume or clinical readiness.",
          "developerScope": "General training context only; not proof of exercise-specific cues, configuration or Achilles eligibility."
        }
      ],
      "demos": [],
      "existingMatches": [],
      "prerequisites": [],
      "unresolvedPrerequisites": [
        "Preferred entry variation and wrist/shoulder tolerance are not documented."
      ],
      "reviewQuestions": [
        "Which initial support height/variation fits the full-body plan without displacing rehab?"
      ],
      "regressions": [
        {
          "name": "Incline push-up",
          "existingId": null,
          "rationale": "Reduces bodyweight leverage; surface height must be recorded and reviewed.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Floor push-up",
          "existingId": null,
          "rationale": "Greater leverage demand; not an automatic progression.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": null
  },
  {
    "id": "library-chin-up",
    "name": "Chin-up",
    "equipment": [
      "pull-up-bar"
    ],
    "muscle": "Back",
    "setup": "Use a verified pull-up bar and supinated grip with clear foot space. Choose a reviewed assistance method before hanging or stepping up. Begin from the approved shoulder position and pull without swinging. Lower under control and use the planned step-down.",
    "review": "Vertical pulling strength with a supinated grip. Step-up/step-down and hanging foot clearance may affect the lower limb. Grip change is not an automatic progression from pull-up.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "Muscle & Strength",
    "verifiedAt": "2026-09-16",
    "guideUrl": "https://www.muscleandstrength.com/exercises/chin-up.html",
    "contentStatus": "library-reference",
    "verification": "Exercise guide checked; video playback not verified. This link is educational reference, not a verified Short Demo.",
    "candidateNumber": 22,
    "aliases": [
      "supinated-grip pull-up"
    ],
    "loadConvention": "Bodyweight plus/minus explicitly recorded assistance or added load; do not convert band assistance to pounds.",
    "loggingFields": [
      {
        "key": "reps",
        "label": "Repetitions",
        "unit": "count",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "assistance",
        "label": "Assistance",
        "unit": "text",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "grip",
        "label": "Grip/width",
        "unit": "text",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "load",
        "label": "Added load",
        "unit": "lb",
        "sideSpecific": false,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 22,
      "originalRecommendation": "add",
      "claims": [
        {
          "text": "Chin-ups are a general resistance-training variation; grip and assistance should be recorded rather than assumed equivalent to pull-ups.",
          "sourceIds": [
            "src-acsm-2026"
          ],
          "evidenceType": "position stand / overview of reviews",
          "applicabilityToPostSurgicalAchilles": "indirect",
          "uncertainty": "The source does not specify this user's assistance, joint tolerance or postoperative integration.",
          "developerScope": "General training context only; not proof of exercise-specific cues, configuration or Achilles eligibility."
        }
      ],
      "demos": [],
      "existingMatches": [
        {
          "collection": "activeCatalog",
          "id": "pull-up",
          "name": "Pull-up",
          "relationship": "related",
          "reason": "Pronated versus supinated grip changes the exercise and assistance needs."
        }
      ],
      "prerequisites": [
        "pull-up"
      ],
      "unresolvedPrerequisites": [
        "Assistance method, bar height/clearance, shoulder/elbow tolerance and safe mounting/dismounting are not confirmed."
      ],
      "reviewQuestions": [
        "What assistance and step-up/step-down arrangement is available?",
        "Should chin-up remain a separate variation rather than replace the current pull-up?"
      ],
      "regressions": [
        {
          "name": "Pull-up",
          "existingId": "pull-up",
          "rationale": "Existing pronated-grip vertical pull; not an exact equivalent.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Assisted chin-up",
          "existingId": null,
          "rationale": "May reduce pulling demand but assistance setup needs independent verification.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": {
      "startPosition": "Adult at pull-up bar with palms facing toward the body and feet clear of floor.",
      "endPosition": "Controlled top position without swinging, then indicated slow return.",
      "equipment": "Pull-up bar and optional verified assistance",
      "importantAnatomyAndAlignment": "Shoulders controlled, trunk quiet, no leg kick.",
      "cameraAngle": "Front three-quarter view showing grip orientation.",
      "avoid": "Do not show pronated grip, kipping, dropping, or an invented assistance device."
    }
  },
  {
    "id": "library-single-arm-cable-row",
    "name": "Standing single-arm cable row",
    "equipment": [
      "cable-station"
    ],
    "muscle": "Back",
    "setup": "Set a single cable handle at torso height. Stand in a stable stance with softly bent knees, feet planted and trunk still. Pull the handle toward your ribs without twisting; return with control. Review stance tolerance and stack setting separately from seated rows.",
    "review": "Unilateral horizontal pulling strength. Standing/staggered versions can add lower-limb stabilization; a seated supported version may be a different entry option. Upper-body additions must not silently increase total program volume.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "inbalance Fitness",
    "verifiedAt": "2026-09-16",
    "guideUrl": "https://www.inbalancefitness.com/fitness-blog/exercise-of-the-week-one-arm-cable-row",
    "contentStatus": "library-reference",
    "verification": "Exercise guide checked; video playback not verified. This link is educational reference, not a verified Short Demo.",
    "candidateNumber": 23,
    "aliases": [
      "unilateral cable row"
    ],
    "loadConvention": "Record displayed stack setting, side, pulley height and handle; cable ratio is unknown and loads are not equivalent to dumbbells.",
    "loggingFields": [
      {
        "key": "side",
        "label": "Side",
        "unit": "left/right",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "reps",
        "label": "Repetitions",
        "unit": "count",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "load",
        "label": "Cable stack setting",
        "unit": "displayed setting",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "position",
        "label": "Body position",
        "unit": "text",
        "sideSpecific": true,
        "requiredForLogging": false
      },
      {
        "key": "attachment",
        "label": "Handle/pulley setup",
        "unit": "text",
        "sideSpecific": true,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 23,
      "originalRecommendation": "add",
      "claims": [
        {
          "text": "Rows are general resistance-training exercises; implement and unilateral setup require individualized loading.",
          "sourceIds": [
            "src-acsm-2026"
          ],
          "evidenceType": "position stand / overview of reviews",
          "applicabilityToPostSurgicalAchilles": "indirect",
          "uncertainty": "The source does not establish this setup, starting stack setting or postoperative scheduling.",
          "developerScope": "General training context only; not proof of exercise-specific cues, configuration or Achilles eligibility."
        }
      ],
      "demos": [],
      "existingMatches": [
        {
          "collection": "activeCatalog",
          "id": "supported-db-row",
          "name": "Supported dumbbell row",
          "relationship": "related",
          "reason": "Unilateral row with different implement and support."
        },
        {
          "collection": "exerciseLibrary",
          "id": "library-rack-chest-supported-row",
          "name": "Rack-mounted chest-supported cable row",
          "relationship": "related",
          "reason": "Cable row family, but supported and not a single-arm standing/seated record."
        }
      ],
      "prerequisites": [
        "supported-db-row"
      ],
      "unresolvedPrerequisites": [
        "Canonical seated versus standing position, cable ratio, handle, pulley height and starting resistance are unknown."
      ],
      "reviewQuestions": [
        "Should the canonical version be seated to reduce stance demand?",
        "Which handle and pulley height are intended?"
      ],
      "regressions": [
        {
          "name": "Supported dumbbell row",
          "existingId": "supported-db-row",
          "rationale": "Existing supported unilateral row with different load path.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Seated single-arm cable row",
          "existingId": null,
          "rationale": "Reduces standing demand but needs bench/cable geometry review.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": null
  },
  {
    "id": "library-farmer-carry",
    "name": "Farmer carry",
    "equipment": [
      "dumbbells"
    ],
    "muscle": "Full body",
    "setup": "Choose two dumbbells and a clear, level route with a reviewed pickup method. Stand tall with one dumbbell at each side before walking. Take controlled steps while keeping both weights quiet. Turn deliberately and set both dumbbells down under control.",
    "review": "Bilateral loaded carry with dumbbells. Loaded walking adds repeated stance and propulsion demands. Bilateral carry is not automatically easier or harder than unilateral suitcase carry; it is different.",
    "libraryOnly": true,
    "referenceOnly": true,
    "automaticScheduling": false,
    "approvedForAutomaticScheduling": false,
    "videoUrl": null,
    "videoSource": "BarBend",
    "verifiedAt": "2026-09-16",
    "guideUrl": "https://barbend.com/farmers-carry/",
    "contentStatus": "library-reference",
    "verification": "Exercise guide checked; video playback not verified. This link is educational reference, not a verified Short Demo.",
    "candidateNumber": 24,
    "aliases": [
      "dumbbell farmer carry",
      "farmer walk"
    ],
    "loadConvention": "Record load per dumbbell, not combined load, plus distance or duration and turn method. Owned maximum is not a target.",
    "loggingFields": [
      {
        "key": "distance",
        "label": "Distance",
        "unit": "m",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "durationSeconds",
        "label": "Duration",
        "unit": "seconds",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "load",
        "label": "External load",
        "unit": "lb",
        "sideSpecific": false,
        "requiredForLogging": false
      },
      {
        "key": "turns",
        "label": "Turns",
        "unit": "count",
        "sideSpecific": false,
        "requiredForLogging": false
      }
    ],
    "educationalDose": null,
    "research": {
      "sourceFile": "docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json",
      "candidateNumber": 24,
      "originalRecommendation": "add",
      "claims": [
        {
          "text": "Loaded carries can be treated as general resistance training, but load and volume must be individualized.",
          "sourceIds": [
            "src-acsm-2026"
          ],
          "evidenceType": "position stand / overview of reviews",
          "applicabilityToPostSurgicalAchilles": "indirect",
          "uncertainty": "Healthy-adult guidance does not establish postoperative Achilles readiness, route, load or dose.",
          "developerScope": "General training context only; not proof of exercise-specific cues, configuration or Achilles eligibility."
        }
      ],
      "demos": [
        {
          "url": "https://barbend.com/farmers-carry/",
          "sourcePage": "https://barbend.com/farmers-carry/",
          "title": "How to Do the Farmer's Carry",
          "provider": "BarBend",
          "durationSeconds": null,
          "startSeconds": null,
          "endSeconds": null,
          "access": "public",
          "pageVerified": true,
          "playbackVerified": false,
          "exactMovementVerified": true,
          "verifiedAt": "2026-09-16",
          "verificationNotes": "Public written bilateral carry instructions were accessible; no video playback was verified. General fitness instruction, not clinical evidence."
        }
      ],
      "existingMatches": [
        {
          "collection": "movementExercises",
          "id": "suitcase-carry",
          "name": "Suitcase carry",
          "relationship": "related",
          "reason": "Unilateral carry differs from bilateral dumbbell loading."
        }
      ],
      "prerequisites": [
        "suitcase-carry"
      ],
      "unresolvedPrerequisites": [
        "Clear route, turn method, pickup/set-down strategy, start load and current loaded-walking tolerance are not confirmed."
      ],
      "reviewQuestions": [
        "What clear route and turn method are available?",
        "What starting load and total volume fit without displacing rehab?"
      ],
      "regressions": [
        {
          "name": "Suitcase carry",
          "existingId": "suitcase-carry",
          "rationale": "Existing unilateral load with different trunk demand.",
          "reviewRequired": true
        }
      ],
      "progressions": [
        {
          "name": "Shorter bilateral carry",
          "existingId": null,
          "rationale": "A dose change, not automatic eligibility; requires program review.",
          "reviewRequired": true
        }
      ]
    },
    "illustrationBrief": {
      "startPosition": "Adult standing tall on a clear lane with one dumbbell in each hand.",
      "endPosition": "Controlled walking step with weights quiet at sides.",
      "equipment": "Two dumbbells",
      "importantAnatomyAndAlignment": "Upright trunk, level shoulders, clear foot path.",
      "cameraAngle": "Front three-quarter view showing both weights and route.",
      "avoid": "Do not show running, a unilateral suitcase carry, clutter, or maximum dumbbells."
    }
  }
].map(withReferenceDemo);
