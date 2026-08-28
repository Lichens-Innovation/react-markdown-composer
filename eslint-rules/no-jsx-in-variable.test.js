import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import noJsxInVariable from "./no-jsx-in-variable.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = noJsxInVariable.rules["no-jsx-in-variable"];
const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } } },
});

ruleTester.run("no-jsx-in-variable", rule, {
  valid: ["const Comp = () => <div />;", "const label = 'text';"],
  invalid: [
    {
      code: "const Comp = () => { const labelNode = <span>hi</span>; return <div>{labelNode}</div>; };",
      errors: [{ messageId: "declareComponent" }],
    },
    {
      code: "const frag = <>hi</>;",
      errors: [{ messageId: "declareComponent" }],
    },
  ],
});
