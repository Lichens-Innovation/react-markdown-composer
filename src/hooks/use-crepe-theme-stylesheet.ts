import { useEffect } from "react";

import frameDarkCss from "@milkdown/crepe/theme/frame-dark.css?inline";
import frameLightCss from "@milkdown/crepe/theme/frame.css?inline";

const CREPE_THEME_STYLE_ID = "markdown-composer-crepe-theme";

export const useCrepeThemeStylesheet = (isDark: boolean): void => {
  useEffect(() => {
    let style = document.querySelector<HTMLStyleElement>(`#${CREPE_THEME_STYLE_ID}`);

    if (!style) {
      style = document.createElement("style");
      style.id = CREPE_THEME_STYLE_ID;
      document.head.append(style);
    }

    style.textContent = isDark ? frameDarkCss : frameLightCss;
  }, [isDark]);
};
