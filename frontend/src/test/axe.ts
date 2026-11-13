import axe from "axe-core";
import { expect } from "vitest";

const RULES_CHECKED_ELSEWHERE = {
  "color-contrast": { enabled: false },
  region: { enabled: false },
};

export async function expectNoAxeViolations(container: Element) {
  const results = await axe.run(container, { rules: RULES_CHECKED_ELSEWHERE });

  const problems = results.violations.map((violation) => {
    const elements = violation.nodes
      .map((node) => `    ${node.target.join(" ")}`)
      .join("\n");
    return `${violation.id} (${violation.impact}): ${violation.help}\n${elements}`;
  });

  expect(problems).toEqual([]);
}
