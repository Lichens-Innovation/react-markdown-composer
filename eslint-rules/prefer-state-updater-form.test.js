import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import preferStateUpdaterForm from "./prefer-state-updater-form.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = preferStateUpdaterForm.rules["prefer-state-updater-form"];
const ruleTester = new RuleTester();

ruleTester.run("prefer-state-updater-form", rule, {
  valid: [
    "setNumbers((current) => [...current, n]);",
    "setNumbers([1, 2, 3]);",
    "setValue(e.target.value);", // `.value` here is a property key, not a reference to the `value` state
    "setUser({ user: newName });", // `user` here is an object-literal property key, not a reference to the `user` state
  ],
  invalid: [
    {
      code: "setNumbers([...numbers, n]);",
      errors: [{ messageId: "preferUpdaterForm", data: { setter: "setNumbers", state: "numbers" } }],
    },
    {
      code: "setCount(count + 1);",
      errors: [{ messageId: "preferUpdaterForm", data: { setter: "setCount", state: "count" } }],
    },
  ],
});
