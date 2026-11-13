import { describe, expect, it } from "vitest";

import { DEFAULT_SORT, IMPACT_FILTER_ORDER } from "./issues";
import { parseListView, serializeListView, type ListView } from "./listView";

describe("parseListView", () => {
  it("shows everything with the default sort when the address has no options", () => {
    const view = parseListView(new URLSearchParams(""));

    expect(view.impacts).toEqual(new Set(IMPACT_FILTER_ORDER));
    expect(view.sort).toEqual(DEFAULT_SORT);
  });

  it("reads selected impacts and ignores unknown ones", () => {
    const view = parseListView(
      new URLSearchParams("impact=minor&impact=banana&impact=critical"),
    );

    expect(view.impacts).toEqual(new Set(["minor", "critical"]));
  });

  it("reads 'none' as nothing selected", () => {
    expect(parseListView(new URLSearchParams("impact=none")).impacts.size).toBe(
      0,
    );
  });

  it("uses the column's natural direction when only the column is given", () => {
    expect(parseListView(new URLSearchParams("sort=title")).sort).toEqual({
      key: "title",
      direction: "ascending",
    });
  });

  it("falls back to the default sort for values it doesn't know", () => {
    expect(
      parseListView(new URLSearchParams("sort=price&order=sideways")).sort,
    ).toEqual(DEFAULT_SORT);
  });
});

describe("serializeListView", () => {
  it("leaves the address clean for the default view", () => {
    const view: ListView = {
      impacts: new Set(IMPACT_FILTER_ORDER),
      sort: DEFAULT_SORT,
    };

    expect(serializeListView(view).toString()).toBe("");
  });

  it("writes impacts in a fixed order, whatever order they were picked in", () => {
    const view: ListView = {
      impacts: new Set(["minor", "critical"] as const),
      sort: DEFAULT_SORT,
    };

    expect(serializeListView(view).toString()).toBe(
      "impact=critical&impact=minor",
    );
  });

  it("round-trips a custom view through the address", () => {
    const view: ListView = {
      impacts: new Set(["serious"] as const),
      sort: { key: "title", direction: "descending" },
    };

    expect(parseListView(serializeListView(view))).toEqual(view);
  });
});
