import { RuleTester } from "eslint";
import { parser as tsParser } from "typescript-eslint";
import { describe, it } from "vitest";
import preferPropsWithChildren from "./prefer-props-with-children.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = preferPropsWithChildren.rules["prefer-props-with-children"];
const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module", parser: tsParser },
});

ruleTester.run("prefer-props-with-children", rule, {
  valid: ["interface Props { title: string; }", "type Props = PropsWithChildren<{ title: string }>;"],
  invalid: [
    {
      code: "interface Props { title: string; children: ReactNode; }",
      errors: [{ messageId: "preferPropsWithChildren", data: { name: "Props" } }],
    },
  ],
});
