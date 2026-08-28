import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import preferPositiveCondition from "./prefer-positive-condition.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = preferPositiveCondition.rules["prefer-positive-condition"];
const ruleTester = new RuleTester();

ruleTester.run("prefer-positive-condition", rule, {
  valid: ["isReady ? a : b;", "cond ? doA() : doB();"],
  invalid: [
    {
      code: "!isReady ? a : b;",
      output: "isReady ? b : a;",
      errors: [{ messageId: "preferPositive" }],
    },
    {
      code: "!isNullish(value) ? map(value) : fallback;",
      output: "isNullish(value) ? fallback : map(value);",
      errors: [{ messageId: "preferPositive" }],
    },
  ],
});
