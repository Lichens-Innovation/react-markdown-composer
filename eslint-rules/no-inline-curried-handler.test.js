import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import noInlineCurriedHandler from "./no-inline-curried-handler.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = noInlineCurriedHandler.rules["no-inline-curried-handler"];
const ruleTester = new RuleTester();

ruleTester.run("no-inline-curried-handler", rule, {
  valid: [
    "const makeHandler = (id) => () => doThing(id);",
    "const Comp = () => { const value = compute(); return value; };",
  ],
  invalid: [
    {
      code: "const Comp = () => { const makeHandler = (id) => () => doThing(id); return makeHandler; };",
      errors: [{ messageId: "extractToUtils", data: { name: "makeHandler" } }],
    },
    {
      code: "function Comp() { const makeHandler = (id) => { return () => doThing(id); }; return makeHandler; }",
      errors: [{ messageId: "extractToUtils", data: { name: "makeHandler" } }],
    },
  ],
});
