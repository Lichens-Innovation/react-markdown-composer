import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import frameDarkCss from "@milkdown/crepe/theme/frame-dark.css?inline";
import frameLightCss from "@milkdown/crepe/theme/frame.css?inline";
import { useCrepeThemeStylesheet } from "./use-crepe-theme-stylesheet";

const STYLE_ID = "markdown-composer-crepe-theme";

interface HarnessProps {
  isDark: boolean;
}

const Harness = ({ isDark }: HarnessProps) => {
  useCrepeThemeStylesheet(isDark);
  return null;
};

afterEach(() => {
  document.getElementById(STYLE_ID)?.remove();
});

describe("use-crepe-theme-stylesheet", () => {
  describe("useCrepeThemeStylesheet", () => {
    it("should create a single style element in the document head", () => {
      // Arrange & Act
      render(<Harness isDark={false} />);

      // Assert
      const styles = document.head.querySelectorAll(`#${STYLE_ID}`);
      expect(styles).toHaveLength(1);
      expect(styles[0]?.tagName).toBe("STYLE");
    });

    it.each([
      { isDark: false, expectedCss: frameLightCss },
      { isDark: true, expectedCss: frameDarkCss },
    ])("should inject the $isDark theme css", ({ isDark, expectedCss }) => {
      // Arrange & Act
      render(<Harness isDark={isDark} />);

      // Assert
      expect(document.getElementById(STYLE_ID)?.textContent).toBe(expectedCss);
    });

    it("should update the same style element's css when isDark toggles", () => {
      // Arrange
      const { rerender } = render(<Harness isDark={false} />);

      // Act
      rerender(<Harness isDark={true} />);

      // Assert
      expect(document.head.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(1);
      expect(document.getElementById(STYLE_ID)?.textContent).toBe(frameDarkCss);
    });

    it("should not duplicate the style element when rerendered with the same isDark value", () => {
      // Arrange
      const { rerender } = render(<Harness isDark={false} />);

      // Act
      rerender(<Harness isDark={false} />);

      // Assert
      expect(document.head.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(1);
    });
  });
});
