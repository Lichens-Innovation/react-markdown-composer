import { Crepe } from "@milkdown/crepe";
import { replaceAll } from "@milkdown/kit/utils";
import { Milkdown, useEditor, useInstance } from "@milkdown/react";
import { type FunctionComponent, useEffect, useRef } from "react";

import { htmlElementPlugins } from "../crepe-html/html-element.plugin";

interface MarkdownPreviewInnerProps {
  markdown: string;
}

export const MarkdownPreviewInner: FunctionComponent<MarkdownPreviewInnerProps> = ({ markdown }) => {
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
