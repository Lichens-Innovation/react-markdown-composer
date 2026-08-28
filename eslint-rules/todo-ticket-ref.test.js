import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import todoTicketRef from "./todo-ticket-ref.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = todoTicketRef.rules["ticket-ref"];
const ruleTester = new RuleTester();

ruleTester.run("ticket-ref", rule, {
  valid: [
    "// no term here at all",
    "// TODO: JIRA-1234 fix this",
    {
      code: "// TODO: https://example.atlassian.net/browse/TBDT2-173",
      options: [{ pattern: "([A-Z0-9]+-\\d+)" }],
    },
  ],
  invalid: [
    {
      code: "// TODO: fix this later",
      errors: [{ messageId: "missingTicket" }],
    },
    {
      code: "// TODO: fix this later",
      options: [{ commentPattern: "\\d{4}" }],
      errors: [{ messageId: "missingTicketWithCommentPattern" }],
    },
    {
      code: "// TODO: fix this later",
      options: [{ description: "must include a Jira key" }],
      errors: [{ messageId: "missingTicketWithDescription" }],
    },
  ],
});
