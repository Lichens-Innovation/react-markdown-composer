import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import noNonHookUsePrefix from "./no-non-hook-use-prefix.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = noNonHookUsePrefix.rules["no-non-hook-use-prefix"];
const ruleTester = new RuleTester();

ruleTester.run("no-non-hook-use-prefix", rule, {
  valid: ["const useFoo = () => { const [state] = useState(0); return state; };", "const calculateDiscount = () => 1;"],
  invalid: [
    {
      code: "const useCalculateDiscount = () => { return 1; };",
      errors: [{ messageId: "misnamed", data: { name: "useCalculateDiscount" } }],
    },
    {
      code: "function useLocale() { return getLocale(); }",
      errors: [{ messageId: "misnamed", data: { name: "useLocale" } }],
    },
  ],
});
