import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import requireEffectCleanup from "./require-effect-cleanup.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = requireEffectCleanup.rules["require-effect-cleanup"];
const ruleTester = new RuleTester();

ruleTester.run("require-effect-cleanup", rule, {
  valid: [
    "useEffect(() => { const id = setInterval(tick, 1000); return () => clearInterval(id); }, []);",
    "useEffect(() => { doSomething(); }, []);",
  ],
  invalid: [
    {
      code: "useEffect(() => { setInterval(tick, 1000); }, []);",
      errors: [{ messageId: "requireCleanup" }],
    },
    {
      code: "useEffect(() => { window.addEventListener('resize', onResize); }, []);",
      errors: [{ messageId: "requireCleanup" }],
    },
  ],
});
