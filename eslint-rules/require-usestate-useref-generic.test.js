import { RuleTester } from "eslint";
import { parser as tsParser } from "typescript-eslint";
import { describe, it } from "vitest";
import requireUsestateUserefGeneric from "./require-usestate-useref-generic.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = requireUsestateUserefGeneric.rules["require-usestate-useref-generic"];
const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: "module", parser: tsParser } });

ruleTester.run("require-usestate-useref-generic", rule, {
  valid: ["useState(0);", "useState('');", "useState<string>();", "useRef<HTMLDivElement>(null);"],
  invalid: [
    {
      code: "useState();",
      errors: [{ messageId: "requireGeneric", data: { name: "useState" } }],
    },
    {
      code: "useState(null);",
      errors: [{ messageId: "requireGeneric", data: { name: "useState" } }],
    },
    {
      code: "useRef(null);",
      errors: [{ messageId: "requireGeneric", data: { name: "useRef" } }],
    },
  ],
});
