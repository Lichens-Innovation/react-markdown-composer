export const HTML_MDAST_TYPE = "html";
export const HTML_ELEMENT_MDAST_TYPE = "htmlElement";
export const HTML_ELEMENT_DATA_ATTR = "data-html-element";

export const VOID_HTML_TAGS = new Set(["br", "img", "hr", "wbr"]);

export const ALLOWED_HTML_TAGS = new Set([
  "span",
  "mark",
  "small",
  "sub",
  "sup",
  "abbr",
  "kbd",
  "u",
  "s",
  "b",
  "i",
  "em",
  "strong",
  "br",
  "cite",
  "dfn",
  "var",
  "samp",
  "font",
]);

export const ALLOWED_HTML_ATTRIBUTES = new Set(["style", "class", "title", "id", "lang", "dir", "role", "color"]);

const DANGEROUS_STYLE_RE = /expression\s*\(|javascript:|url\s*\(|-moz-binding|behavior\s*:/i;

export const isDangerousCss = (value: string): boolean => DANGEROUS_STYLE_RE.test(value);
