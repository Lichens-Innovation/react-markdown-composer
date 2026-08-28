import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import noInlineGuardChainHandler from "./no-inline-guard-chain-handler.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = noInlineGuardChainHandler.rules["no-inline-guard-chain-handler"];
const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } } },
});

ruleTester.run("no-inline-guard-chain-handler", rule, {
  valid: ["const el = <Btn onPress={() => enabled && doIt()} />;"],
  invalid: [
    {
      code: "const el = <Btn onPress={() => !disabled && !readonly && doIt()} />;",
      errors: [{ messageId: "extractHandler", data: { count: "3" } }],
    },
  ],
});
