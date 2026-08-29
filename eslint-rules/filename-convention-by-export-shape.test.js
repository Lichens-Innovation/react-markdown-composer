import { RuleTester } from "eslint";
import { parser as tsParser } from "typescript-eslint";
import { describe, it } from "vitest";
import filenameConventionByExportShape from "./filename-convention-by-export-shape.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = filenameConventionByExportShape.rules["filename-convention-by-export-shape"];
const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: "module", parser: tsParser } });

ruleTester.run("filename-convention-by-export-shape", rule, {
  valid: [
    { code: "export const usePumpTest = () => {};", filename: "src/hooks/use-pump-test.ts" },
    { code: "export const TestRequestPage = () => {};", filename: "src/screens/test-request-page.tsx" },
    { code: "export const ConfirmDialog = () => {};", filename: "src/components/confirm-dialog.tsx" },
    { code: "export const foo = () => {};\nexport const bar = () => {};", filename: "src/store/app.store.ts" },
    {
      code: "export const useX = create()(y);\nexport const useSelector = (k) => useX((s) => s[k]);",
      filename: "src/store/app.store.ts",
    }, // store-creator export (not function-like) + one selector hook — 2 primary exports, skip
    {
      code: "export interface UseFooResult { value: number }\nexport const useFoo = () => ({ value: 1 });",
      filename: "src/hooks/use-foo.ts",
    }, // type-only export doesn't count toward the primary-export gate
    { code: "export const helper = () => {};", filename: "src/utils/logger.utils.ts" },
  ],
  invalid: [
    {
      code: "export const usePumpTest = () => {};",
      filename: "src/hooks/pump-test.ts",
      errors: [{ messageId: "hookFilename", data: { name: "usePumpTest" } }],
    },
    {
      code: "export const TestRequestPage = () => {};",
      filename: "src/screens/test-request.tsx",
      errors: [
        { messageId: "suffixFilename", data: { name: "TestRequestPage", nameSuffix: "Page", kebabSuffix: "-page" } },
      ],
    },
    {
      code: "export const helper = () => {};",
      filename: "src/utils/utils.ts",
      errors: [{ messageId: "genericBasename", data: { basename: "utils", example: "<domain>.utils.ts" } }],
    },
    {
      code: "export interface UseFooResult { value: number }\nexport const useFoo = () => ({ value: 1 });",
      filename: "src/hooks/foo.ts",
      errors: [{ messageId: "hookFilename", data: { name: "useFoo" } }],
    },
  ],
});
