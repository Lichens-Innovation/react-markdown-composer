import {
  ALLOWED_HTML_ATTRIBUTES,
  ALLOWED_HTML_TAGS,
  HTML_ELEMENT_MDAST_TYPE,
  HTML_MDAST_TYPE,
  VOID_HTML_TAGS,
  isDangerousCss,
} from "./html-element.constants";
import type { HtmlMdastNode, ParsedHtmlTag } from "./html-element.types";

const HTML_TAG_RE = /^<\/?([A-Za-z][\w:-]*)\b([^>]*)>$/;
const HTML_ATTRIBUTE_RE = /([^\s"'=<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

interface CreateHtmlElementNodeArgs {
  tagName: string;
  htmlAttrs: Record<string, string>;
  // eslint-disable-next-line coding-guide/prefer-props-with-children -- mdast field, not React children
  children: HtmlMdastNode[];
}

interface FindMatchingCloseIndexArgs {
  nodes: HtmlMdastNode[];
  startIndex: number;
  tagName: string;
}

interface SerializeHtmlOpenTagArgs {
  tagName: string;
  htmlAttrs: Record<string, string>;
}

const isAllowedHtmlTag = (tagName: string): boolean => ALLOWED_HTML_TAGS.has(tagName);

export const isStringRecord = (value: unknown): value is Record<string, string> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === "string");
};

const parseHtmlAttributes = (attrString: string): Record<string, string> => {
  const attributes: Record<string, string> = {};

  for (const match of attrString.matchAll(HTML_ATTRIBUTE_RE)) {
    const name = match[1]?.toLowerCase();
    if (!name) {
      continue;
    }

    attributes[name] = match[2] ?? match[3] ?? match[4] ?? "";
  }

  return attributes;
};

export const parseHtmlTag = (value: string): ParsedHtmlTag | undefined => {
  const trimmed = value.trim();
  const match = HTML_TAG_RE.exec(trimmed);
  if (!match) {
    return undefined;
  }

  const tagName = match[1]?.toLowerCase();
  if (!tagName) {
    return undefined;
  }

  const rawAttributes = (match[2] ?? "").replace(/\/\s*$/, "").trim();
  const isClosing = trimmed.startsWith("</");
  const isSelfClosing = trimmed.endsWith("/>") || VOID_HTML_TAGS.has(tagName);

  return {
    tagName,
    attributes: parseHtmlAttributes(rawAttributes),
    isClosing,
    isSelfClosing,
  };
};

const isAllowedAttributeName = (name: string): boolean => {
  if (name.startsWith("on")) {
    return false;
  }

  if (name.startsWith("aria-")) {
    return true;
  }

  return ALLOWED_HTML_ATTRIBUTES.has(name);
};

export const sanitizeHtmlAttributes = (attributes: Record<string, string>): Record<string, string> => {
  const sanitized: Record<string, string> = {};

  for (const [name, value] of Object.entries(attributes)) {
    const attributeName = name.toLowerCase();
    if (!isAllowedAttributeName(attributeName)) {
      continue;
    }

    if (attributeName === "style" && isDangerousCss(value)) {
      continue;
    }

    sanitized[attributeName] = value;
  }

  return sanitized;
};

export const serializeHtmlOpenTag = ({ tagName, htmlAttrs }: SerializeHtmlOpenTagArgs): string => {
  const attrString = Object.entries(htmlAttrs)
    .map(([name, value]) => ` ${name}="${value.replaceAll('"', "&quot;")}"`)
    .join("");

  return `<${tagName}${attrString}>`;
};

const createHtmlElementNode = ({ tagName, htmlAttrs, children }: CreateHtmlElementNodeArgs): HtmlMdastNode => ({
  type: HTML_ELEMENT_MDAST_TYPE,
  tagName,
  htmlAttrs,
  children,
});

interface GetCloseDepthDeltaArgs {
  node: HtmlMdastNode;
  tagName: string;
}

const getCloseDepthDelta = ({ node, tagName }: GetCloseDepthDeltaArgs): number | undefined => {
  if (node.type !== HTML_MDAST_TYPE || typeof node.value !== "string") {
    return undefined;
  }

  const parsedTag = parseHtmlTag(node.value);
  if (!parsedTag || parsedTag.tagName !== tagName) {
    return undefined;
  }

  if (parsedTag.isClosing) {
    return -1;
  }

  if (parsedTag.isSelfClosing) {
    return 0;
  }

  return 1;
};

const findMatchingCloseIndex = ({ nodes, startIndex, tagName }: FindMatchingCloseIndexArgs): number | undefined => {
  let depth = 1;

  for (let index = startIndex; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (!node) {
      continue;
    }

    const depthDelta = getCloseDepthDelta({ node, tagName });
    if (depthDelta === undefined) {
      continue;
    }

    depth += depthDelta;
    if (depth === 0) {
      return index;
    }
  }

  return undefined;
};

const pairHtmlElements = (nodes: HtmlMdastNode[]): HtmlMdastNode[] => {
  const result: HtmlMdastNode[] = [];
  let index = 0;

  while (index < nodes.length) {
    const node = nodes[index];
    if (!node) {
      index += 1;
      continue;
    }

    if (node.type !== HTML_MDAST_TYPE || typeof node.value !== "string") {
      result.push(node);
      index += 1;
      continue;
    }

    const parsedTag = parseHtmlTag(node.value);
    if (!parsedTag || parsedTag.isClosing || !isAllowedHtmlTag(parsedTag.tagName)) {
      result.push(node);
      index += 1;
      continue;
    }

    const htmlAttrs = sanitizeHtmlAttributes(parsedTag.attributes);

    if (parsedTag.isSelfClosing) {
      result.push(createHtmlElementNode({ tagName: parsedTag.tagName, htmlAttrs, children: [] }));
      index += 1;
      continue;
    }

    const closeIndex = findMatchingCloseIndex({ nodes, startIndex: index + 1, tagName: parsedTag.tagName });
    if (closeIndex === undefined) {
      result.push(node);
      index += 1;
      continue;
    }

    result.push(
      createHtmlElementNode({
        tagName: parsedTag.tagName,
        htmlAttrs,
        children: pairHtmlElements(nodes.slice(index + 1, closeIndex)),
      })
    );
    index = closeIndex + 1;
  }

  return result;
};

export const wrapHtmlElementsInTree = (node: HtmlMdastNode): void => {
  if (!node.children) {
    return;
  }

  for (const child of node.children) {
    wrapHtmlElementsInTree(child);
  }

  node.children = pairHtmlElements(node.children);
};
