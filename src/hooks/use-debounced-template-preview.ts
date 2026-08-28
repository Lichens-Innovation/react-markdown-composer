import { getErrorMessage } from "@lichens-innovation/ts-common";
import { useEffect, useRef, useState } from "react";

import { createHandlebarsRenderer } from "~/handlebar-helpers/handlebars.helpers";
import type { DebouncedTemplatePreview, RenderTemplate } from "../markdown-composer.types";
import { DEFAULT_PREVIEW_DEBOUNCE_MS } from "../markdown-composer.utils";

interface UseDebouncedTemplatePreviewArgs {
  template: string;
  data: unknown;
  renderTemplate?: RenderTemplate;
  debounceMs?: number;
}

export const useDebouncedTemplatePreview = ({
  template,
  data,
  renderTemplate = createHandlebarsRenderer(),
  debounceMs = DEFAULT_PREVIEW_DEBOUNCE_MS,
}: UseDebouncedTemplatePreviewArgs): DebouncedTemplatePreview => {
  const [previewMarkdown, setPreviewMarkdown] = useState(template);
  const [previewErrorMessage, setPreviewErrorMessage] = useState<string>();
  const lastGoodMarkdownRef = useRef(template);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const nextMarkdown = await renderTemplate({ template, data });
          if (requestId !== requestIdRef.current) {
            return;
          }

          lastGoodMarkdownRef.current = nextMarkdown;
          setPreviewMarkdown(nextMarkdown);
          setPreviewErrorMessage(undefined);
        } catch (error: unknown) {
          if (requestId !== requestIdRef.current) {
            return;
          }

          setPreviewMarkdown(lastGoodMarkdownRef.current);
          setPreviewErrorMessage(getErrorMessage(error));
        }
      })();
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [template, data, renderTemplate, debounceMs]);

  return { previewMarkdown, previewErrorMessage };
};
