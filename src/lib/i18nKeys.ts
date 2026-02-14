export const CATEGORY_LABEL_KEY_MAP = {
  RESIDENTIAL: "category_residential",
  COMMERCIAL: "category_commercial",
  INDUSTRIAL: "category_industrial",
  AGRICULTURAL: "category_agricultural",
  RESORT: "category_resort",
  FARM_HOUSE: "category_farmhouse",
} as const;

export const getCategoryLabelKey = (category: string) => {
  return (
    CATEGORY_LABEL_KEY_MAP[
      category as keyof typeof CATEGORY_LABEL_KEY_MAP
    ] ?? "category_residential"
  );
};
