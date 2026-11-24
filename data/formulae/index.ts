import { FormulaItem } from "./types";
import { MATHS_FORMULAE } from "./maths";
import { PHYSICS_FORMULAE } from "./physics";
import { CHEMISTRY_FORMULAE } from "./chemistry";
import { CS_FORMULAE } from "./cs";
import { ENGLISH_FORMULAE } from "./english";
import { PE_FORMULAE } from "./pe";

export * from "./types";
export { MATHS_FORMULAE } from "./maths";
export { PHYSICS_FORMULAE } from "./physics";
export { CHEMISTRY_FORMULAE } from "./chemistry";
export { CS_FORMULAE } from "./cs";
export { ENGLISH_FORMULAE } from "./english";
export { PE_FORMULAE } from "./pe";

export const SUBJECT_FORMULAE: FormulaItem[] = [
  ...MATHS_FORMULAE,
  ...PHYSICS_FORMULAE,
  ...CHEMISTRY_FORMULAE,
  ...CS_FORMULAE,
  ...ENGLISH_FORMULAE,
  ...PE_FORMULAE,
];

export function getFormulaeBySubject(subjectId: string): FormulaItem[] {
  return SUBJECT_FORMULAE.filter((f) => f.subjectId === subjectId);
}

export function getFormulaById(id: string): FormulaItem | undefined {
  return SUBJECT_FORMULAE.find((f) => f.id === id);
}
