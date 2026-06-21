export const SERVICE_CATEGORIES = [
  "Coupe homme",
  "Coupe enfant",
  "Barbe",
  "Combo",
  "Autres",
] as const;

export type ServiceCategoryName = (typeof SERVICE_CATEGORIES)[number];
