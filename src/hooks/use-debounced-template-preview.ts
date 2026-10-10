import { getErrorMessage } from "@lichens-innovation/ts-common";
import { useCallback, useEffect, useRef, useState } from "react";

import { createHandlebarsRenderer } from "~/handlebar-helpers/handlebars.helpers";
import type { DebouncedTemplatePreview, RenderTemplate } from "../markdown-composer.types";
import { DEFAULT_PREVIEW_DEBOUNCE_MS } from "../markdown-composer.utils";

interface UseDebouncedTemplatePreviewArgs {
  template: string;
  data: unknown;
  renderTemplate?: RenderTemplate;
  debounceMs?: number;
}

interface RenderTemplateSafelyArgs {
  renderTemplate: RenderTemplate;
  template: string;
  data: unknown;
}

type RenderOutcome = { markdown: string } | { errorMessage: string };

const renderTemplateSafely = async ({
  renderTemplate,
  template,
  data,
}: RenderTemplateSafelyArgs): Promise<RenderOutcome> => {
  try {
    return { markdown: await renderTemplate({ template, data }) };
  } catch (error: unknown) {
    return { errorMessage: getErrorMessage(error) };
  }
};

interface PreviewState extends DebouncedTemplatePreview {
  applyOutcome: (outcome: RenderOutcome) => void;
}

const usePreviewState = (template: string): PreviewState => {
  const [previewMarkdown, setPreviewMarkdown] = useState(template);
  const [previewErrorMessage, setPreviewErrorMessage] = useState<string>();
  const lastGoodMarkdownRef = useRef(template);

  const applyOutcome = useCallback((outcome: RenderOutcome) => {
    if ("errorMessage" in outcome) {
      setPreviewMarkdown(lastGoodMarkdownRef.current);
      setPreviewErrorMessage(outcome.errorMessage);
      return;
    }

    lastGoodMarkdownRef.current = outcome.markdown;
    setPreviewMarkdown(outcome.markdown);
    setPreviewErrorMessage(undefined);
  }, []);

  return { previewMarkdown, previewErrorMessage, applyOutcome };
};

export const useDebouncedTemplatePreview = ({
  template,
  data,
  renderTemplate = createHandlebarsRenderer(),
  debounceMs = DEFAULT_PREVIEW_DEBOUNCE_MS,
}: UseDebouncedTemplatePreviewArgs): DebouncedTemplatePreview => {
  const { previewMarkdown, previewErrorMessage, applyOutcome } = usePreviewState(template);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const timeoutId = window.setTimeout(() => {
      void renderTemplateSafely({ renderTemplate, template, data }).then((outcome) => {
        if (requestId === requestIdRef.current) {
          applyOutcome(outcome);
        }
      });
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [template, data, renderTemplate, debounceMs, applyOutcome]);

  return { previewMarkdown, previewErrorMessage };
};
