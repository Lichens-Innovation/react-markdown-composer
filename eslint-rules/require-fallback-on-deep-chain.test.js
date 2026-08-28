import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import requireFallbackOnDeepChain from "./require-fallback-on-deep-chain.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = requireFallbackOnDeepChain.rules["require-fallback-on-deep-chain"];
const ruleTester = new RuleTester();

ruleTester.run("require-fallback-on-deep-chain", rule, {
  valid: ["a?.b?.c;", 'a?.b?.c?.d ?? "NA";', { code: "a?.b?.c;", options: [{ minDepth: 4 }] }],
  invalid: [
    {
      code: "a?.b?.c?.d;",
      errors: [{ messageId: "requireFallback", data: { depth: "3" } }],
    },
    {
      code: 'const city = a?.b?.c?.d ?? "NA"; const other = a?.b?.c?.d;',
      errors: [{ messageId: "requireFallback", data: { depth: "3" } }],
    },
  ],
});
