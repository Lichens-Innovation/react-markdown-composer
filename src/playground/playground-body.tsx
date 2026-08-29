import { Alert, Flex, Spin, Typography } from "antd";
import { type FunctionComponent } from "react";

import { MarkdownComposer } from "../markdown-composer";
import type { TranslateTemplate } from "../markdown-composer.types";

const PLAYGROUND_STATUS_COLORS: Record<string, string> = {
  compliant: "#43A047",
  needsAttention: "#FB8C00",
  urgentActionRequired: "#E53935",
  notInspected: "#9E9E9E",
};

const PLAYGROUND_TRANSLATIONS: Record<string, string> = {
  "configuration.statusOptions.compliant": "Conforme",
  "configuration.statusOptions.needsAttention": "Requiert attention",
  "configuration.statusOptions.urgentActionRequired": "Non conforme",
  "configuration.statusOptions.notInspected": "Non-inspecté",
};

const playgroundTranslate: TranslateTemplate = (key) => PLAYGROUND_TRANSLATIONS[key] ?? key;

interface PlaygroundBodyProps {
  markdown: string;
  inputData: unknown;
  isReady: boolean;
  loadErrorMessage?: string;
  isObjectGraphVisible: boolean;
  isPreviewVisible: boolean;
  onMarkdownChange: (markdown: string) => void;
  onObjectGraphVisibleChange: (isVisible: boolean) => void;
  onPreviewVisibleChange: (isVisible: boolean) => void;
}

export const PlaygroundBody: FunctionComponent<PlaygroundBodyProps> = ({
  markdown,
  inputData,
  isReady,
  loadErrorMessage,
  isObjectGraphVisible,
  isPreviewVisible,
  onMarkdownChange,
  onObjectGraphVisibleChange,
  onPreviewVisibleChange,
}) => {
  if (loadErrorMessage) {
    return <Alert type="error" title="Failed to load playground fixtures" description={loadErrorMessage} />;
  }

  if (!isReady) {
    return (
      <Flex align="center" justify="center" vertical gap={8} style={{ height: "100%" }}>
        <Spin />
        <Typography.Text>Loading playground fixtures…</Typography.Text>
      </Flex>
    );
  }

  const hasInputData = typeof inputData === "object" && inputData !== null;
  const playgroundInputData = hasInputData
    ? { ...inputData, statusColors: PLAYGROUND_STATUS_COLORS }
    : { value: inputData, statusColors: PLAYGROUND_STATUS_COLORS };

  return (
    <MarkdownComposer
      inputData={playgroundInputData}
      markdown={markdown}
      onMarkdownChange={onMarkdownChange}
      translate={playgroundTranslate}
      isObjectGraphVisible={isObjectGraphVisible}
      isPreviewVisible={isPreviewVisible}
      onObjectGraphVisibleChange={onObjectGraphVisibleChange}
      onPreviewVisibleChange={onPreviewVisibleChange}
    />
  );
};
