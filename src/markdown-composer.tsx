import "@milkdown/crepe/theme/common/style.css";

import { Splitter, theme } from "antd";
import { useRef, type FunctionComponent } from "react";

import { MarkdownEditorPanel, type MarkdownEditorHandle } from "./components/markdown-editor-panel";
import { MarkdownPreviewPanel } from "./components/markdown-preview-panel";
import { ObjectGraphPanel } from "./components/object-graph-panel";
import { cleanTemplate, createHandlebarsRenderer } from "./handlebar-helpers/handlebars.helpers";
import { useCrepeThemeStylesheet } from "./hooks/use-crepe-theme-stylesheet";
import { useDebouncedTemplatePreview } from "./hooks/use-debounced-template-preview";
import { useIsAntdDark } from "./hooks/use-is-antd-dark";
import type { MarkdownComposerProps } from "./markdown-composer.types";
import { DEFAULT_PREVIEW_DEBOUNCE_MS, getCollapsedFlags } from "./markdown-composer.utils";

const { useToken } = theme;

export const MarkdownComposer: FunctionComponent<MarkdownComposerProps> = ({
  inputData,
  markdown,
  onMarkdownChange,
  renderTemplate,
  translate,
  previewDebounceMs = DEFAULT_PREVIEW_DEBOUNCE_MS,
  isObjectGraphVisible = true,
  isPreviewVisible = true,
  onObjectGraphVisibleChange,
  onPreviewVisibleChange,
  className,
  style,
}) => {
  const styles = useStyles();
  const isDark = useIsAntdDark();
  useCrepeThemeStylesheet(isDark);

  const editorHandleRef = useRef<MarkdownEditorHandle | null>(null);

  const { previewMarkdown, previewErrorMessage } = useDebouncedTemplatePreview({
    template: markdown,
    data: inputData,
    renderTemplate: renderTemplate ?? createHandlebarsRenderer({ translate }),
    debounceMs: previewDebounceMs,
  });

  const handleCollapse = (collapsed: boolean[]) => {
    const next = getCollapsedFlags({ collapsed });

    if (next.isObjectGraphVisible !== isObjectGraphVisible) {
      onObjectGraphVisibleChange?.(next.isObjectGraphVisible);
    }

    if (next.isPreviewVisible !== isPreviewVisible) {
      onPreviewVisibleChange?.(next.isPreviewVisible);
    }
  };

  return (
    <Splitter
      className={className}
      style={{ ...styles.root, ...style }}
      styles={styles.panel}
      onCollapse={handleCollapse}
    >
      <Splitter.Panel defaultSize={isObjectGraphVisible ? "25%" : 0} min="15%" collapsible>
        <ObjectGraphPanel inputData={inputData} onKeyNameClick={(path) => editorHandleRef.current?.insertPath(path)} />
      </Splitter.Panel>

      <Splitter.Panel defaultSize="50%" min="30%">
        <MarkdownEditorPanel markdown={markdown} onMarkdownChange={onMarkdownChange} editorRef={editorHandleRef} />
      </Splitter.Panel>

      <Splitter.Panel defaultSize={isPreviewVisible ? "25%" : 0} min="15%" collapsible>
        <MarkdownPreviewPanel markdown={cleanTemplate(previewMarkdown)} errorMessage={previewErrorMessage} />
      </Splitter.Panel>
    </Splitter>
  );
};

const useStyles = () => {
  const { token } = useToken();

  return {
    root: {
      height: "100%",
    },
    panel: {
      panel: {
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadiusLG,
        overflow: "hidden",
      },
    },
  };
};
