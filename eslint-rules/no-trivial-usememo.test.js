import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import noTrivialUsememo from "./no-trivial-usememo.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = noTrivialUsememo.rules["no-trivial-usememo"];
const ruleTester = new RuleTester();

ruleTester.run("no-trivial-usememo", rule, {
  valid: ["const value = useMemo(() => computeExpensiveThing(a, b), [a, b]);"],
  invalid: [
    {
      code: "const label = useMemo(() => `${a} (${b})`, [a, b]);",
      errors: [{ messageId: "unnecessaryMemo" }],
    },
    {
      code: "const value = useMemo(() => { return a + b; }, [a, b]);",
      errors: [{ messageId: "unnecessaryMemo" }],
    },
  ],
});
