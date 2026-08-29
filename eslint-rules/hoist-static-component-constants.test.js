import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import hoistStaticComponentConstants from "./hoist-static-component-constants.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = hoistStaticComponentConstants.rules["hoist-static-component-constants"];
const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: "module" } });

ruleTester.run("hoist-static-component-constants", rule, {
  valid: [
    "const OPTIONS = ['a', 'b'];",
    "const Comp = (props) => { const rows = [props.a, props.b]; return rows; };",
    "const Comp = () => { const value = compute(); const list = [value]; return list; };",
    "const scanNpshrCurves = () => { const found = []; found.push(1); return found; };", // plain util fn, not a component/hook
    "const Comp = () => { const found = []; return found; };", // empty literal — nothing to hoist
  ],
  invalid: [
    {
      code: "const Comp = () => { const OPTIONS = ['a', 'b']; return OPTIONS; };",
      errors: [{ messageId: "hoist", data: { name: "OPTIONS" } }],
    },
    {
      code: "const Comp = () => { const CONFIG = { a: 1, b: 2 }; return CONFIG; };",
      errors: [{ messageId: "hoist", data: { name: "CONFIG" } }],
    },
  ],
});
