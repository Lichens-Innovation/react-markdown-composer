import { render } from "@testing-library/react";
import { EditorView } from "codemirror";
import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";

import { useCodemirrorMarkdownEditor } from "./use-codemirror-markdown-editor";

type HookArgs = Parameters<typeof useCodemirrorMarkdownEditor>[0];
type HookResult = ReturnType<typeof useCodemirrorMarkdownEditor>;

interface HarnessProps {
  args: HookArgs;
  onResult: (result: HookResult) => void;
}

const Harness = ({ args, onResult }: HarnessProps) => {
  const { containerRef, insertPath } = useCodemirrorMarkdownEditor(args);

  useEffect(() => {
    onResult({ containerRef, insertPath });
  });

  return <div ref={containerRef} />;
};

const createResultCapture = () => {
  let current: HookResult | undefined;

  return {
    onResult: (result: HookResult) => {
      current = result;
    },
    get current(): HookResult {
      if (!current) {
        throw new Error("Harness has not rendered yet");
      }

      return current;
    },
  };
};

describe("use-codemirror-markdown-editor", () => {
  describe("useCodemirrorMarkdownEditor", () => {
    it("should seed the editor with the initial markdown", () => {
      // Arrange
      const onMarkdownChange = vi.fn();
      const capture = createResultCapture();
      render(<Harness args={{ markdown: "# Start", onMarkdownChange, isDark: false }} onResult={capture.onResult} />);

      // Act
      capture.current.insertPath("X");

      // Assert
      expect(onMarkdownChange).toHaveBeenCalledWith("X# Start");
    });

    it("should insert at the current selection and notify onMarkdownChange", () => {
      // Arrange
      const onMarkdownChange = vi.fn();
      const capture = createResultCapture();
      render(<Harness args={{ markdown: "", onMarkdownChange, isDark: false }} onResult={capture.onResult} />);

      // Act
      capture.current.insertPath("first");
      capture.current.insertPath("-second");

      // Assert
      expect(onMarkdownChange).toHaveBeenLastCalledWith("first-second");
    });

    it("should not re-emit onMarkdownChange when the markdown prop echoes back the last emitted value", () => {
      // Arrange
      const onMarkdownChange = vi.fn();
      const capture = createResultCapture();
      const { rerender } = render(
        <Harness args={{ markdown: "", onMarkdownChange, isDark: false }} onResult={capture.onResult} />
      );
      capture.current.insertPath("X");
      const emittedMarkdown = onMarkdownChange.mock.calls.at(-1)?.[0] as string;
      onMarkdownChange.mockClear();

      // Act
      rerender(
        <Harness args={{ markdown: emittedMarkdown, onMarkdownChange, isDark: false }} onResult={capture.onResult} />
      );

      // Assert
      expect(onMarkdownChange).not.toHaveBeenCalled();
    });

    it("should apply external markdown prop changes and notify onMarkdownChange", () => {
      // Arrange
      const onMarkdownChange = vi.fn();
      const capture = createResultCapture();
      const { rerender } = render(
        <Harness args={{ markdown: "a", onMarkdownChange, isDark: false }} onResult={capture.onResult} />
      );
      onMarkdownChange.mockClear();

      // Act
      rerender(<Harness args={{ markdown: "b", onMarkdownChange, isDark: false }} onResult={capture.onResult} />);

      // Assert
      expect(onMarkdownChange).toHaveBeenCalledWith("b");
    });

    it("should reconfigure the theme when isDark toggles without breaking the editor", () => {
      // Arrange
      const onMarkdownChange = vi.fn();
      const capture = createResultCapture();
      const { container, rerender } = render(
        <Harness args={{ markdown: "", onMarkdownChange, isDark: false }} onResult={capture.onResult} />
      );
      const lightClassName = container.querySelector(".cm-editor")?.className;

      // Act
      rerender(<Harness args={{ markdown: "", onMarkdownChange, isDark: true }} onResult={capture.onResult} />);
      const darkClassName = container.querySelector(".cm-editor")?.className;

      // Assert
      expect(darkClassName).not.toBe(lightClassName);
      capture.current.insertPath("y");
      expect(onMarkdownChange).toHaveBeenCalledWith("y");
    });

    it("should mount exactly one editor view regardless of rerenders", () => {
      // Arrange
      const onMarkdownChange = vi.fn();
      const capture = createResultCapture();
      const { container, rerender } = render(
        <Harness args={{ markdown: "a", onMarkdownChange, isDark: false }} onResult={capture.onResult} />
      );

      // Act
      rerender(<Harness args={{ markdown: "b", onMarkdownChange, isDark: true }} onResult={capture.onResult} />);
      rerender(<Harness args={{ markdown: "c", onMarkdownChange, isDark: false }} onResult={capture.onResult} />);

      // Assert
      expect(container.querySelectorAll(".cm-editor")).toHaveLength(1);
    });

    it("should destroy the editor view on unmount", () => {
      // Arrange
      const destroySpy = vi.spyOn(EditorView.prototype, "destroy");
      const capture = createResultCapture();
      const { unmount } = render(
        <Harness args={{ markdown: "", onMarkdownChange: vi.fn(), isDark: false }} onResult={capture.onResult} />
      );

      // Act
      unmount();

      // Assert
      expect(destroySpy).toHaveBeenCalledTimes(1);
      destroySpy.mockRestore();
    });
  });
});
