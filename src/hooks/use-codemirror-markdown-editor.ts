import { markdown as markdownLanguage } from "@codemirror/lang-markdown";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
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

interface CreateMarkdownEditorStateArgs {
  doc: string;
  themeExtension: Extension;
  onDocChange: (markdown: string) => void;
}

interface UseMountEditorViewArgs {
  containerRef: RefObject<HTMLDivElement | null>;
  viewRef: RefObject<EditorView | null>;
  themeCompartmentRef: RefObject<Compartment>;
  lastEmittedMarkdownRef: RefObject<string>;
  onMarkdownChange: (markdown: string) => void;
  isDark: boolean;
}

interface UseSyncEditorDocumentArgs {
  viewRef: RefObject<EditorView | null>;
  lastEmittedMarkdownRef: RefObject<string>;
  markdown: string;
}

interface UseSyncEditorThemeArgs {
  viewRef: RefObject<EditorView | null>;
  themeCompartmentRef: RefObject<Compartment>;
  isDark: boolean;
}

const createMarkdownEditorState = ({ doc, themeExtension, onDocChange }: CreateMarkdownEditorStateArgs): EditorState =>
  EditorState.create({
    doc,
    extensions: [
      basicSetup,
      markdownLanguage(),
      editorLayoutTheme,
      themeExtension,
      EditorView.updateListener.of((update) => {
        if (!update.docChanged) return;

        onDocChange(update.state.doc.toString());
      }),
    ],
  });

const useLatestRef = <T>(value: T): RefObject<T> => {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};

const useMountEditorView = ({
  containerRef,
  viewRef,
  themeCompartmentRef,
  lastEmittedMarkdownRef,
  onMarkdownChange,
  isDark,
}: UseMountEditorViewArgs): void => {
  const onMarkdownChangeRef = useLatestRef(onMarkdownChange);
  const isDarkRef = useLatestRef(isDark);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    const state = createMarkdownEditorState({
      doc: lastEmittedMarkdownRef.current,
      themeExtension: themeCompartmentRef.current.of(isDarkRef.current ? oneDark : []),
      onDocChange: (nextMarkdown) => {
        lastEmittedMarkdownRef.current = nextMarkdown;
        onMarkdownChangeRef.current(nextMarkdown);
      },
    });
    const view = new EditorView({ parent, state });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [containerRef, viewRef, themeCompartmentRef, lastEmittedMarkdownRef, isDarkRef, onMarkdownChangeRef]);
};

const useSyncEditorDocument = ({ viewRef, lastEmittedMarkdownRef, markdown }: UseSyncEditorDocumentArgs): void => {
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    if (markdown === lastEmittedMarkdownRef.current) return;

    lastEmittedMarkdownRef.current = markdown;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: markdown },
    });
  }, [viewRef, lastEmittedMarkdownRef, markdown]);
};

const useSyncEditorTheme = ({ viewRef, themeCompartmentRef, isDark }: UseSyncEditorThemeArgs): void => {
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: themeCompartmentRef.current.reconfigure(isDark ? oneDark : []),
    });
  }, [viewRef, themeCompartmentRef, isDark]);
};

export const useCodemirrorMarkdownEditor = ({
  markdown,
  onMarkdownChange,
  isDark,
}: UseCodemirrorMarkdownEditorArgs): UseCodemirrorMarkdownEditorResult => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeCompartmentRef = useRef(new Compartment());
  const lastEmittedMarkdownRef = useRef(markdown);
  useMountEditorView({ containerRef, viewRef, themeCompartmentRef, lastEmittedMarkdownRef, onMarkdownChange, isDark });
  useSyncEditorDocument({ viewRef, lastEmittedMarkdownRef, markdown });
  useSyncEditorTheme({ viewRef, themeCompartmentRef, isDark });

  const insertPath = useCallback((path: string) => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch(view.state.replaceSelection(path));
    view.focus();
  }, []);

  return { containerRef, insertPath };
};
