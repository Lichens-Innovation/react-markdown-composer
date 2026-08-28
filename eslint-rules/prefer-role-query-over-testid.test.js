import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import preferRoleQueryOverTestid from "./prefer-role-query-over-testid.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = preferRoleQueryOverTestid.rules["prefer-role-query-over-testid"];
const ruleTester = new RuleTester();

ruleTester.run("prefer-role-query-over-testid", rule, {
  valid: ["screen.getByRole('button');", "getByText('hello');"],
  invalid: [
    {
      code: "screen.getByTestId('submit');",
      errors: [{ messageId: "preferRole", data: { name: "getByTestId" } }],
    },
    {
      code: "queryAllByTestId('row');",
      errors: [{ messageId: "preferRole", data: { name: "queryAllByTestId" } }],
    },
  ],
});
