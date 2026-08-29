import { useEffect } from "react";

import frameDarkUrl from "@milkdown/crepe/theme/frame-dark.css?url";
import frameLightUrl from "@milkdown/crepe/theme/frame.css?url";

const CREPE_THEME_LINK_ID = "markdown-composer-crepe-theme";

export const useCrepeThemeStylesheet = (isDark: boolean): void => {
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>(`#${CREPE_THEME_LINK_ID}`);

    if (!link) {
      link = document.createElement("link");
      link.id = CREPE_THEME_LINK_ID;
      link.rel = "stylesheet";
      document.head.append(link);
    }

    link.href = isDark ? frameDarkUrl : frameLightUrl;
  }, [isDark]);
};
