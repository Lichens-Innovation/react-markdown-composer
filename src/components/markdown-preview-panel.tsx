import { isNotBlank } from "@lichens-innovation/ts-common";
import { MilkdownProvider } from "@milkdown/react";
import { Alert, Flex, theme } from "antd";
import { type FunctionComponent } from "react";

import { useCrepeContentPadding } from "../hooks/use-crepe-content-padding";
import { useCrepeTableStyle } from "../hooks/use-crepe-table-style";
import { MarkdownPreviewInner } from "./markdown-preview-inner";

const { useToken } = theme;

interface MarkdownPreviewPanelProps {
  markdown: string;
  errorMessage?: string;
}

export const MarkdownPreviewPanel: FunctionComponent<MarkdownPreviewPanelProps> = ({ markdown, errorMessage }) => {
  useCrepeContentPadding();
  useCrepeTableStyle();
  const styles = useStyles();

  return (
    <Flex vertical role="region" aria-label="Markdown preview" className="markdown-preview-panel" style={styles.root}>
      {isNotBlank(errorMessage) && (
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
