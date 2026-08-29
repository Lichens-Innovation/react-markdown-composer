import Handlebars from "handlebars";

import type { RenderTemplate, TranslateTemplate } from "../markdown-composer.types";
import { markdownImagesTableHelper } from "./markdown-images-table.helper";

const isHelperOptions = (value: unknown): value is Handlebars.HelperOptions => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("hash" in value)) {
    return false;
  }

  if (!("data" in value)) {
    return false;
  }

  return true;
};

export const concatHelper = (...args: unknown[]): string => args.slice(0, -1).join("");

export const eqHelper = (left: unknown, right: unknown): boolean => left === right;

interface TypedItem {
  type?: unknown;
}

export const hasTypeHelper = (items: unknown, type: unknown): boolean => {
  if (!Array.isArray(items)) {
    return false;
  }

  return items.some((item) => (item as TypedItem | null)?.type === type);
};

export const simpleMapper = (key: string, mapper: Record<string, string> = {}): string => {
  if (typeof key !== "string" || isHelperOptions(mapper)) {
    return "";
  }

  return mapper[key] ?? "";
};

const DEFAULT_TRANSTATOR: TranslateTemplate = (key) => key;

export interface RegisterHandlebarsHelpersArgs {
  handlebars: typeof Handlebars;
  translate?: TranslateTemplate;
}

export const registerHandlebarsHelpers = ({ handlebars, translate }: RegisterHandlebarsHelpersArgs): void => {
  handlebars.registerHelper("statusColor", simpleMapper);
  handlebars.registerHelper("concat", concatHelper);
  handlebars.registerHelper("eq", eqHelper);
  handlebars.registerHelper("hasType", hasTypeHelper);
  handlebars.registerHelper("t", translate ?? DEFAULT_TRANSTATOR);
  handlebars.registerHelper("markdownImagesTable", markdownImagesTableHelper);
};

export interface CreateHandlebarsRendererArgs {
  translate?: TranslateTemplate;
}

const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g;

export const cleanTemplate = (template: string): string => template.replace(HTML_COMMENT_PATTERN, "");

export const createHandlebarsRenderer = ({ translate }: CreateHandlebarsRendererArgs = {}): RenderTemplate => {
  const handlebars = Handlebars.create();
  registerHandlebarsHelpers({ handlebars, translate });

  return ({ template, data }) => {
    const cleanedTemplate: string = cleanTemplate(template);
    const compiled = handlebars.compile(cleanedTemplate, { noEscape: true });
    return compiled(data);
  };
};
