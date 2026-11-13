import { expect, it } from "vitest";

import { isSafeHttpUrl } from "./urls";

it.each([
  ["https://dequeuniversity.com/rules/axe/4.10/label", true],
  ["http://localhost:5173/signup", true],
  ["javascript:alert(1)", false],
  ["data:text/html,<script>alert(1)</script>", false],
  ["not a url", false],
])("isSafeHttpUrl(%s) is %s", (value, expected) => {
  expect(isSafeHttpUrl(value)).toBe(expected);
});
