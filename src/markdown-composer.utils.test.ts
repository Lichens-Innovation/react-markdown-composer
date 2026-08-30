import { describe, expect, it } from "vitest";

import { buildObjectPath, getCollapsedFlags, toJsonViewValue } from "./markdown-composer.utils";

describe("markdown-composer.utils", () => {
  describe("buildObjectPath", () => {
    it.each([
      { segments: [], expected: "" },
      { segments: ["a"], expected: "a" },
      { segments: ["a", "b", "c"], expected: "a.b.c" },
      { segments: ["a", 0, "b"], expected: "a.0.b" },
      { segments: [0, 1, 2], expected: "0.1.2" },
    ])("should join $segments into '$expected'", ({ segments, expected }) => {
      // Arrange & Act
      const path = buildObjectPath(segments);

      // Assert
      expect(path).toBe(expected);
    });
  });

  describe("toJsonViewValue", () => {
    it("should return the object as-is when given a plain object", () => {
      // Arrange
      const data = { a: 1 };

      // Act
      const value = toJsonViewValue(data);

      // Assert
      expect(value).toBe(data);
    });

    it("should return the array as-is when given an array", () => {
      // Arrange
      const data = [1, 2, 3];

      // Act
      const value = toJsonViewValue(data);

      // Assert
      expect(value).toBe(data);
    });

    it.each([
      { data: null, expected: { value: null } },
      { data: undefined, expected: { value: undefined } },
      { data: "text", expected: { value: "text" } },
      { data: 42, expected: { value: 42 } },
      { data: true, expected: { value: true } },
    ])("should wrap primitive $data as { value: $data }", ({ data, expected }) => {
      // Arrange & Act
      const value = toJsonViewValue(data);

      // Assert
      expect(value).toEqual(expected);
    });
  });

  describe("getCollapsedFlags", () => {
    it("should mark both panels visible when nothing is collapsed", () => {
      // Arrange
      const collapsed = [false, false, false];

      // Act
      const flags = getCollapsedFlags({ collapsed });

      // Assert
      expect(flags).toEqual({ isObjectGraphVisible: true, isPreviewVisible: true });
    });

    it("should mark both panels hidden when both are collapsed", () => {
      // Arrange
      const collapsed = [true, false, true];

      // Act
      const flags = getCollapsedFlags({ collapsed });

      // Assert
      expect(flags).toEqual({ isObjectGraphVisible: false, isPreviewVisible: false });
    });

    it("should treat a missing preview slot as visible (undefined is falsy)", () => {
      // Arrange
      const collapsed = [false];

      // Act
      const flags = getCollapsedFlags({ collapsed });

      // Assert
      expect(flags).toEqual({ isObjectGraphVisible: true, isPreviewVisible: true });
    });
  });
});
