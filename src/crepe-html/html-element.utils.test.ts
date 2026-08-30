import { describe, expect, it } from "vitest";

import { HTML_ELEMENT_MDAST_TYPE } from "./html-element.constants";
import type { HtmlMdastNode } from "./html-element.types";
import {
  isStringRecord,
  parseHtmlTag,
  sanitizeHtmlAttributes,
  serializeHtmlOpenTag,
  wrapHtmlElementsInTree,
} from "./html-element.utils";

describe("html-element.utils", () => {
  describe("isStringRecord", () => {
    it.each([
      { value: { a: "1", b: "2" }, expected: true },
      { value: {}, expected: true },
      { value: { a: 1 }, expected: false },
      { value: null, expected: false },
      { value: ["a", "b"], expected: false },
      { value: "not an object", expected: false },
      { value: 42, expected: false },
      { value: undefined, expected: false },
    ])("should return $expected for $value", ({ value, expected }) => {
      // Arrange & Act
      const result = isStringRecord(value);

      // Assert
      expect(result).toBe(expected);
    });
  });

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

    it("should parse a tag with no attributes", () => {
      // Arrange
      const value = "<strong>";

      // Act
      const parsedTag = parseHtmlTag(value);

      // Assert
      expect(parsedTag).toEqual({
        tagName: "strong",
        attributes: {},
        isClosing: false,
        isSelfClosing: false,
      });
    });

    it("should normalize uppercase tag names to lowercase", () => {
      // Arrange
      const value = "<SPAN>";

      // Act
      const parsedTag = parseHtmlTag(value);

      // Assert
      expect(parsedTag).toMatchObject({ tagName: "span" });
    });

    it("should treat a void tag without a trailing slash as self-closing", () => {
      // Arrange
      const value = "<br>";

      // Act
      const parsedTag = parseHtmlTag(value);

      // Assert
      expect(parsedTag).toMatchObject({ isSelfClosing: true });
    });

    it("should return undefined for a non-matching value", () => {
      // Arrange
      const value = "not a tag";

      // Act
      const parsedTag = parseHtmlTag(value);

      // Assert
      expect(parsedTag).toBeUndefined();
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

    it("should keep aria-* attributes even when not in the allow-list", () => {
      // Arrange
      const attributes = { "aria-label": "Close", "aria-hidden": "true" };

      // Act
      const sanitized = sanitizeHtmlAttributes(attributes);

      // Assert
      expect(sanitized).toEqual({ "aria-label": "Close", "aria-hidden": "true" });
    });

    it("should drop attribute names not in the allow-list", () => {
      // Arrange
      const attributes = { "data-custom": "value", class: "ok" };

      // Act
      const sanitized = sanitizeHtmlAttributes(attributes);

      // Assert
      expect(sanitized).toEqual({ class: "ok" });
    });

    it("should normalize attribute names to lowercase", () => {
      // Arrange
      const attributes = { CLASS: "ok" };

      // Act
      const sanitized = sanitizeHtmlAttributes(attributes);

      // Assert
      expect(sanitized).toEqual({ class: "ok" });
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

    it("should serialize a tag with no attributes", () => {
      // Arrange
      const args = { tagName: "br", htmlAttrs: {} };

      // Act
      const openTag = serializeHtmlOpenTag(args);

      // Assert
      expect(openTag).toBe("<br>");
    });

    it("should serialize multiple attributes in insertion order", () => {
      // Arrange
      const args = { tagName: "span", htmlAttrs: { style: "color:red", class: "ok" } };

      // Act
      const openTag = serializeHtmlOpenTag(args);

      // Assert
      expect(openTag).toBe('<span style="color:red" class="ok">');
    });

    it("should escape double quotes in attribute values", () => {
      // Arrange
      const args = { tagName: "span", htmlAttrs: { title: 'say "hi"' } };

      // Act
      const openTag = serializeHtmlOpenTag(args);

      // Assert
      expect(openTag).toBe('<span title="say &quot;hi&quot;">');
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
          { type: "html", value: "<script>alert(1)</script>" },
        ],
      };

      // Act
      wrapHtmlElementsInTree(tree);

      // Assert
      expect(tree.children).toEqual([
        { type: "html", value: '<span style="color:red">' },
        { type: "text", value: "open" },
        { type: "html", value: "<script>alert(1)</script>" },
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

    it("should leave an opening tag raw when no matching close tag is found", () => {
      // Arrange
      const tree: HtmlMdastNode = {
        type: "paragraph",
        children: [
          { type: "html", value: "<span>" },
          { type: "text", value: "open" },
        ],
      };

      // Act
      wrapHtmlElementsInTree(tree);

      // Assert
      expect(tree.children).toEqual([
        { type: "html", value: "<span>" },
        { type: "text", value: "open" },
      ]);
    });

    it("should do nothing when the node has no children array", () => {
      // Arrange
      const tree: HtmlMdastNode = { type: "text", value: "leaf" };

      // Act
      wrapHtmlElementsInTree(tree);

      // Assert
      expect(tree).toEqual({ type: "text", value: "leaf" });
    });
  });
});
