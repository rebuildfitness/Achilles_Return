import { updateEquipmentContext } from "./equipmentContext.js";
// User-confirmed ownership update. Apply once; later deselection is respected.
export function addConfirmedEquipment(profile) {
 if (!profile || profile.equipmentUpdate20260915) return updateEquipmentContext(profile);
 return updateEquipmentContext({...profile, equipment: [...new Set([...(profile.equipment || []), 'landmine-station', 'rack-leg-extension'])], equipmentUpdate20260915: true});
}
