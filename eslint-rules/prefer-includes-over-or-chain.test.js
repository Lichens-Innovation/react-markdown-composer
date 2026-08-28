import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import preferIncludesOverOrChain from "./prefer-includes-over-or-chain.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = preferIncludesOverOrChain.rules["prefer-includes-over-or-chain"];
const ruleTester = new RuleTester();

ruleTester.run("prefer-includes-over-or-chain", rule, {
  valid: ['["a", "b", "c"].includes(x);', 'x === "a" || y === "b";'],
  invalid: [
    {
      code: 'x === "a" || x === "b" || x === "c";',
      output: '["a", "b", "c"].includes(x);',
      errors: [{ messageId: "preferIncludes" }],
    },
    {
      code: 'x === "a" || x === "b";',
      output: '["a", "b"].includes(x);',
      errors: [{ messageId: "preferIncludes" }],
    },
  ],
});
