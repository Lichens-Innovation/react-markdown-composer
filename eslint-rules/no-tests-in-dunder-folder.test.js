import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import noTestsInDunderFolder from "./no-tests-in-dunder-folder.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = noTestsInDunderFolder.rules["no-tests-in-dunder-folder"];
const ruleTester = new RuleTester();

ruleTester.run("no-tests-in-dunder-folder", rule, {
  valid: [{ code: "test(1);", filename: "src/utils/foo.test.ts" }],
  invalid: [
    {
      code: "test(1);",
      filename: "src/__tests__/foo.test.ts",
      errors: [{ messageId: "colocate" }],
    },
  ],
});
