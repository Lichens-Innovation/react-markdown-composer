import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import frameDarkUrl from "@milkdown/crepe/theme/frame-dark.css?url";
import frameLightUrl from "@milkdown/crepe/theme/frame.css?url";
import { useCrepeThemeStylesheet } from "./use-crepe-theme-stylesheet";

const LINK_ID = "markdown-composer-crepe-theme";

interface HarnessProps {
  isDark: boolean;
}

const Harness = ({ isDark }: HarnessProps) => {
  useCrepeThemeStylesheet(isDark);
  return null;
};

afterEach(() => {
  document.getElementById(LINK_ID)?.remove();
});

describe("use-crepe-theme-stylesheet", () => {
  describe("useCrepeThemeStylesheet", () => {
    it("should create a single stylesheet link in the document head", () => {
      // Arrange & Act
      render(<Harness isDark={false} />);

      // Assert
      expect(document.head.querySelectorAll(`#${LINK_ID}`)).toHaveLength(1);
    });

    it.each([
      { isDark: false, expectedUrl: frameLightUrl },
      { isDark: true, expectedUrl: frameDarkUrl },
    ])("should point href at the $isDark theme stylesheet", ({ isDark, expectedUrl }) => {
      // Arrange & Act
      render(<Harness isDark={isDark} />);

      // Assert
      const link = document.getElementById(LINK_ID);
      expect(link?.getAttribute("href")).toBe(expectedUrl);
    });

    it("should update the same link's href when isDark toggles", () => {
      // Arrange
      const { rerender } = render(<Harness isDark={false} />);

      // Act
      rerender(<Harness isDark={true} />);

      // Assert
      expect(document.head.querySelectorAll(`#${LINK_ID}`)).toHaveLength(1);
      expect(document.getElementById(LINK_ID)?.getAttribute("href")).toBe(frameDarkUrl);
    });

    it("should not duplicate the link when rerendered with the same isDark value", () => {
      // Arrange
      const { rerender } = render(<Harness isDark={false} />);

      // Act
      rerender(<Harness isDark={false} />);

      // Assert
      expect(document.head.querySelectorAll(`#${LINK_ID}`)).toHaveLength(1);
    });
  });
});
