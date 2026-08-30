import { Crepe } from "@milkdown/crepe";
import { replaceAll } from "@milkdown/kit/utils";
import { Milkdown, MilkdownProvider, useEditor, useInstance } from "@milkdown/react";
import { Alert, Flex, theme } from "antd";
import { type FunctionComponent, useEffect, useRef } from "react";

import { htmlElementPlugins } from "../crepe-html/html-element.plugin";
import { useCrepeContentPadding } from "../hooks/use-crepe-content-padding";
import { useCrepeTableStyle } from "../hooks/use-crepe-table-style";

const { useToken } = theme;

interface MarkdownPreviewPanelProps {
  markdown: string;
  errorMessage?: string;
}

interface MarkdownPreviewInnerProps {
  markdown: string;
}

const MarkdownPreviewInner: FunctionComponent<MarkdownPreviewInnerProps> = ({ markdown }) => {
  const lastSyncedMarkdownRef = useRef(markdown);
  const [isLoading, getEditor] = useInstance();

  useEditor((root) => {
    const crepe = new Crepe({ root, defaultValue: lastSyncedMarkdownRef.current });
    crepe.editor.use(htmlElementPlugins);
    crepe.setReadonly(true);
    return crepe;
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (markdown === lastSyncedMarkdownRef.current) return;

    const editor = getEditor();
    if (!editor) return;

    lastSyncedMarkdownRef.current = markdown;
    editor.action(replaceAll(markdown));
  }, [markdown, isLoading, getEditor]);

  return <Milkdown />;
};

export const MarkdownPreviewPanel: FunctionComponent<MarkdownPreviewPanelProps> = ({ markdown, errorMessage }) => {
  useCrepeContentPadding();
  useCrepeTableStyle();
  const styles = useStyles();

  return (
    <Flex vertical role="region" aria-label="Markdown preview" className="markdown-preview-panel" style={styles.root}>
      {!!errorMessage && (
        <Alert type="error" showIcon title="Template preview error" description={errorMessage} style={styles.alert} />
      )}

      <Flex flex={1} style={styles.body}>
        <MilkdownProvider>
          <MarkdownPreviewInner markdown={markdown} />
        </MilkdownProvider>
      </Flex>
    </Flex>
  );
};

const useStyles = () => {
  const { token } = useToken();

  return {
    root: {
      height: "100%",
      overflow: "auto",
    },
    alert: {
      margin: token.marginXS,
    },
    body: {
      minHeight: 0,
      overflow: "auto",
    },
  };
};
