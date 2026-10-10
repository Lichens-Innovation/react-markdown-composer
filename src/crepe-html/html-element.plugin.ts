import type { MilkdownPlugin } from "@milkdown/kit/ctx";
import type { NodeParserSpec, NodeSchema, NodeSerializerSpec } from "@milkdown/kit/transformer";
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

interface HtmlElementAttrs {
  tagName: string;
  htmlAttrs: Record<string, string>;
}

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

const readHtmlElementAttrs = (attrs: Record<string, unknown>): HtmlElementAttrs => ({
  tagName: typeof attrs.tagName === "string" ? attrs.tagName : "span",
  htmlAttrs: isStringRecord(attrs.htmlAttrs) ? attrs.htmlAttrs : {},
});

const htmlElementParseDOM: NodeSchema["parseDOM"] = [...ALLOWED_HTML_TAGS].map((tagName) => ({
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
}));

const htmlElementToDOM: NodeSchema["toDOM"] = (node) => {
  const { tagName, htmlAttrs } = readHtmlElementAttrs(node.attrs);
  const attrs = { ...sanitizeHtmlAttributes(htmlAttrs), [HTML_ELEMENT_DATA_ATTR]: tagName };

  if (VOID_HTML_TAGS.has(tagName)) {
    return [tagName, attrs];
  }

  return [tagName, attrs, 0];
};

const htmlElementParseMarkdown: NodeParserSpec = {
  match: (node) => node.type === HTML_ELEMENT_MDAST_TYPE,
  // eslint-disable-next-line @typescript-eslint/max-params -- Milkdown NodeParserSpec.runner is (state, node, type)
  runner: (state, node, type) => {
    state.openNode(type, readHtmlElementAttrs(node)).next(node.children).closeNode();
  },
};

const htmlElementToMarkdown: NodeSerializerSpec = {
  match: (node) => node.type.name === "htmlElement",
  runner: (state, node) => {
    const { tagName, htmlAttrs } = readHtmlElementAttrs(node.attrs);
    state.addNode("html", undefined, serializeHtmlOpenTag({ tagName, htmlAttrs }));

    if (VOID_HTML_TAGS.has(tagName)) {
      return;
    }

    state.next(node.content);
    state.addNode("html", undefined, `</${tagName}>`);
  },
};

const htmlElementSchema = $nodeSchema("htmlElement", () => ({
  inline: true,
  group: "inline",
  content: "inline*",
  attrs: {
    tagName: { default: "span" },
    htmlAttrs: { default: {} },
  },
  parseDOM: htmlElementParseDOM,
  toDOM: htmlElementToDOM,
  parseMarkdown: htmlElementParseMarkdown,
  toMarkdown: htmlElementToMarkdown,
}));

export const htmlElementPlugins: MilkdownPlugin[] = [remarkHtmlElements, htmlElementSchema].flat();
