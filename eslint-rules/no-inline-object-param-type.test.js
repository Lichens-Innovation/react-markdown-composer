import { RuleTester } from "eslint";
import { parser as tsParser } from "typescript-eslint";
import { describe, it } from "vitest";
import noInlineObjectParamType from "./no-inline-object-param-type.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = noInlineObjectParamType.rules["no-inline-object-param-type"];
const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module", parser: tsParser },
});

ruleTester.run("no-inline-object-param-type", rule, {
  valid: ["interface FooArgs { a: string; }\nconst foo = ({ a }: FooArgs) => a;", "const foo = (a: string) => a;"],
  invalid: [
    {
      code: "const foo = ({ a, b }: { a: string; b: number }) => a;",
      errors: [{ messageId: "extractInterface" }],
    },
    {
      code: "function foo(props: { a: string }) {}",
      errors: [{ messageId: "extractInterface" }],
    },
  ],
});
