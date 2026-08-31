import { render } from "@testing-library/react";
import { ConfigProvider } from "antd";
import { afterEach, describe, expect, it } from "vitest";

import { useCrepeContentPadding } from "./use-crepe-content-padding";

const STYLE_ID = "markdown-composer-crepe-content-padding";

const Harness = () => {
  useCrepeContentPadding();
  return null;
};

interface ContentPaddingToken {
  fontSize?: number;
  padding?: number;
}

const renderWithToken = (token: ContentPaddingToken) =>
  render(
    <ConfigProvider theme={{ token }}>
      <Harness />
    </ConfigProvider>
  );

afterEach(() => {
  document.getElementById(STYLE_ID)?.remove();
});

describe("use-crepe-content-padding", () => {
  describe("useCrepeContentPadding", () => {
    it("should create a single style tag in the document head with token-driven values", () => {
      // Arrange & Act
      renderWithToken({ fontSize: 16, padding: 8 });

      // Assert
      const styles = document.head.querySelectorAll(`#${STYLE_ID}`);
      expect(styles).toHaveLength(1);
      expect(styles[0]?.textContent).toContain("--crepe-base-font-size: 16px");
      expect(styles[0]?.textContent).toContain("padding: 8px");
    });

    it("should reuse the existing style tag across rerenders with unchanged tokens", () => {
      // Arrange
      const { rerender } = renderWithToken({ fontSize: 16, padding: 8 });

      // Act
      rerender(
        <ConfigProvider theme={{ token: { fontSize: 16, padding: 8 } }}>
          <Harness />
        </ConfigProvider>
      );

      // Assert
      expect(document.head.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(1);
    });

    it("should update the style content when tokens change", () => {
      // Arrange
      const { rerender } = renderWithToken({ fontSize: 16, padding: 8 });

      // Act
      rerender(
        <ConfigProvider theme={{ token: { fontSize: 20, padding: 12 } }}>
          <Harness />
        </ConfigProvider>
      );

      // Assert
      const style = document.getElementById(STYLE_ID);
      expect(style?.textContent).toContain("--crepe-base-font-size: 20px");
      expect(style?.textContent).toContain("padding: 12px");
    });
  });
});
