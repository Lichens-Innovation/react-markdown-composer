import { theme } from "antd";
import { useEffect } from "react";

const { useToken } = theme;

const CREPE_TABLE_STYLE_ID = "markdown-composer-crepe-table";

export const useCrepeTableStyle = (): void => {
  const { token } = useToken();
  const { colorBorder, colorFillAlter, paddingXS, paddingSM, fontWeightStrong } = token;

  useEffect(() => {
    let style = document.querySelector<HTMLStyleElement>(`#${CREPE_TABLE_STYLE_ID}`);

    if (!style) {
      style = document.createElement("style");
      style.id = CREPE_TABLE_STYLE_ID;
      document.head.append(style);
    }

    style.textContent = `
      .markdown-preview-panel .milkdown .ProseMirror table {
        border-collapse: collapse;
        border: 1px solid ${colorBorder};
      }
      .markdown-preview-panel .milkdown .ProseMirror table th,
      .markdown-preview-panel .milkdown .ProseMirror table td {
        border: 1px solid ${colorBorder};
        padding: ${paddingXS}px ${paddingSM}px;
      }
      .markdown-preview-panel .milkdown .ProseMirror table th {
        background: ${colorFillAlter};
        font-weight: ${fontWeightStrong};
      }
    `;
  }, [colorBorder, colorFillAlter, paddingXS, paddingSM, fontWeightStrong]);
};
