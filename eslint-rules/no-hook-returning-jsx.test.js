import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import noHookReturningJsx from "./no-hook-returning-jsx.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = noHookReturningJsx.rules["no-hook-returning-jsx"];
const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } } },
});

ruleTester.run("no-hook-returning-jsx", rule, {
  valid: ["const useFoo = () => ({ value: 1 });", "const Comp = () => <div />;"],
  invalid: [
    {
      code: "const useFoo = () => <div />;",
      errors: [{ messageId: "hookReturnsJsx", data: { name: "useFoo" } }],
    },
    {
      code: "function useBar() { return <div />; }",
      errors: [{ messageId: "hookReturnsJsx", data: { name: "useBar" } }],
    },
  ],
});
