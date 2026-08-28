import { getErrorMessage } from "@lichens-innovation/ts-common";

const PLAYGROUND_MARKDOWN_URL = "/template-001.md";
const PLAYGROUND_INPUT_DATA_URL = "/template-inputs.json";

interface PlaygroundFixtures {
  markdown: string;
  inputData: unknown;
}

interface FetchPlaygroundTextArgs {
  url: string;
  signal: AbortSignal;
}

const parsePlaygroundJson = (text: string): unknown => {
  try {
    return JSON.parse(text) as unknown;
  } catch (error: unknown) {
    throw new Error(`Invalid JSON: ${getErrorMessage(error)}`, { cause: error });
  }
};

const fetchPlaygroundText = async ({ url, signal }: FetchPlaygroundTextArgs): Promise<string> => {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }

  return response.text();
};

export const loadPlaygroundFixtures = async (signal: AbortSignal): Promise<PlaygroundFixtures> => {
  const [markdown, inputDataText] = await Promise.all([
    fetchPlaygroundText({ url: PLAYGROUND_MARKDOWN_URL, signal }),
    fetchPlaygroundText({ url: PLAYGROUND_INPUT_DATA_URL, signal }),
  ]);

  return {
    markdown,
    inputData: parsePlaygroundJson(inputDataText),
  };
};
