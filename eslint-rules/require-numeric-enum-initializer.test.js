import { RuleTester } from "eslint";
import { parser as tsParser } from "typescript-eslint";
import { describe, it } from "vitest";
import requireNumericEnumInitializer from "./require-numeric-enum-initializer.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = requireNumericEnumInitializer.rules["require-numeric-enum-initializer"];
const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module", parser: tsParser },
});

ruleTester.run("require-numeric-enum-initializer", rule, {
  valid: ["enum Foo { A = 1, B = 2 }", 'enum Foo { A = "a", B = "b" }', "enum Foo { A = 1, B = A + 1 }"],
  invalid: [
    {
      code: "enum Foo { A, B }",
      errors: [{ messageId: "missingInitializer" }, { messageId: "missingInitializer" }],
    },
    {
      code: "enum Foo { A = 1, B }",
      errors: [{ messageId: "missingInitializer" }],
    },
  ],
});
