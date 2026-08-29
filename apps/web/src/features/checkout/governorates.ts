/** Iraqi governorates — static list for guest checkout select. */
export const IRAQ_GOVERNORATES = [
  "بغداد",
  "البصرة",
  "نينوى",
  "أربيل",
  "السليمانية",
  "دهوك",
  "كركوك",
  "الأنبار",
  "ديالى",
  "صلاح الدين",
  "بابل",
  "كربلاء",
  "النجف",
  "واسط",
  "ميسان",
  "ذي قار",
  "المثنى",
  "القادسية",
] as const;

export type IraqGovernorate = (typeof IRAQ_GOVERNORATES)[number];
