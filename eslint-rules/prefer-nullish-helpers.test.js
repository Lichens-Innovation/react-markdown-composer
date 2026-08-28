import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import preferNullishHelpers from "./prefer-nullish-helpers.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = preferNullishHelpers.rules["prefer-nullish-helpers"];
const ruleTester = new RuleTester();

ruleTester.run("prefer-nullish-helpers", rule, {
  valid: ["value !== null && other !== undefined;", "value !== null;", 'value === "";'],
  invalid: [
    {
      code: "value !== null && value !== undefined;",
      errors: [{ messageId: "preferNotNullish", data: { expr: "value" } }],
    },
    {
      code: "value === null || value === undefined;",
      errors: [{ messageId: "preferNullish", data: { expr: "value" } }],
    },
  ],
});
