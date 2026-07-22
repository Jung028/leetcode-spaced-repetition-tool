import { test, expect } from "bun:test";
import { slugFromUrl } from "./leetcode";

test("extracts the slug from a plain problem URL", () => {
  expect(slugFromUrl("https://leetcode.com/problems/two-sum/")).toBe("two-sum");
});

test("extracts the slug ignoring query params and trailing path", () => {
  expect(
    slugFromUrl(
      "https://leetcode.com/problems/candy/description/?envType=study-plan-v2&envId=top-interview-150",
    ),
  ).toBe("candy");
});

test("extracts the slug without a trailing slash", () => {
  expect(slugFromUrl("https://leetcode.com/problems/merge-intervals")).toBe(
    "merge-intervals",
  );
});

test("returns null for a non-problem URL", () => {
  expect(slugFromUrl("https://leetcode.com/explore/")).toBeNull();
});
