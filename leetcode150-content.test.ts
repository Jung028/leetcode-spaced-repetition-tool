import { test, expect } from "bun:test";
import { LEETCODE_150, slugify, leetcode150Url } from "./leetcode150-content";

test("LEETCODE_150 has exactly 150 entries in official order", () => {
  expect(LEETCODE_150.length).toBe(150);
  expect(LEETCODE_150[0]!.position).toBe(1);
  expect(LEETCODE_150[0]!.number).toBe(88);
  expect(LEETCODE_150[0]!.title).toBe("Merge Sorted Array");
  expect(LEETCODE_150[149]!.position).toBe(150);
  expect(LEETCODE_150[149]!.number).toBe(221);
  expect(LEETCODE_150[149]!.title).toBe("Maximal Square");
});

test("position 30 (0-indexed 29) is the next problem after the seeded 29 done", () => {
  const item = LEETCODE_150[29]!;
  expect(item.position).toBe(30);
  expect(item.number).toBe(209);
  expect(item.title).toBe("Minimum Size Subarray Sum");
  expect(item.topic).toBe("Sliding Window");
  expect(item.difficulty).toBe("Medium");
});

test("slugify handles plain multi-word titles", () => {
  expect(slugify("Merge Sorted Array")).toBe("merge-sorted-array");
  expect(slugify("Two Sum")).toBe("two-sum");
});

test("slugify handles tricky titles with punctuation", () => {
  expect(slugify("3Sum")).toBe("3sum");
  expect(slugify("Sqrt(x)")).toBe("sqrtx");
  expect(slugify("Pow(x, n)")).toBe("powx-n");
  expect(slugify("N-Queens II")).toBe("n-queens-ii");
  expect(slugify("H-Index")).toBe("h-index");
  expect(slugify("Implement Trie (Prefix Tree)")).toBe("implement-trie-prefix-tree");
});

test("leetcode150Url builds a real leetcode.com problems URL", () => {
  const item = LEETCODE_150.find((i) => i.number === 209)!;
  expect(leetcode150Url(item)).toBe("https://leetcode.com/problems/minimum-size-subarray-sum/");
});

test("every entry has a unique position 1..150 with no gaps", () => {
  const positions = LEETCODE_150.map((i) => i.position);
  expect(positions).toEqual(Array.from({ length: 150 }, (_, i) => i + 1));
});
