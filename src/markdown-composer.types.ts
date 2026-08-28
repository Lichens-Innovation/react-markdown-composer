import type { CSSProperties } from "react";

interface RenderTemplateArgs {
  template: string;
  data: unknown;
}

export type RenderTemplate = (args: RenderTemplateArgs) => string | Promise<string>;

export interface TranslateTemplate {
  (key: string, interpolation?: Record<string, unknown>): string;
}

export interface PrintableImage {
  filename: string;
  imageDataURI: string;
}

export interface MarkdownComposerProps {
  inputData: unknown;
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  renderTemplate?: RenderTemplate;
  translate?: TranslateTemplate;
  previewDebounceMs?: number;
  isObjectGraphVisible?: boolean;
  isPreviewVisible?: boolean;
  onObjectGraphVisibleChange?: (isVisible: boolean) => void;
  onPreviewVisibleChange?: (isVisible: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

export interface DebouncedTemplatePreview {
  previewMarkdown: string;
  previewErrorMessage?: string;
}
