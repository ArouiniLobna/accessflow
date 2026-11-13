# Accessibility testing

AccessFlow tells people that automated checks can't prove a page is accessible, so
I test its own UI the same way: automated checks in the test suite, plus the manual
checks below.

## Automated

`frontend/src/accessibility.test.tsx` runs axe-core on every screen state: loading,
loaded, empty, errors, the issue page and the not-found pages. Two rules are turned
off there and checked by hand instead:

- **Colour contrast:** the tests run in a simulated browser that can't work out the
  colours actually shown on screen.
- **Landmarks:** the tests render parts of the page without the real header and main
  area around them.

## Manual checks

Tested in Chrome and Firefox on Windows, with NVDA as the screen reader.

| Check                           | How                                                                                                          | Result |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------ |
| Keyboard only                   | Unplug the mouse. Load the audit, filter, sort, open an issue, go back, retry after an error.                |        |
| Focus always visible            | While tabbing through every page, the focused element is always clearly marked.                              |        |
| Focus after navigation          | Opening an issue puts focus on its heading. Going back puts it on the issue you opened.                      |        |
| Screen reader: loading          | The audit loading and loading result are announced.                                                          |        |
| Screen reader: table            | Moving cell by cell announces the column header and the issue title.                                         |        |
| Screen reader: filters and sort | Changing a filter or sort announces the new count and order.                                                 |        |
| Landmarks and headings          | NVDA's elements list (Insert+F7) shows a banner, main, one h1 per page, and headings in order.               |        |
| Colour contrast                 | Check text, links and focus outlines with the browser's contrast checker (DevTools, inspect, colour picker). |        |
| Zoom to 200%                    | Nothing is cut off or overlapping.                                                                           |        |
| Reflow at 400%                  | At 400% zoom on a 1280px wide window, only the table scrolls sideways; nothing else does.                    |        |
| Text spacing                    | Increase line height and letter spacing with a text spacing bookmarklet; no text is clipped.                 |        |
| Windows contrast themes         | Turn on a contrast theme. Focus outlines, checkboxes and the code block are still visible.                   |        |

## Known issues

None open. When a check turns something up, it goes here until it's fixed.
