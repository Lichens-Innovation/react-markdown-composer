import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebouncedTemplatePreview } from "./use-debounced-template-preview";

const DEBOUNCE_MS = 300;

interface TemplateProps {
  template: string;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("use-debounced-template-preview", () => {
  describe("useDebouncedTemplatePreview", () => {
    it("should apply the rendered markdown after the debounce elapses", async () => {
      // Arrange
      const renderTemplate = vi.fn().mockResolvedValue("# Rendered");
      const { result } = renderHook(() =>
        useDebouncedTemplatePreview({ template: "raw", data: {}, renderTemplate, debounceMs: DEBOUNCE_MS })
      );

      // Act
      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
      });

      // Assert
      expect(result.current.previewMarkdown).toBe("# Rendered");
      expect(result.current.previewErrorMessage).toBeUndefined();
    });

    it("should roll back to the last good markdown and set an error message when rendering throws", async () => {
      // Arrange
      const renderTemplate = vi.fn().mockResolvedValueOnce("# Good").mockRejectedValueOnce(new Error("boom"));
      const { result, rerender } = renderHook(
        ({ template }: TemplateProps) =>
          useDebouncedTemplatePreview({ template, data: {}, renderTemplate, debounceMs: DEBOUNCE_MS }),
        { initialProps: { template: "raw" } }
      );
      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
      });
      expect(result.current.previewMarkdown).toBe("# Good");

      // Act
      rerender({ template: "raw-2" });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
      });

      // Assert
      expect(result.current.previewErrorMessage).toBe("boom");
      expect(result.current.previewMarkdown).toBe("# Good");
    });

    it("should coalesce rapid changes into a single render call using the latest args", async () => {
      // Arrange
      const renderTemplate = vi.fn().mockResolvedValue("# Rendered");
      const { rerender } = renderHook(
        ({ template }: TemplateProps) =>
          useDebouncedTemplatePreview({ template, data: {}, renderTemplate, debounceMs: DEBOUNCE_MS }),
        { initialProps: { template: "a" } }
      );

      // Act
      rerender({ template: "b" });
      rerender({ template: "c" });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
      });

      // Assert
      expect(renderTemplate).toHaveBeenCalledTimes(1);
      expect(renderTemplate).toHaveBeenCalledWith({ template: "c", data: {} });
    });

    it("should discard a late-resolving stale request in favor of a newer one", async () => {
      // Arrange
      let resolveFirst: (value: string) => void = () => {};
      const firstDeferred = new Promise<string>((resolve) => {
        resolveFirst = resolve;
      });
      const renderTemplate = vi.fn().mockReturnValueOnce(firstDeferred).mockResolvedValueOnce("# Second");
      const { result, rerender } = renderHook(
        ({ template }: TemplateProps) =>
          useDebouncedTemplatePreview({ template, data: {}, renderTemplate, debounceMs: DEBOUNCE_MS }),
        { initialProps: { template: "first" } }
      );

      // Act: fire the first (slow) request, then start a second cycle before it resolves
      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
      });
      rerender({ template: "second" });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
      });

      // Assert: the second (fast) result applies
      expect(result.current.previewMarkdown).toBe("# Second");

      // Act: resolve the stale first request late
      await act(async () => {
        resolveFirst("# Stale");
      });
      await act(async () => {});

      // Assert: the stale result is discarded
      expect(result.current.previewMarkdown).toBe("# Second");
    });

    it("should not call renderTemplate when unmounted before the debounce elapses", async () => {
      // Arrange
      const renderTemplate = vi.fn().mockResolvedValue("# Rendered");
      const { unmount } = renderHook(() =>
        useDebouncedTemplatePreview({ template: "raw", data: {}, renderTemplate, debounceMs: DEBOUNCE_MS })
      );

      // Act
      unmount();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
      });

      // Assert
      expect(renderTemplate).not.toHaveBeenCalled();
    });

    it("should render with the default handlebars renderer when none is provided", async () => {
      // Arrange
      const { result } = renderHook(() =>
        useDebouncedTemplatePreview({ template: "{{name}}", data: { name: "Ada" }, debounceMs: DEBOUNCE_MS })
      );

      // Act
      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
      });

      // Assert
      expect(result.current.previewMarkdown).toBe("Ada");
    });
  });
});
