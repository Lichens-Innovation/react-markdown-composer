export interface HtmlMdastNode {
  type: string;
  value?: string;
  // eslint-disable-next-line coding-guide/prefer-props-with-children -- mdast field, not React children
  children?: HtmlMdastNode[];
  tagName?: string;
  htmlAttrs?: Record<string, string>;
}

export interface ParsedHtmlTag {
  tagName: string;
  attributes: Record<string, string>;
  isClosing: boolean;
  isSelfClosing: boolean;
}
