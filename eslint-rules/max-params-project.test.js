import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import maxParamsProject from "./max-params-project.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = maxParamsProject.rules["max-params"];
const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run("max-params", rule, {
  valid: [
    "const fn = (a) => a;",
    { code: "const fn = (a, b) => a + b;", options: [2] },
    "[1, 2].map((item, index) => item + index);",
    "const Comp = () => <Foo onChange={(event, index) => {}} />;",
    "const stateCreator = (set, get) => ({});\ncreate(stateCreator);",
  ],
  invalid: [
    {
      code: "function foo(a, b) {}",
      errors: [{ messageId: "exceed", data: { name: "Function 'foo'", count: "2", max: "1" } }],
    },
    {
      code: "const obj = { bar(a, b) {} };",
      errors: [{ messageId: "exceed", data: { name: "Method 'bar'", count: "2", max: "1" } }],
    },
    {
      code: "function foo(a, b, c, d) {}",
      options: [3],
      errors: [{ messageId: "exceed", data: { name: "Function 'foo'", count: "4", max: "3" } }],
    },
  ],
});
