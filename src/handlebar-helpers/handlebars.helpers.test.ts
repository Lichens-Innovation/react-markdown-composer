import Handlebars from "handlebars";
import { describe, expect, it, vi } from "vitest";

import {
  cleanTemplate,
  createHandlebarsRenderer,
  eqHelper,
  registerHandlebarsHelpers,
  simpleMapper,
} from "./handlebars.helpers";

describe("cleanTemplate", () => {
  it("should strip HTML comments from the template", () => {
    // Arrange
    const template = `<!-- template principal : en-tête -->
| Info | Valeur |
|---|---|
{{formData.text1}}`;

    // Act
    const result = cleanTemplate(template);

    // Assert
    expect(result).toBe(`
| Info | Valeur |
|---|---|
{{formData.text1}}`);
  });

  it("should strip every HTML comment including multiline ones", () => {
    // Arrange
    const template = `<!-- inline: row -->
{{> row}}
<!-- inline: row END -->
<!--keep-->
kept
<!--/keep-->
<!--
  multiline
-->
{{title}}`;

    // Act
    const result = cleanTemplate(template);

    // Assert
    expect(result).toBe(`
{{> row}}


kept


{{title}}`);
  });
});

describe("createHandlebarsRenderer", () => {
  it("should join concat arguments excluding helper options", () => {
    // Arrange
    const render = createHandlebarsRenderer();

    // Act
    const result = render({ template: '{{concat "a" "." "b"}}', data: {} });

    // Assert
    expect(result).toBe("a.b");
  });

  it("should compare values with eq", () => {
    // Arrange
    const render = createHandlebarsRenderer();
    const template = '{{#if (eq type "STATUS")}}yes{{else}}no{{/if}}';

    // Act
    const matched = render({ template, data: { type: "STATUS" } });
    const missed = render({ template, data: { type: "TEXT" } });

    // Assert
    expect(matched).toBe("yes");
    expect(missed).toBe("no");
  });

  it("should detect matching item types with hasType", () => {
    // Arrange
    const render = createHandlebarsRenderer();
    const template = '{{#if (hasType fields "STATUS")}}has-status{{else}}none{{/if}}';

    // Act
    const matched = render({
      template,
      data: {
        fields: [{ type: "TEXT" }, { type: "STATUS" }],
      },
    });
    const missed = render({ template, data: { fields: [{ type: "TEXT" }] } });

    // Assert
    expect(matched).toBe("has-status");
    expect(missed).toBe("none");
  });

  it("should resolve statusColor from the map argument", () => {
    // Arrange
    const render = createHandlebarsRenderer();
    const statusColors = { compliant: "#43A047", other: "#000" };

    // Act
    const known = render({
      template: "{{statusColor rawStatus statusColors}}",
      data: {
        rawStatus: "compliant",
        statusColors,
      },
    });
    const unknown = render({
      template: "{{statusColor rawStatus statusColors}}",
      data: {
        rawStatus: "missing",
        statusColors,
      },
    });

    // Assert
    expect(known).toBe("#43A047");
    expect(unknown).toBe("");
  });

  it("should register translate as the t helper", () => {
    // Arrange
    const translate = vi.fn((key: string) => `translated:${key}`);
    const render = createHandlebarsRenderer({ translate });

    // Act
    const result = render({ template: '{{t "configuration.statusOptions.compliant"}}', data: {} });

    // Assert
    expect(result).toBe("translated:configuration.statusOptions.compliant");
    expect(translate).toHaveBeenCalledWith("configuration.statusOptions.compliant", expect.any(Object));
  });

  it("should build markdownImagesTable ordered by UUID list", () => {
    // Arrange
    const render = createHandlebarsRenderer();
    const template = "{{{markdownImagesTable objects printableImages columns=2}}}";
    const data = {
      objects: ["b", "missing", "a"],
      printableImages: {
        a: { filename: "a.jpg", imageDataURI: "data:a" },
        b: { filename: "b|pipe.jpg", imageDataURI: "data:b" },
      },
    };

    // Act
    const result = render({ template, data });

    // Assert
    expect(result).toContain("| 1 | 2 |");
    expect(result).toContain("![b\\|pipe.jpg](data:b)");
    expect(result).toContain("![a.jpg](data:a)");
    expect(result).not.toContain("missing");
  });

  it("should render after stripping HTML comments from the template", () => {
    // Arrange
    const render = createHandlebarsRenderer();
    const template = `<!-- template principal : en-tête -->
Hello {{name}}
<!--keep-->`;

    // Act
    const result = render({ template, data: { name: "Ada" } });

    // Assert
    expect(result).toBe("\nHello Ada\n");
  });

  it("should format an ISO date with the default format when no format arg is given", () => {
    // Arrange
    const render = createHandlebarsRenderer();

    // Act
    const result = render({ template: "{{formatDate date}}", data: { date: "2024-01-15T10:30:00" } });

    // Assert
    expect(result).toBe("2024-01-15 10:30");
  });

  it("should format an ISO date with a custom date-fns format string", () => {
    // Arrange
    const render = createHandlebarsRenderer();

    // Act
    const result = render({
      template: '{{formatDate date "dd/MM/yyyy"}}',
      data: { date: "2024-01-15T10:30:00" },
    });

    // Assert
    expect(result).toBe("15/01/2024");
  });

  it("should return empty string when formatDate is given a blank date", () => {
    // Arrange
    const render = createHandlebarsRenderer();

    // Act
    const result = render({ template: "{{formatDate missingDate}}", data: {} });

    // Assert
    expect(result).toBe("");
  });

  it("should return empty string when markdownImagesTable has no images", () => {
    // Arrange
    const render = createHandlebarsRenderer();

    // Act
    const result = render({
      template: "{{{markdownImagesTable objects printableImages}}}",
      data: { objects: ["x"], printableImages: {} },
    });

    // Assert
    expect(result).toBe("");
  });
});

describe("registerHandlebarsHelpers", () => {
  it("should register helpers on a custom Handlebars instance for composition", () => {
    // Arrange
    const handlebars = Handlebars.create();
    registerHandlebarsHelpers({ handlebars });
    handlebars.registerHelper("shout", (value: string) => String(value).toUpperCase());

    // Act
    const result = handlebars.compile('{{statusColor "ok" statusColors}}-{{shout name}}-{{eq a b}}', {
      noEscape: true,
    })({
      name: "ada",
      a: 1,
      b: 1,
      statusColors: { ok: "#0f0" },
    });

    // Assert
    expect(result).toBe("#0f0-ADA-true");
  });
});

describe("exported helpers", () => {
  it("should resolve a status from a color map argument", () => {
    // Arrange & Act
    const color = simpleMapper("ok", { ok: "#0f0" });

    // Assert
    expect(color).toBe("#0f0");
  });

  it("should let consumers pick helpers for selective registration", () => {
    // Arrange
    const handlebars = Handlebars.create();
    handlebars.registerHelper("eq", eqHelper);
    handlebars.registerHelper("statusColor", simpleMapper);

    // Act
    const result = handlebars.compile('{{#if (eq status "ok")}}{{statusColor status statusColors}}{{/if}}', {
      noEscape: true,
    })({ status: "ok", statusColors: { ok: "#0f0" } });

    // Assert
    expect(result).toBe("#0f0");
  });
});
