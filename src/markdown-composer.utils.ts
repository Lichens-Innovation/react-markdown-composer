import type { PanelWidths } from "./markdown-composer.types";

export const DEFAULT_PREVIEW_DEBOUNCE_MS = 300;
export const DEFAULT_PANEL_WIDTHS: PanelWidths = { objectGraph: 15, editor: 50, preview: 35 };

export const toPercent = (value: number): string => `${value}%`;

export const buildObjectPath = (segments: Array<string | number>): string => segments.map(String).join(".");

export const toJsonViewValue = (data: unknown): object => {
  if (data !== null && typeof data === "object") {
    return data;
  }

  return { value: data };
};

interface PanelVisibility {
  isObjectGraphVisible: boolean;
  isPreviewVisible: boolean;
}

interface GetCollapsedFlagsArgs {
  collapsed: boolean[];
}

export const getCollapsedFlags = ({ collapsed }: GetCollapsedFlagsArgs): PanelVisibility => {
  const [isObjectGraphCollapsed, , isPreviewCollapsed] = collapsed;

  return {
    isObjectGraphVisible: !isObjectGraphCollapsed,
    isPreviewVisible: !isPreviewCollapsed,
  };
};
