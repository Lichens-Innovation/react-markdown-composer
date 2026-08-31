import { render } from "@testing-library/react";
import { ConfigProvider } from "antd";
import { afterEach, describe, expect, it } from "vitest";

import { useCrepeTableStyle } from "./use-crepe-table-style";

const STYLE_ID = "markdown-composer-crepe-table";

interface TableToken {
  colorBorder?: string;
  colorFillAlter?: string;
  paddingXS?: number;
  paddingSM?: number;
  fontWeightStrong?: number;
}

const Harness = () => {
  useCrepeTableStyle();
  return null;
};

const renderWithToken = (token: TableToken) =>
  render(
    <ConfigProvider theme={{ token }}>
      <Harness />
    </ConfigProvider>
  );

afterEach(() => {
  document.getElementById(STYLE_ID)?.remove();
});

describe("use-crepe-table-style", () => {
  describe("useCrepeTableStyle", () => {
    it("should create a single style tag in the document head with token-driven values", () => {
      // Arrange & Act
      renderWithToken({
        colorBorder: "#111111",
        colorFillAlter: "#222222",
        paddingXS: 4,
        paddingSM: 8,
        fontWeightStrong: 600,
      });

      // Assert
      const styles = document.head.querySelectorAll(`#${STYLE_ID}`);
      expect(styles).toHaveLength(1);
      expect(styles[0]?.textContent).toContain("border: 1px solid #111111");
      expect(styles[0]?.textContent).toContain("background: #222222");
      expect(styles[0]?.textContent).toContain("padding: 4px 8px");
      expect(styles[0]?.textContent).toContain("font-weight: 600");
    });

    it("should reuse the existing style tag across rerenders with unchanged tokens", () => {
      // Arrange
      const token: TableToken = {
        colorBorder: "#111111",
        colorFillAlter: "#222222",
        paddingXS: 4,
        paddingSM: 8,
        fontWeightStrong: 600,
      };
      const { rerender } = renderWithToken(token);

      // Act
      rerender(
        <ConfigProvider theme={{ token }}>
          <Harness />
        </ConfigProvider>
      );

      // Assert
      expect(document.head.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(1);
    });

    it("should update the style content when tokens change", () => {
      // Arrange
      const { rerender } = renderWithToken({
        colorBorder: "#111111",
        colorFillAlter: "#222222",
        paddingXS: 4,
        paddingSM: 8,
        fontWeightStrong: 600,
      });

      // Act
      rerender(
        <ConfigProvider
          theme={{
            token: {
              colorBorder: "#999999",
              colorFillAlter: "#888888",
              paddingXS: 2,
              paddingSM: 6,
              fontWeightStrong: 700,
            },
          }}
        >
          <Harness />
        </ConfigProvider>
      );

      // Assert
      const style = document.getElementById(STYLE_ID);
      expect(style?.textContent).toContain("border: 1px solid #999999");
      expect(style?.textContent).toContain("background: #888888");
      expect(style?.textContent).toContain("padding: 2px 6px");
      expect(style?.textContent).toContain("font-weight: 700");
    });
  });
});
