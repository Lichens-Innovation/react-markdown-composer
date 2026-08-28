import { getErrorMessage } from "@lichens-innovation/ts-common";
import { useEffect, useState } from "react";

import { loadPlaygroundFixtures } from "../playground.utils";

export interface PlaygroundFixturesState {
  markdown: string;
  inputData: unknown;
  isReady: boolean;
  loadErrorMessage?: string;
  setMarkdown: (markdown: string) => void;
}

export const usePlaygroundFixtures = (): PlaygroundFixturesState => {
  const [markdown, setMarkdown] = useState("");
  const [inputData, setInputData] = useState<unknown>({});
  const [isReady, setIsReady] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string>();

  useEffect(() => {
    const abortController = new AbortController();

    const load = async () => {
      try {
        const fixtures = await loadPlaygroundFixtures(abortController.signal);
        if (abortController.signal.aborted) {
          return;
        }

        setMarkdown(fixtures.markdown);
        setInputData(fixtures.inputData);
        setIsReady(true);
      } catch (error: unknown) {
        if (abortController.signal.aborted) {
          return;
        }

        setLoadErrorMessage(getErrorMessage(error));
      }
    };

    void load();

    return () => {
      abortController.abort();
    };
  }, []);

  return { markdown, setMarkdown, inputData, isReady, loadErrorMessage };
};
