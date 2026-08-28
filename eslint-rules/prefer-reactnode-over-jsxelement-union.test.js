import { RuleTester } from "eslint";
import { parser as tsParser } from "typescript-eslint";
import { describe, it } from "vitest";
import preferReactnodeOverJsxelementUnion from "./prefer-reactnode-over-jsxelement-union.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = preferReactnodeOverJsxelementUnion.rules["prefer-reactnode-over-jsxelement-union"];
const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module", parser: tsParser },
});

ruleTester.run("prefer-reactnode-over-jsxelement-union", rule, {
  valid: ["import type { ReactNode } from 'react';\ninterface Props { icon: ReactNode; }"],
  invalid: [
    {
      code: "interface Props { icon: JSX.Element | null | undefined; }",
      errors: [{ messageId: "preferReactNode" }],
    },
    {
      code: "import type { ReactNode } from 'react';\ninterface Props { icon: JSX.Element | null; }",
      output: "import type { ReactNode } from 'react';\ninterface Props { icon: ReactNode; }",
      errors: [{ messageId: "preferReactNode" }],
    },
  ],
});
