import { describe, expect, it } from "vitest";

import { HTML_ELEMENT_MDAST_TYPE } from "./html-element.constants";
import type { HtmlMdastNode } from "./html-element.types";
import {
  parseHtmlTag,
  sanitizeHtmlAttributes,
  serializeHtmlOpenTag,
  wrapHtmlElementsInTree,
} from "./html-element.utils";

describe("parseHtmlTag", () => {
  it("should parse an opening span with a style attribute", () => {
    // Arrange
    const value = '<span style="color:#43A047">';

    // Act
    const parsedTag = parseHtmlTag(value);

    // Assert
    expect(parsedTag).toEqual({
      tagName: "span",
      attributes: { style: "color:#43A047" },
      isClosing: false,
      isSelfClosing: false,
    });
  });

  it("should parse a closing tag", () => {
    // Arrange
    const value = "</span>";

    // Act
    const parsedTag = parseHtmlTag(value);

    // Assert
    expect(parsedTag).toMatchObject({ tagName: "span", isClosing: true, isSelfClosing: false });
  });

  it("should parse a self-closing br", () => {
    // Arrange
    const value = "<br/>";

    // Act
    const parsedTag = parseHtmlTag(value);

    // Assert
    expect(parsedTag).toMatchObject({ tagName: "br", isClosing: false, isSelfClosing: true });
  });
});

describe("sanitizeHtmlAttributes", () => {
  it("should drop event handlers and keep style", () => {
    // Arrange
    const attributes = { style: "color:#43A047", onclick: "alert(1)", class: "ok" };

    // Act
    const sanitized = sanitizeHtmlAttributes(attributes);

    // Assert
    expect(sanitized).toEqual({ style: "color:#43A047", class: "ok" });
  });

  it("should drop dangerous css in style", () => {
    // Arrange
    const attributes = { style: "color:red; url(javascript:alert(1))" };

    // Act
    const sanitized = sanitizeHtmlAttributes(attributes);

    // Assert
    expect(sanitized).toEqual({});
  });
});

describe("serializeHtmlOpenTag", () => {
  it("should serialize tag name and attributes", () => {
    // Arrange
    const args = { tagName: "span", htmlAttrs: { style: "color:#43A047" } };

    // Act
    const openTag = serializeHtmlOpenTag(args);

    // Assert
    expect(openTag).toBe('<span style="color:#43A047">');
  });
});

describe("wrapHtmlElementsInTree", () => {
  it("should wrap markdown inside a colored span", () => {
    // Arrange
    const tree: HtmlMdastNode = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "html", value: '<span style="color:#43A047">' },
            { type: "strong", children: [{ type: "text", value: "Conforme" }] },
            { type: "html", value: "</span>" },
          ],
        },
      ],
    };

    // Act
    wrapHtmlElementsInTree(tree);

    // Assert
    expect(tree.children?.[0]?.children).toEqual([
      {
        type: HTML_ELEMENT_MDAST_TYPE,
        tagName: "span",
        htmlAttrs: { style: "color:#43A047" },
        children: [{ type: "strong", children: [{ type: "text", value: "Conforme" }] }],
      },
    ]);
  });

  it("should wrap nested html tags at the same level", () => {
    // Arrange
    const tree: HtmlMdastNode = {
      type: "tableCell",
      children: [
        { type: "html", value: '<span style="color:#E53935">' },
        { type: "html", value: "<strong>" },
        { type: "text", value: "Non-conforme" },
        { type: "html", value: "</strong>" },
        { type: "html", value: "</span>" },
      ],
    };

    // Act
    wrapHtmlElementsInTree(tree);

    // Assert
    expect(tree.children).toEqual([
      {
        type: HTML_ELEMENT_MDAST_TYPE,
        tagName: "span",
        htmlAttrs: { style: "color:#E53935" },
        children: [
          {
            type: HTML_ELEMENT_MDAST_TYPE,
            tagName: "strong",
            htmlAttrs: {},
            children: [{ type: "text", value: "Non-conforme" }],
          },
        ],
      },
    ]);
  });

  it("should leave unmatched and disallowed tags as raw html", () => {
    // Arrange
    const tree: HtmlMdastNode = {
      type: "paragraph",
      children: [
        { type: "html", value: '<span style="color:red">' },
        { type: "text", value: "open" },
        { type: "html", value: '<script>alert(1)</script>' },
      ],
    };

    // Act
    wrapHtmlElementsInTree(tree);

    // Assert
    expect(tree.children).toEqual([
      { type: "html", value: '<span style="color:red">' },
      { type: "text", value: "open" },
      { type: "html", value: '<script>alert(1)</script>' },
    ]);
  });

  it("should turn a void br into an html element", () => {
    // Arrange
    const tree: HtmlMdastNode = {
      type: "paragraph",
      children: [
        { type: "text", value: "a" },
        { type: "html", value: "<br>" },
        { type: "text", value: "b" },
      ],
    };

    // Act
    wrapHtmlElementsInTree(tree);

    // Assert
    expect(tree.children).toEqual([
      { type: "text", value: "a" },
      { type: HTML_ELEMENT_MDAST_TYPE, tagName: "br", htmlAttrs: {}, children: [] },
      { type: "text", value: "b" },
    ]);
  });
});
