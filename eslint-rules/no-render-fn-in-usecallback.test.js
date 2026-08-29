import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import noRenderFnInUsecallback from "./no-render-fn-in-usecallback.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = noRenderFnInUsecallback.rules["no-render-fn-in-usecallback"];
const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } } },
});

ruleTester.run("no-render-fn-in-usecallback", rule, {
  valid: ["const handleClick = useCallback(() => { doThing(); }, []);"],
  invalid: [
    {
      code: "const renderIcon = useCallback(() => <Icon />, []);",
      errors: [{ messageId: "extractSubcomponent" }],
    },
    {
      code: "const handler = useCallback(() => { return <Icon />; }, []);",
      errors: [{ messageId: "extractSubcomponent" }],
    },
  ],
});
