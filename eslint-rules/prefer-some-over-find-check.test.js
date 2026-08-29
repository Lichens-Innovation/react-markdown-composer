import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import preferSomeOverFindCheck from "./prefer-some-over-find-check.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = preferSomeOverFindCheck.rules["prefer-some-over-find-check"];
const ruleTester = new RuleTester();

ruleTester.run("prefer-some-over-find-check", rule, {
  valid: ["arr.some((x) => x.id === id);", "const found = arr.find((x) => x.id === id);"],
  invalid: [
    {
      code: "arr.find((x) => x.id === id) !== undefined;",
      output: "arr.some((x) => x.id === id);",
      errors: [{ messageId: "preferSome" }],
    },
    {
      code: "arr.find((x) => x.id === id) === undefined;",
      output: "!arr.some((x) => x.id === id);",
      errors: [{ messageId: "preferSome" }],
    },
    {
      code: "!arr.find((x) => x.id === id);",
      output: "!arr.some((x) => x.id === id);",
      errors: [{ messageId: "preferSome" }],
    },
  ],
});
