import type { MilkdownPlugin } from "@milkdown/kit/ctx";
import { $nodeSchema, $remark } from "@milkdown/kit/utils";

import {
  ALLOWED_HTML_TAGS,
  HTML_ELEMENT_DATA_ATTR,
  HTML_ELEMENT_MDAST_TYPE,
  VOID_HTML_TAGS,
} from "./html-element.constants";
import {
  isStringRecord,
  sanitizeHtmlAttributes,
  serializeHtmlOpenTag,
  wrapHtmlElementsInTree,
} from "./html-element.utils";

const collectDomAttributes = (element: HTMLElement): Record<string, string> => {
  const htmlAttrs: Record<string, string> = {};

  for (const attribute of element.attributes) {
    if (attribute.name === HTML_ELEMENT_DATA_ATTR) {
      continue;
    }

    htmlAttrs[attribute.name] = attribute.value;
  }

  return sanitizeHtmlAttributes(htmlAttrs);
};

const remarkHtmlElements = $remark("remarkHtmlElements", () => () => wrapHtmlElementsInTree);

const htmlElementSchema = $nodeSchema("htmlElement", () => ({
  inline: true,
  group: "inline",
  content: "inline*",
  attrs: {
    tagName: { default: "span" },
    htmlAttrs: { default: {} },
  },
  parseDOM: [...ALLOWED_HTML_TAGS].map((tagName) => ({
    tag: `${tagName}[${HTML_ELEMENT_DATA_ATTR}]`,
    getAttrs: (dom: Node | string) => {
      if (!(dom instanceof HTMLElement)) {
        return false;
      }

      return {
        tagName,
        htmlAttrs: collectDomAttributes(dom),
      };
    },
  })),
  toDOM: (node) => {
    const tagName = typeof node.attrs.tagName === "string" ? node.attrs.tagName : "span";
    const htmlAttrs = isStringRecord(node.attrs.htmlAttrs) ? sanitizeHtmlAttributes(node.attrs.htmlAttrs) : {};
    const attrs = { ...htmlAttrs, [HTML_ELEMENT_DATA_ATTR]: tagName };

    if (VOID_HTML_TAGS.has(tagName)) {
      return [tagName, attrs];
    }

    return [tagName, attrs, 0];
  },
  parseMarkdown: {
    match: (node) => node.type === HTML_ELEMENT_MDAST_TYPE,
    // eslint-disable-next-line @typescript-eslint/max-params -- Milkdown NodeParserSpec.runner is (state, node, type)
    runner: (state, node, type) => {
      const tagName = typeof node.tagName === "string" ? node.tagName : "span";
      const htmlAttrs = isStringRecord(node.htmlAttrs) ? node.htmlAttrs : {};
      state.openNode(type, { tagName, htmlAttrs }).next(node.children).closeNode();
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === "htmlElement",
    runner: (state, node) => {
      const tagName = typeof node.attrs.tagName === "string" ? node.attrs.tagName : "span";
      const htmlAttrs = isStringRecord(node.attrs.htmlAttrs) ? node.attrs.htmlAttrs : {};
      state.addNode("html", undefined, serializeHtmlOpenTag({ tagName, htmlAttrs }));

      if (VOID_HTML_TAGS.has(tagName)) {
        return;
      }

      state.next(node.content);
      state.addNode("html", undefined, `</${tagName}>`);
    },
  },
}));

export const htmlElementPlugins: MilkdownPlugin[] = [remarkHtmlElements, htmlElementSchema].flat();
