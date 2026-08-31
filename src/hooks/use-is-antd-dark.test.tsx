import { renderHook } from "@testing-library/react";
import { ConfigProvider } from "antd";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import { isLightColor } from "@lichens-innovation/ts-common";
import { useIsAntdDark } from "./use-is-antd-dark";

vi.mock("@lichens-innovation/ts-common", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@lichens-innovation/ts-common")>();
  return { ...actual, isLightColor: vi.fn(actual.isLightColor) };
});

const mockedIsLightColor = vi.mocked(isLightColor);

const createWrapper = (colorBgContainer: string) => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <ConfigProvider theme={{ token: { colorBgContainer } }}>{children}</ConfigProvider>
  );

  return Wrapper;
};

describe("use-is-antd-dark", () => {
  describe("useIsAntdDark", () => {
    it.each([
      { colorBgContainer: "#ffffff", expectedIsDark: false },
      { colorBgContainer: "#141414", expectedIsDark: true },
      { colorBgContainer: "#f0f0f0", expectedIsDark: false },
      { colorBgContainer: "#1f1f1f", expectedIsDark: true },
    ])("should return $expectedIsDark for background $colorBgContainer", ({ colorBgContainer, expectedIsDark }) => {
      // Arrange
      const wrapper = createWrapper(colorBgContainer);

      // Act
      const { result } = renderHook(() => useIsAntdDark(), { wrapper });

      // Assert
      expect(result.current).toBe(expectedIsDark);
    });

    it("should derive the value from isLightColor called with the resolved background token", () => {
      // Arrange
      const wrapper = createWrapper("#ffffff");

      // Act
      renderHook(() => useIsAntdDark(), { wrapper });

      // Assert
      expect(mockedIsLightColor).toHaveBeenCalledWith("#ffffff");
    });
  });
});
