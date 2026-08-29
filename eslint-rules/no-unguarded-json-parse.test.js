import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import noUnguardedJsonParse from "./no-unguarded-json-parse.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = noUnguardedJsonParse.rules["no-unguarded-json-parse"];
const ruleTester = new RuleTester();

ruleTester.run("no-unguarded-json-parse", rule, {
  valid: [
    "try { JSON.parse(raw); } catch (e) {}",
    "function f() { try { return JSON.parse(raw); } catch (e) { return null; } }",
  ],
  invalid: [
    {
      code: "JSON.parse(raw);",
      errors: [{ messageId: "unguarded" }],
    },
    {
      code: "try {} catch (e) { JSON.parse(raw); }",
      errors: [{ messageId: "unguarded" }],
    },
    {
      code: "function f() { return JSON.parse(raw); }",
      errors: [{ messageId: "unguarded" }],
    },
  ],
});
