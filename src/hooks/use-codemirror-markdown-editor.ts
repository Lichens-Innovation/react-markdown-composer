import { markdown as markdownLanguage } from "@codemirror/lang-markdown";
import { Compartment, EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup, EditorView } from "codemirror";
import { type RefObject, useCallback, useEffect, useRef } from "react";

interface UseCodemirrorMarkdownEditorArgs {
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  isDark: boolean;
}

interface UseCodemirrorMarkdownEditorResult {
  containerRef: RefObject<HTMLDivElement | null>;
  insertPath: (path: string) => void;
}

const editorLayoutTheme = EditorView.theme({
  "&": { height: "100%", fontSize: "12px" },
  ".cm-scroller": { overflow: "auto" },
});

export const useCodemirrorMarkdownEditor = ({
  markdown,
  onMarkdownChange,
  isDark,
}: UseCodemirrorMarkdownEditorArgs): UseCodemirrorMarkdownEditorResult => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeCompartmentRef = useRef(new Compartment());
  const lastEmittedMarkdownRef = useRef(markdown);
  const onMarkdownChangeRef = useRef(onMarkdownChange);
  const isDarkRef = useRef(isDark);

  useEffect(() => {
    onMarkdownChangeRef.current = onMarkdownChange;
  }, [onMarkdownChange]);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    const view = new EditorView({
      parent,
      state: EditorState.create({
        doc: lastEmittedMarkdownRef.current,
        extensions: [
          basicSetup,
          markdownLanguage(),
          EditorView.lineWrapping,
          editorLayoutTheme,
          themeCompartmentRef.current.of(isDarkRef.current ? oneDark : []),
          EditorView.updateListener.of((update) => {
            if (!update.docChanged) return;

            const nextMarkdown = update.state.doc.toString();
            lastEmittedMarkdownRef.current = nextMarkdown;
            onMarkdownChangeRef.current(nextMarkdown);
          }),
        ],
      }),
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    if (markdown === lastEmittedMarkdownRef.current) return;

    lastEmittedMarkdownRef.current = markdown;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: markdown },
    });
  }, [markdown]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: themeCompartmentRef.current.reconfigure(isDark ? oneDark : []),
    });
  }, [isDark]);

  const insertPath = useCallback((path: string) => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch(view.state.replaceSelection(path));
    view.focus();
  }, []);

  return { containerRef, insertPath };
};
