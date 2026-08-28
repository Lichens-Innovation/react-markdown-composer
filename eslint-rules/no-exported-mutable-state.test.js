import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import noExportedMutableState from "./no-exported-mutable-state.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = noExportedMutableState.rules["no-exported-mutable-state"];
const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: "module" } });

ruleTester.run("no-exported-mutable-state", rule, {
  valid: ["export const x = 1;", "let x = 1;", "export function f() {}"],
  invalid: [
    {
      code: "export let x = 1;",
      errors: [{ messageId: "noMutableExport", data: { kind: "let" } }],
    },
    {
      code: "export var x = 1;",
      errors: [{ messageId: "noMutableExport", data: { kind: "var" } }],
    },
  ],
});
