import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import noInlineArrayChainInJsx from "./no-inline-array-chain-in-jsx.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = noInlineArrayChainInJsx.rules["no-inline-array-chain-in-jsx"];
const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } } },
});

ruleTester.run("no-inline-array-chain-in-jsx", rule, {
  valid: ["const Comp = () => <div>{items.map((item) => <Row key={item.id} {...item} />)}</div>;"],
  invalid: [
    {
      code: "const Comp = () => <div>{items.filter((i) => i.active).map((item) => <Row key={item.id} {...item} />)}</div>;",
      errors: [{ messageId: "precompute", data: { count: "2" } }],
    },
  ],
});
