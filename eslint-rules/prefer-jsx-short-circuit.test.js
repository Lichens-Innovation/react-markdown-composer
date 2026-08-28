import { RuleTester } from "eslint";
import { parser as tsParser } from "typescript-eslint";
import { describe, it } from "vitest";
import preferJsxShortCircuit from "./prefer-jsx-short-circuit.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = preferJsxShortCircuit.rules["prefer-jsx-short-circuit"];
const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    parser: tsParser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run("prefer-jsx-short-circuit", rule, {
  valid: [
    "const Comp = ({ isReady }) => <div>{isReady && <span />}</div>;",
    "const Comp = ({ count }) => <div>{count > 0 && <span />}</div>;",
    "const Comp = ({ name }) => <div>{!!name && <span />}</div>;",
    "const Comp = ({ isLoading }) => <div>{!isLoading && <span />}</div>;",
    "const Comp = ({ isReady }) => <div>{isReady ? <span /> : <p />}</div>;",
    "const Comp = ({ fn }) => <div>{fn() && <span />}</div>;",
    "const Comp = ({ isA, isB }) => <div>{isA && isB && <span />}</div>;",
    "const Comp = ({ cond }) => <div className={cond ? 'a' : null} />;",
    "const Comp = ({ items }) => <div>{items.length > 0 && <span />}</div>;",
  ],
  invalid: [
    {
      code: "const Comp = ({ isReady }) => <div>{isReady ? <span /> : null}</div>;",
      output: "const Comp = ({ isReady }) => <div>{isReady && <span />}</div>;",
      errors: [{ messageId: "preferShortCircuit" }],
    },
    {
      code: "const Comp = ({ isReady }) => <div>{isReady ? <span /> : false}</div>;",
      output: "const Comp = ({ isReady }) => <div>{isReady && <span />}</div>;",
      errors: [{ messageId: "preferShortCircuit" }],
    },
    {
      code: "const Comp = ({ isReady }) => <div>{isReady ? <span /> : undefined}</div>;",
      output: "const Comp = ({ isReady }) => <div>{isReady && <span />}</div>;",
      errors: [{ messageId: "preferShortCircuit" }],
    },
    {
      code: "const Comp = ({ isReady }) => <div>{isReady ? (\n  <span />\n) : null}</div>;",
      output: "const Comp = ({ isReady }) => <div>{isReady && (\n  <span />\n)}</div>;",
      errors: [{ messageId: "preferShortCircuit" }],
    },
    {
      code: "const Comp = ({ items }) => <div>{items.length && <span />}</div>;",
      output: "const Comp = ({ items }) => <div>{items.length > 0 && <span />}</div>;",
      errors: [{ messageId: "requireBooleanGuard" }],
    },
    {
      code: "const Comp = ({ items }) => <div>{items.length ? <span /> : null}</div>;",
      output: "const Comp = ({ items }) => <div>{items.length > 0 && <span />}</div>;",
      errors: [{ messageId: "preferShortCircuit" }],
    },
    {
      code: "const Comp = ({ tooltip }) => <div>{tooltip.x && <span />}</div>;",
      output: "const Comp = ({ tooltip }) => <div>{!!tooltip.x && <span />}</div>;",
      errors: [{ messageId: "requireBooleanGuard" }],
    },
    {
      code: "const Comp = ({ isReady, tooltip }) => <div>{isReady && tooltip.x ? <span /> : null}</div>;",
      output: "const Comp = ({ isReady, tooltip }) => <div>{isReady && !!tooltip.x && <span />}</div>;",
      errors: [{ messageId: "preferShortCircuit" }],
    },
  ],
});
