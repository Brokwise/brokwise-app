import { TFunction } from "i18next";

export type PlotType = "ROAD" | "CORNER";

export function getPlotTypeLabel(
  t: TFunction,
  plotType: string | undefined | null,
  mode: "compact" | "verbose" = "compact"
): string {
  if (!plotType) return "";
  const key =
    mode === "verbose"
      ? `plot_type_${plotType.toLowerCase()}_verbose`
      : `plot_type_${plotType.toLowerCase()}_compact`;
  const translated = t(key);
  // Fallback if key is missing (returns the key itself)
  return translated === key ? plotType : translated;
}

export function getPlotTypeOptions(t: TFunction) {
  return [
    {
      value: "ROAD" as const,
      label: t("plot_type_road_compact"),
      description: t("plot_type_road_desc"),
    },
    {
      value: "CORNER" as const,
      label: t("plot_type_corner_compact"),
      description: t("plot_type_corner_desc"),
    },
  ];
}
