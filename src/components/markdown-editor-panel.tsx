import { type FunctionComponent, type Ref, useImperativeHandle } from "react";

import { useCodemirrorMarkdownEditor } from "../hooks/use-codemirror-markdown-editor";
import { useIsAntdDark } from "../hooks/use-is-antd-dark";

export interface MarkdownEditorHandle {
  insertPath: (path: string) => void;
}

interface MarkdownEditorPanelProps {
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  editorRef?: Ref<MarkdownEditorHandle>;
}

export const MarkdownEditorPanel: FunctionComponent<MarkdownEditorPanelProps> = ({
  markdown,
  onMarkdownChange,
  editorRef,
}) => {
  const isDark = useIsAntdDark();
  const { containerRef, insertPath } = useCodemirrorMarkdownEditor({
    markdown,
    onMarkdownChange,
    isDark,
  });

  useImperativeHandle(editorRef, () => ({ insertPath }), [insertPath]);

  const styles = getStyles();

  return <div ref={containerRef} style={styles.root} role="region" aria-label="Markdown editor" />;
};

const getStyles = () => {
  return {
    root: {
      height: "100%",
      overflow: "hidden",
    },
  };
};
