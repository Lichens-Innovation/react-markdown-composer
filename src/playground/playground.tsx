import { ConfigProvider, Flex, Switch, theme, Typography } from "antd";
import { createRoot } from "react-dom/client";
import { useState, type FunctionComponent } from "react";

import { usePlaygroundFixtures } from "./hooks/use-playground-fixtures";
import { PlaygroundBody } from "./playground-body";

const Playground: FunctionComponent = () => {
  const [isDark, setIsDark] = useState(false);
  const [isObjectGraphVisible, setIsObjectGraphVisible] = useState(true);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const { markdown, setMarkdown, inputData, isReady, loadErrorMessage } = usePlaygroundFixtures();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Flex vertical style={{ height: "100%", background: isDark ? "#141414" : "#ffffff" }}>
        <Flex align="center" gap={16} style={{ padding: "8px 12px", borderBottom: "1px solid #d9d9d9" }}>
          <Typography.Text strong>MarkdownComposer</Typography.Text>
          <Flex align="center" gap={8}>
            <Typography.Text>Dark</Typography.Text>
            <Switch checked={isDark} onChange={setIsDark} />
          </Flex>
        </Flex>

        <Flex flex={1} style={{ minHeight: 0 }}>
          <PlaygroundBody
            markdown={markdown}
            inputData={inputData}
            isReady={isReady}
            loadErrorMessage={loadErrorMessage}
            isObjectGraphVisible={isObjectGraphVisible}
            isPreviewVisible={isPreviewVisible}
            onMarkdownChange={setMarkdown}
            onObjectGraphVisibleChange={setIsObjectGraphVisible}
            onPreviewVisibleChange={setIsPreviewVisible}
          />
        </Flex>
      </Flex>
    </ConfigProvider>
  );
};

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element #root not found");
}

document.documentElement.style.height = "100%";
document.body.style.height = "100%";
document.body.style.margin = "0";
root.style.height = "100%";

createRoot(root).render(<Playground />);
