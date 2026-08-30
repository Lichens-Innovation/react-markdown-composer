import { afterEach, describe, expect, it, vi } from "vitest";

import { loadPlaygroundFixtures } from "./playground.utils";

const createFetchMock = (responses: Record<string, Response>) =>
  vi.fn((url: string) => {
    const response = responses[url];
    if (!response) {
      throw new Error(`Unexpected fetch call: ${url}`);
    }

    return Promise.resolve(response);
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("playground.utils", () => {
  describe("loadPlaygroundFixtures", () => {
    it("should return parsed markdown and input data on success", async () => {
      // Arrange
      const fetchMock = createFetchMock({
        "/template-001.md": new Response("# Hello"),
        "/template-inputs.json": new Response(JSON.stringify({ foo: "bar" })),
      });
      vi.stubGlobal("fetch", fetchMock);
      const controller = new AbortController();

      // Act
      const fixtures = await loadPlaygroundFixtures(controller.signal);

      // Assert
      expect(fixtures).toEqual({ markdown: "# Hello", inputData: { foo: "bar" } });
      expect(fetchMock).toHaveBeenCalledWith("/template-001.md", { signal: controller.signal });
      expect(fetchMock).toHaveBeenCalledWith("/template-inputs.json", { signal: controller.signal });
    });

    it("should throw when the markdown fetch response is not ok", async () => {
      // Arrange
      const fetchMock = createFetchMock({
        "/template-001.md": new Response(null, { status: 404 }),
        "/template-inputs.json": new Response(JSON.stringify({})),
      });
      vi.stubGlobal("fetch", fetchMock);
      const controller = new AbortController();

      // Act & Assert
      await expect(loadPlaygroundFixtures(controller.signal)).rejects.toThrow("Failed to load /template-001.md: 404");
    });

    it("should throw when the input data fetch response is not ok", async () => {
      // Arrange
      const fetchMock = createFetchMock({
        "/template-001.md": new Response("# Hello"),
        "/template-inputs.json": new Response(null, { status: 500 }),
      });
      vi.stubGlobal("fetch", fetchMock);
      const controller = new AbortController();

      // Act & Assert
      await expect(loadPlaygroundFixtures(controller.signal)).rejects.toThrow(
        "Failed to load /template-inputs.json: 500"
      );
    });

    it("should throw with a cause when the input data is invalid JSON", async () => {
      // Arrange
      const fetchMock = createFetchMock({
        "/template-001.md": new Response("# Hello"),
        "/template-inputs.json": new Response("not json"),
      });
      vi.stubGlobal("fetch", fetchMock);
      const controller = new AbortController();

      // Act & Assert
      await expect(loadPlaygroundFixtures(controller.signal)).rejects.toThrow(/Invalid JSON:/);
    });
  });
});
