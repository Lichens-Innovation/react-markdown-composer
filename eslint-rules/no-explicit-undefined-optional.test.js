import { RuleTester } from "eslint";
import { parser as tsParser } from "typescript-eslint";
import { describe, it } from "vitest";
import noExplicitUndefinedOptional from "./no-explicit-undefined-optional.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = noExplicitUndefinedOptional.rules["no-explicit-undefined-optional"];
const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    parser: tsParser,
  },
});

ruleTester.run("no-explicit-undefined-optional", rule, {
  valid: [
    "function f(a?: string) {}",
    "function f(a: string) {}",
    "interface Foo { a: string; }",
    "function f(a: string | number) {}",
    "let a: string | undefined;", // variable types have no `?` equivalent, left untouched
    "function f(): string | undefined { return undefined; }", // return types have no `?` equivalent
  ],
  invalid: [
    {
      code: "function f(a: string | undefined) {}",
      output: "function f(a?: string) {}",
      errors: [{ messageId: "useOptionalModifier" }],
    },
    {
      code: "function f(a?: string | undefined) {}",
      output: "function f(a?: string) {}",
      errors: [{ messageId: "redundantUndefined" }],
    },
    {
      code: "interface Foo { a: string | undefined; }",
      output: "interface Foo { a?: string; }",
      errors: [{ messageId: "useOptionalModifier" }],
    },
    {
      code: "class C { a: string | undefined; }",
      output: "class C { a?: string; }",
      errors: [{ messageId: "useOptionalModifier" }],
    },
    {
      code: "function f(a: string | number | undefined) {}",
      errors: [{ messageId: "useOptionalModifier" }],
    },
  ],
});
