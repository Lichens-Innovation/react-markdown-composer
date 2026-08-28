import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import noNestedTry from "./no-nested-try.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = noNestedTry.rules["no-nested-try"];
const ruleTester = new RuleTester();

ruleTester.run("no-nested-try", rule, {
  valid: [
    "try { a(); } catch (e) { b(); }",
    "try { a(); } catch (e) { b(); } function f() { try { c(); } catch (e) {} }",
  ],
  invalid: [
    {
      code: "try { try { a(); } catch (e) {} } catch (e) {}",
      errors: [{ messageId: "nestedTry" }],
    },
    {
      code: "try { a(); } catch (e) { try { b(); } catch (e2) {} }",
      errors: [{ messageId: "nestedTry" }],
    },
  ],
});
