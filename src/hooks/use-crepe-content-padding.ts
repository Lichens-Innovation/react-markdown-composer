import { theme } from "antd";
import { useEffect } from "react";

const { useToken } = theme;

const CREPE_CONTENT_PADDING_STYLE_ID = "markdown-composer-crepe-content-padding";

export const useCrepeContentPadding = (): void => {
  const { token } = useToken();

  useEffect(() => {
    let style = document.querySelector<HTMLStyleElement>(`#${CREPE_CONTENT_PADDING_STYLE_ID}`);

    if (!style) {
      style = document.createElement("style");
      style.id = CREPE_CONTENT_PADDING_STYLE_ID;
      document.head.append(style);
    }

    style.textContent = `.markdown-preview-panel .milkdown .ProseMirror { padding: ${token.padding}px; }`;
  }, [token.padding]);
};
