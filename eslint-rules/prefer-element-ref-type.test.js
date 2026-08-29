import { RuleTester } from "eslint";
import { parser as tsParser } from "typescript-eslint";
import { describe, it } from "vitest";
import preferElementRefType from "./prefer-element-ref-type.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = preferElementRefType.rules["prefer-element-ref-type"];
const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: "module", parser: tsParser } });

ruleTester.run("prefer-element-ref-type", rule, {
  valid: ["import { ElementRef } from 'react';\nconst ref = useRef<ElementRef<'div'>>(null);"],
  invalid: [
    {
      code: "const ref = useRef<HTMLDivElement>(null);",
      errors: [{ messageId: "preferElementRef", data: { typeName: "HTMLDivElement", tag: "div" } }],
    },
    {
      code: "import { ElementRef } from 'react';\nconst ref = useRef<HTMLDivElement>(null);",
      output: "import { ElementRef } from 'react';\nconst ref = useRef<ElementRef<\"div\">>(null);",
      errors: [{ messageId: "preferElementRef", data: { typeName: "HTMLDivElement", tag: "div" } }],
    },
  ],
});
