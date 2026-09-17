// Canonical equipment is independent of this athlete's owned equipment.
import {withReferenceDemo} from './referenceDemos.js';
export const TRAINING_SLED = "training-sled";
export const LEGACY_MOVEMENT_ALIASES = Object.freeze({"weighted-wagon-backward-drag":"backward-sled-drag"});
export const TREADMILL_DETAILS = Object.freeze({brand:"ProForm",name:"ProForm Performance 300i",model:"PFTL39715.1",voltage:120,frequencyHz:60,currentA:11,maxUserWeightLb:300,source:"User-confirmed follow-up handoff 2026-09-16",backwardWalkingAuthorization:"unverified"});
export function updateEquipmentContext(profile) {
 if (!profile || profile.equipmentContext20260916) return profile;
 const equipmentDetails = {...profile.equipmentDetails};
 if (profile.equipment?.includes("incline-treadmill")) equipmentDetails["incline-treadmill"] = {...equipmentDetails["incline-treadmill"],...TREADMILL_DETAILS};
 if (profile.equipment?.includes("weighted-wagon")) equipmentDetails["weighted-wagon"] = {...equipmentDetails["weighted-wagon"],role:"personal-substitute",canonicalEquipment:"training-sled",generalRecommendation:false,exerciseRatingVerified:false,permittedLegacyMovement:"weighted-wagon-backward-drag"};
 return {...profile,equipmentDetails,equipmentContext20260916:true};
}
export const EQUIPMENT_REFERENCE_EXERCISES = [
 ["backward-sled-drag","Backward sled drag","training-sled","Purpose-built loaded training sled. Legacy wagon logs retain their original equipment; they do not establish sled-specific loads."],
 ["sled-push","Sled push","training-sled","Purpose-built training sled with a suitable push interface. Individual setup and programming remain under review."],
 ["forward-sled-drag","Forward sled drag / resisted march","training-sled","Purpose-built training sled with a suitable pulling attachment. Individual setup and programming remain under review."],
 ["backward-treadmill-walk","Backward treadmill walk","incline-treadmill","Deferred: backward-walking authorization has not been verified for ProForm PFTL39715.1. Movement evidence, clinical readiness and device authorization are separate."]
].map(([id,name,equipment,setup])=>withReferenceDemo({id,name,equipment:[equipment],muscle:"Conditioning",setup,review:"Reference under review; not available for automatic programming or exercise swaps.",libraryOnly:true,referenceOnly:true,automaticScheduling:false,videoUrl:null,videoSource:"",verifiedAt:null,verification:"No suitable device-specific demo verified. ProForm backward-walking authorization remains unresolved."}));
