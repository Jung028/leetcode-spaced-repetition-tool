# LeetCode Top Interview 150 — Daily Next-Problem Reminder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent "next problem to solve" banner to the LeetCode tab, tracking a single advancing position through the official Top Interview 150 list (seeded at 29/150 done), so the next problem is never forgotten.

**Architecture:** A static ordered content list (`leetcode150-content.ts`), a single-row SQLite pointer (`leetcode150-db.ts`) that self-advances by matching solved `problems` rows' URL slugs against the current list entry, one read-only API route, and a banner component on the existing LeetCode board.

**Tech Stack:** Bun, `bun:sqlite`, React (HTML-import bundling, no build step config needed — matches the rest of this repo).

## Global Constraints

- No hook into `createProblem`/`updateProblem`/`captureSubmission` (in `db.ts`/`api.ts`) — those files are not modified by this plan at all.
- The pointer is a single advancing value (`completed_count`), never a per-item "released" set — there is exactly one "current" suggested problem at a time, or none once all 150 are done.
- Seed value is `29`, taken as given — never derived by scanning existing `problems` rows.
- Matching uses the existing `slugFromUrl` in `leetcode.ts` (already used elsewhere) against a `slugify(title)` computed from each content entry's title — no hardcoded per-item slugs.
- Advancing happens on read (every time the pointer is queried), immediately — no calendar-day gating, no "wait until tomorrow."
- New route: `GET /api/leetcode150/current`, returning either `{ position, number, title, topic, difficulty, url }` or `{ done: true }`.

---

### Task 1: Content layer — the ordered 150-item list

**Files:**
- Create: `leetcode150-content.ts`
- Test: `leetcode150-content.test.ts`

**Interfaces:**
- Produces: `interface Leetcode150Item { position: number; number: number; title: string; topic: string; difficulty: "Easy" | "Medium" | "Hard"; }`, `const LEETCODE_150: Leetcode150Item[]` (150 entries, 1-indexed `position`, in official list order), `function slugify(title: string): string`, `function leetcode150Url(item: Leetcode150Item): string`.

- [ ] **Step 1: Write the failing tests**

```ts
// leetcode150-content.test.ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test leetcode150-content.test.ts`
Expected: FAIL — `leetcode150-content.ts` doesn't exist yet.

- [ ] **Step 3: Write the implementation**

```ts
// leetcode150-content.ts
export interface Leetcode150Item {
  position: number; // 1-based index in the official Top Interview 150 order
  number: number; // LeetCode's own problem number
  title: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

// Official LeetCode "Top Interview 150" list, in the site's own topic-grouped
// order. `position` is 1-based and must stay contiguous — leetcode150-db.ts's
// pointer indexes into this array by position - 1.
export const LEETCODE_150: Leetcode150Item[] = [
  // Array / String
  { position: 1, number: 88, title: "Merge Sorted Array", topic: "Array / String", difficulty: "Easy" },
  { position: 2, number: 27, title: "Remove Element", topic: "Array / String", difficulty: "Easy" },
  { position: 3, number: 26, title: "Remove Duplicates from Sorted Array", topic: "Array / String", difficulty: "Easy" },
  { position: 4, number: 80, title: "Remove Duplicates from Sorted Array II", topic: "Array / String", difficulty: "Medium" },
  { position: 5, number: 169, title: "Majority Element", topic: "Array / String", difficulty: "Easy" },
  { position: 6, number: 189, title: "Rotate Array", topic: "Array / String", difficulty: "Medium" },
  { position: 7, number: 121, title: "Best Time to Buy and Sell Stock", topic: "Array / String", difficulty: "Easy" },
  { position: 8, number: 122, title: "Best Time to Buy and Sell Stock II", topic: "Array / String", difficulty: "Medium" },
  { position: 9, number: 55, title: "Jump Game", topic: "Array / String", difficulty: "Medium" },
  { position: 10, number: 45, title: "Jump Game II", topic: "Array / String", difficulty: "Medium" },
  { position: 11, number: 274, title: "H-Index", topic: "Array / String", difficulty: "Medium" },
  { position: 12, number: 380, title: "Insert Delete GetRandom O(1)", topic: "Array / String", difficulty: "Medium" },
  { position: 13, number: 238, title: "Product of Array Except Self", topic: "Array / String", difficulty: "Medium" },
  { position: 14, number: 134, title: "Gas Station", topic: "Array / String", difficulty: "Medium" },
  { position: 15, number: 135, title: "Candy", topic: "Array / String", difficulty: "Hard" },
  { position: 16, number: 42, title: "Trapping Rain Water", topic: "Array / String", difficulty: "Hard" },
  { position: 17, number: 13, title: "Roman to Integer", topic: "Array / String", difficulty: "Easy" },
  { position: 18, number: 12, title: "Integer to Roman", topic: "Array / String", difficulty: "Medium" },
  { position: 19, number: 58, title: "Length of Last Word", topic: "Array / String", difficulty: "Easy" },
  { position: 20, number: 14, title: "Longest Common Prefix", topic: "Array / String", difficulty: "Easy" },
  { position: 21, number: 151, title: "Reverse Words in a String", topic: "Array / String", difficulty: "Medium" },
  { position: 22, number: 6, title: "Zigzag Conversion", topic: "Array / String", difficulty: "Medium" },
  { position: 23, number: 28, title: "Find the Index of the First Occurrence in a String", topic: "Array / String", difficulty: "Easy" },
  { position: 24, number: 68, title: "Text Justification", topic: "Array / String", difficulty: "Hard" },

  // Two Pointers
  { position: 25, number: 125, title: "Valid Palindrome", topic: "Two Pointers", difficulty: "Easy" },
  { position: 26, number: 392, title: "Is Subsequence", topic: "Two Pointers", difficulty: "Easy" },
  { position: 27, number: 167, title: "Two Sum II - Input Array Is Sorted", topic: "Two Pointers", difficulty: "Medium" },
  { position: 28, number: 11, title: "Container With Most Water", topic: "Two Pointers", difficulty: "Medium" },
  { position: 29, number: 15, title: "3Sum", topic: "Two Pointers", difficulty: "Medium" },

  // Sliding Window
  { position: 30, number: 209, title: "Minimum Size Subarray Sum", topic: "Sliding Window", difficulty: "Medium" },
  { position: 31, number: 3, title: "Longest Substring Without Repeating Characters", topic: "Sliding Window", difficulty: "Medium" },
  { position: 32, number: 30, title: "Substring with Concatenation of All Words", topic: "Sliding Window", difficulty: "Hard" },
  { position: 33, number: 76, title: "Minimum Window Substring", topic: "Sliding Window", difficulty: "Hard" },

  // Matrix
  { position: 34, number: 36, title: "Valid Sudoku", topic: "Matrix", difficulty: "Medium" },
  { position: 35, number: 54, title: "Spiral Matrix", topic: "Matrix", difficulty: "Medium" },
  { position: 36, number: 48, title: "Rotate Image", topic: "Matrix", difficulty: "Medium" },
  { position: 37, number: 73, title: "Set Matrix Zeroes", topic: "Matrix", difficulty: "Medium" },
  { position: 38, number: 289, title: "Game of Life", topic: "Matrix", difficulty: "Medium" },

  // Hashmap
  { position: 39, number: 383, title: "Ransom Note", topic: "Hashmap", difficulty: "Easy" },
  { position: 40, number: 205, title: "Isomorphic Strings", topic: "Hashmap", difficulty: "Easy" },
  { position: 41, number: 290, title: "Word Pattern", topic: "Hashmap", difficulty: "Easy" },
  { position: 42, number: 242, title: "Valid Anagram", topic: "Hashmap", difficulty: "Easy" },
  { position: 43, number: 49, title: "Group Anagrams", topic: "Hashmap", difficulty: "Medium" },
  { position: 44, number: 1, title: "Two Sum", topic: "Hashmap", difficulty: "Easy" },
  { position: 45, number: 202, title: "Happy Number", topic: "Hashmap", difficulty: "Easy" },
  { position: 46, number: 219, title: "Contains Duplicate II", topic: "Hashmap", difficulty: "Easy" },
  { position: 47, number: 128, title: "Longest Consecutive Sequence", topic: "Hashmap", difficulty: "Medium" },

  // Intervals
  { position: 48, number: 228, title: "Summary Ranges", topic: "Intervals", difficulty: "Easy" },
  { position: 49, number: 56, title: "Merge Intervals", topic: "Intervals", difficulty: "Medium" },
  { position: 50, number: 57, title: "Insert Interval", topic: "Intervals", difficulty: "Medium" },
  { position: 51, number: 452, title: "Minimum Number of Arrows to Burst Balloons", topic: "Intervals", difficulty: "Medium" },

  // Stack
  { position: 52, number: 20, title: "Valid Parentheses", topic: "Stack", difficulty: "Easy" },
  { position: 53, number: 71, title: "Simplify Path", topic: "Stack", difficulty: "Medium" },
  { position: 54, number: 155, title: "Min Stack", topic: "Stack", difficulty: "Medium" },
  { position: 55, number: 150, title: "Evaluate Reverse Polish Notation", topic: "Stack", difficulty: "Medium" },
  { position: 56, number: 224, title: "Basic Calculator", topic: "Stack", difficulty: "Hard" },

  // Linked List
  { position: 57, number: 141, title: "Linked List Cycle", topic: "Linked List", difficulty: "Easy" },
  { position: 58, number: 2, title: "Add Two Numbers", topic: "Linked List", difficulty: "Medium" },
  { position: 59, number: 21, title: "Merge Two Sorted Lists", topic: "Linked List", difficulty: "Easy" },
  { position: 60, number: 138, title: "Copy List with Random Pointer", topic: "Linked List", difficulty: "Medium" },
  { position: 61, number: 92, title: "Reverse Linked List II", topic: "Linked List", difficulty: "Medium" },
  { position: 62, number: 25, title: "Reverse Nodes in k-Group", topic: "Linked List", difficulty: "Hard" },
  { position: 63, number: 19, title: "Remove Nth Node From End of List", topic: "Linked List", difficulty: "Medium" },
  { position: 64, number: 82, title: "Remove Duplicates from Sorted List II", topic: "Linked List", difficulty: "Medium" },
  { position: 65, number: 61, title: "Rotate List", topic: "Linked List", difficulty: "Medium" },
  { position: 66, number: 86, title: "Partition List", topic: "Linked List", difficulty: "Medium" },
  { position: 67, number: 146, title: "LRU Cache", topic: "Linked List", difficulty: "Medium" },

  // Binary Tree General
  { position: 68, number: 104, title: "Maximum Depth of Binary Tree", topic: "Binary Tree General", difficulty: "Easy" },
  { position: 69, number: 100, title: "Same Tree", topic: "Binary Tree General", difficulty: "Easy" },
  { position: 70, number: 226, title: "Invert Binary Tree", topic: "Binary Tree General", difficulty: "Easy" },
  { position: 71, number: 101, title: "Symmetric Tree", topic: "Binary Tree General", difficulty: "Easy" },
  { position: 72, number: 105, title: "Construct Binary Tree from Preorder and Inorder Traversal", topic: "Binary Tree General", difficulty: "Medium" },
  { position: 73, number: 106, title: "Construct Binary Tree from Inorder and Postorder Traversal", topic: "Binary Tree General", difficulty: "Medium" },
  { position: 74, number: 117, title: "Populating Next Right Pointers in Each Node II", topic: "Binary Tree General", difficulty: "Medium" },
  { position: 75, number: 114, title: "Flatten Binary Tree to Linked List", topic: "Binary Tree General", difficulty: "Medium" },
  { position: 76, number: 112, title: "Path Sum", topic: "Binary Tree General", difficulty: "Easy" },
  { position: 77, number: 129, title: "Sum Root to Leaf Numbers", topic: "Binary Tree General", difficulty: "Medium" },
  { position: 78, number: 124, title: "Binary Tree Maximum Path Sum", topic: "Binary Tree General", difficulty: "Hard" },
  { position: 79, number: 173, title: "Binary Search Tree Iterator", topic: "Binary Tree General", difficulty: "Medium" },
  { position: 80, number: 222, title: "Count Complete Tree Nodes", topic: "Binary Tree General", difficulty: "Medium" },
  { position: 81, number: 236, title: "Lowest Common Ancestor of a Binary Tree", topic: "Binary Tree General", difficulty: "Medium" },

  // Binary Tree BFS
  { position: 82, number: 199, title: "Binary Tree Right Side View", topic: "Binary Tree BFS", difficulty: "Medium" },
  { position: 83, number: 637, title: "Average of Levels in Binary Tree", topic: "Binary Tree BFS", difficulty: "Easy" },
  { position: 84, number: 102, title: "Binary Tree Level Order Traversal", topic: "Binary Tree BFS", difficulty: "Medium" },
  { position: 85, number: 103, title: "Binary Tree Zigzag Level Order Traversal", topic: "Binary Tree BFS", difficulty: "Medium" },

  // Binary Search Tree
  { position: 86, number: 530, title: "Minimum Absolute Difference in BST", topic: "Binary Search Tree", difficulty: "Easy" },
  { position: 87, number: 230, title: "Kth Smallest Element in a BST", topic: "Binary Search Tree", difficulty: "Medium" },
  { position: 88, number: 98, title: "Validate Binary Search Tree", topic: "Binary Search Tree", difficulty: "Medium" },

  // Graph General
  { position: 89, number: 200, title: "Number of Islands", topic: "Graph General", difficulty: "Medium" },
  { position: 90, number: 130, title: "Surrounded Regions", topic: "Graph General", difficulty: "Medium" },
  { position: 91, number: 133, title: "Clone Graph", topic: "Graph General", difficulty: "Medium" },
  { position: 92, number: 399, title: "Evaluate Division", topic: "Graph General", difficulty: "Medium" },
  { position: 93, number: 207, title: "Course Schedule", topic: "Graph General", difficulty: "Medium" },
  { position: 94, number: 210, title: "Course Schedule II", topic: "Graph General", difficulty: "Medium" },

  // Graph BFS
  { position: 95, number: 909, title: "Snakes and Ladders", topic: "Graph BFS", difficulty: "Medium" },
  { position: 96, number: 433, title: "Minimum Genetic Mutation", topic: "Graph BFS", difficulty: "Medium" },
  { position: 97, number: 127, title: "Word Ladder", topic: "Graph BFS", difficulty: "Hard" },

  // Trie
  { position: 98, number: 208, title: "Implement Trie (Prefix Tree)", topic: "Trie", difficulty: "Medium" },
  { position: 99, number: 211, title: "Design Add and Search Words Data Structure", topic: "Trie", difficulty: "Medium" },
  { position: 100, number: 212, title: "Word Search II", topic: "Trie", difficulty: "Hard" },

  // Backtracking
  { position: 101, number: 17, title: "Letter Combinations of a Phone Number", topic: "Backtracking", difficulty: "Medium" },
  { position: 102, number: 77, title: "Combinations", topic: "Backtracking", difficulty: "Medium" },
  { position: 103, number: 46, title: "Permutations", topic: "Backtracking", difficulty: "Medium" },
  { position: 104, number: 39, title: "Combination Sum", topic: "Backtracking", difficulty: "Medium" },
  { position: 105, number: 52, title: "N-Queens II", topic: "Backtracking", difficulty: "Hard" },
  { position: 106, number: 22, title: "Generate Parentheses", topic: "Backtracking", difficulty: "Medium" },
  { position: 107, number: 79, title: "Word Search", topic: "Backtracking", difficulty: "Medium" },

  // Divide & Conquer
  { position: 108, number: 108, title: "Convert Sorted Array to Binary Search Tree", topic: "Divide & Conquer", difficulty: "Easy" },
  { position: 109, number: 148, title: "Sort List", topic: "Divide & Conquer", difficulty: "Medium" },
  { position: 110, number: 427, title: "Construct Quad Tree", topic: "Divide & Conquer", difficulty: "Medium" },
  { position: 111, number: 23, title: "Merge k Sorted Lists", topic: "Divide & Conquer", difficulty: "Hard" },

  // Kadane's Algorithm
  { position: 112, number: 53, title: "Maximum Subarray", topic: "Kadane's Algorithm", difficulty: "Medium" },
  { position: 113, number: 918, title: "Maximum Sum Circular Subarray", topic: "Kadane's Algorithm", difficulty: "Medium" },

  // Binary Search
  { position: 114, number: 35, title: "Search Insert Position", topic: "Binary Search", difficulty: "Easy" },
  { position: 115, number: 74, title: "Search a 2D Matrix", topic: "Binary Search", difficulty: "Medium" },
  { position: 116, number: 162, title: "Find Peak Element", topic: "Binary Search", difficulty: "Medium" },
  { position: 117, number: 33, title: "Search in Rotated Sorted Array", topic: "Binary Search", difficulty: "Medium" },
  { position: 118, number: 34, title: "Find First and Last Position of Element in Sorted Array", topic: "Binary Search", difficulty: "Medium" },
  { position: 119, number: 153, title: "Find Minimum in Rotated Sorted Array", topic: "Binary Search", difficulty: "Medium" },
  { position: 120, number: 4, title: "Median of Two Sorted Arrays", topic: "Binary Search", difficulty: "Hard" },

  // Heap
  { position: 121, number: 215, title: "Kth Largest Element in an Array", topic: "Heap", difficulty: "Medium" },
  { position: 122, number: 502, title: "IPO", topic: "Heap", difficulty: "Hard" },
  { position: 123, number: 373, title: "Find K Pairs with Smallest Sums", topic: "Heap", difficulty: "Medium" },
  { position: 124, number: 295, title: "Find Median from Data Stream", topic: "Heap", difficulty: "Hard" },

  // Bit Manipulation
  { position: 125, number: 67, title: "Add Binary", topic: "Bit Manipulation", difficulty: "Easy" },
  { position: 126, number: 190, title: "Reverse Bits", topic: "Bit Manipulation", difficulty: "Easy" },
  { position: 127, number: 191, title: "Number of 1 Bits", topic: "Bit Manipulation", difficulty: "Easy" },
  { position: 128, number: 136, title: "Single Number", topic: "Bit Manipulation", difficulty: "Easy" },
  { position: 129, number: 137, title: "Single Number II", topic: "Bit Manipulation", difficulty: "Medium" },
  { position: 130, number: 201, title: "Bitwise AND of Numbers Range", topic: "Bit Manipulation", difficulty: "Medium" },

  // Math
  { position: 131, number: 9, title: "Palindrome Number", topic: "Math", difficulty: "Easy" },
  { position: 132, number: 66, title: "Plus One", topic: "Math", difficulty: "Easy" },
  { position: 133, number: 172, title: "Factorial Trailing Zeroes", topic: "Math", difficulty: "Medium" },
  { position: 134, number: 69, title: "Sqrt(x)", topic: "Math", difficulty: "Easy" },
  { position: 135, number: 50, title: "Pow(x, n)", topic: "Math", difficulty: "Medium" },
  { position: 136, number: 149, title: "Max Points on a Line", topic: "Math", difficulty: "Hard" },

  // 1D DP
  { position: 137, number: 70, title: "Climbing Stairs", topic: "1D DP", difficulty: "Easy" },
  { position: 138, number: 198, title: "House Robber", topic: "1D DP", difficulty: "Medium" },
  { position: 139, number: 139, title: "Word Break", topic: "1D DP", difficulty: "Medium" },
  { position: 140, number: 322, title: "Coin Change", topic: "1D DP", difficulty: "Medium" },
  { position: 141, number: 300, title: "Longest Increasing Subsequence", topic: "1D DP", difficulty: "Medium" },

  // Multidimensional DP
  { position: 142, number: 120, title: "Triangle", topic: "Multidimensional DP", difficulty: "Medium" },
  { position: 143, number: 64, title: "Minimum Path Sum", topic: "Multidimensional DP", difficulty: "Medium" },
  { position: 144, number: 63, title: "Unique Paths II", topic: "Multidimensional DP", difficulty: "Medium" },
  { position: 145, number: 5, title: "Longest Palindromic Substring", topic: "Multidimensional DP", difficulty: "Medium" },
  { position: 146, number: 97, title: "Interleaving String", topic: "Multidimensional DP", difficulty: "Medium" },
  { position: 147, number: 72, title: "Edit Distance", topic: "Multidimensional DP", difficulty: "Medium" },
  { position: 148, number: 123, title: "Best Time to Buy and Sell Stock III", topic: "Multidimensional DP", difficulty: "Hard" },
  { position: 149, number: 188, title: "Best Time to Buy and Sell Stock IV", topic: "Multidimensional DP", difficulty: "Hard" },
  { position: 150, number: 221, title: "Maximal Square", topic: "Multidimensional DP", difficulty: "Medium" },
];

// Matches the existing slugFromUrl convention in leetcode.ts — lowercase,
// parens stripped, any run of non-alphanumeric characters collapsed to one
// hyphen, no leading/trailing hyphens. Verified against every tricky title
// in this list (3Sum, Sqrt(x), Pow(x, n), N-Queens II, etc.) rather than
// hardcoding 150 slugs by hand.
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function leetcode150Url(item: Leetcode150Item): string {
  return `https://leetcode.com/problems/${slugify(item.title)}/`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test leetcode150-content.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add leetcode150-content.ts leetcode150-content.test.ts
git commit -m "feat: add the Top Interview 150 content list and slug helpers"
```

---

### Task 2: Database layer — self-advancing pointer

**Files:**
- Create: `leetcode150-db.ts`
- Test: `leetcode150-db.test.ts`

**Interfaces:**
- Consumes: `LEETCODE_150`, `slugify`, `type Leetcode150Item` from `leetcode150-content.ts` (Task 1). `listProblems(db)` from `db.ts` (existing — returns `ProblemSummary[]` with a `url` field). `slugFromUrl(url): string | null` from `leetcode.ts` (existing).
- Produces: `function migrateLeetcode150(db: Database): void`, `function getCurrentLeetcode150(db: Database): Leetcode150Item | null`.

- [ ] **Step 1: Write the failing tests**

```ts
// leetcode150-db.test.ts
import { test, expect } from "bun:test";
import { openDb, createProblem } from "./db";
import { localToday } from "./scheduling";
import { migrateLeetcode150, getCurrentLeetcode150 } from "./leetcode150-db";
import { LEETCODE_150, leetcode150Url } from "./leetcode150-content";

test("fresh db seeds completed_count at 29, so position 30 is current", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const current = getCurrentLeetcode150(db);
  expect(current).not.toBeNull();
  expect(current!.position).toBe(30);
  expect(current!.number).toBe(209);
});

test("calling migrateLeetcode150 twice does not reset an already-advanced pointer", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  createProblem(db, { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" }, localToday());
  getCurrentLeetcode150(db); // advances and persists to 30
  migrateLeetcode150(db); // re-running migration must not reset the seed
  const current = getCurrentLeetcode150(db);
  expect(current!.position).toBe(31);
});

test("solving the current problem advances the pointer by one", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  createProblem(db, { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" }, localToday());
  const current = getCurrentLeetcode150(db);
  expect(current!.position).toBe(31);
  expect(current!.number).toBe(3);
});

test("solving several consecutive problems at once advances past all of them in one call", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  for (const item of [LEETCODE_150[29]!, LEETCODE_150[30]!, LEETCODE_150[31]!]) {
    createProblem(db, { title: item.title, url: leetcode150Url(item), solution: "x" }, localToday());
  }
  const current = getCurrentLeetcode150(db);
  expect(current!.position).toBe(33);
});

test("solving a future (non-current) problem does not advance the pointer", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  createProblem(db, { title: LEETCODE_150[50]!.title, url: leetcode150Url(LEETCODE_150[50]!), solution: "x" }, localToday());
  const current = getCurrentLeetcode150(db);
  expect(current!.position).toBe(30); // unchanged — position 30 (index 29) still not solved
});

test("returns null once every problem is done", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  db.query(`UPDATE leetcode150_state SET completed_count = 150 WHERE id = 1`).run();
  expect(getCurrentLeetcode150(db)).toBeNull();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test leetcode150-db.test.ts`
Expected: FAIL — `leetcode150-db.ts` doesn't exist yet.

- [ ] **Step 3: Write the implementation**

```ts
// leetcode150-db.ts
import type { Database } from "bun:sqlite";
import { listProblems } from "./db";
import { slugFromUrl } from "./leetcode";
import { LEETCODE_150, slugify } from "./leetcode150-content";
import type { Leetcode150Item } from "./leetcode150-content";

const SEED_COMPLETED_COUNT = 29;

export function migrateLeetcode150(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leetcode150_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      completed_count INTEGER NOT NULL
    );
  `);
  const existing = db.query(`SELECT completed_count FROM leetcode150_state WHERE id = 1`).get() as
    | { completed_count: number }
    | null;
  if (!existing) {
    db.query(`INSERT INTO leetcode150_state (id, completed_count) VALUES (1, ?)`).run(SEED_COMPLETED_COUNT);
  }
}

// Self-advances on every read: walks the pointer forward past any entries
// that already have a matching solved `problems` row, persisting the new
// position. This is the only place the pointer moves — there is no hook
// into createProblem/captureSubmission in db.ts/api.ts.
export function getCurrentLeetcode150(db: Database): Leetcode150Item | null {
  const row = db.query(`SELECT completed_count FROM leetcode150_state WHERE id = 1`).get() as {
    completed_count: number;
  };
  let completedCount = row.completed_count;

  const solvedSlugs = new Set(
    listProblems(db)
      .map((p) => slugFromUrl(p.url))
      .filter((s): s is string => s !== null),
  );

  while (
    completedCount < LEETCODE_150.length &&
    solvedSlugs.has(slugify(LEETCODE_150[completedCount]!.title))
  ) {
    completedCount++;
  }

  if (completedCount !== row.completed_count) {
    db.query(`UPDATE leetcode150_state SET completed_count = ? WHERE id = 1`).run(completedCount);
  }

  return completedCount < LEETCODE_150.length ? LEETCODE_150[completedCount]! : null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test leetcode150-db.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add leetcode150-db.ts leetcode150-db.test.ts
git commit -m "feat: add self-advancing pointer state for the LeetCode-150 tracker"
```

---

### Task 3: API layer

**Files:**
- Create: `leetcode150-api.ts`
- Test: `leetcode150-api.test.ts`

**Interfaces:**
- Consumes: `migrateLeetcode150`, `getCurrentLeetcode150` from `leetcode150-db.ts` (Task 2). `leetcode150Url` from `leetcode150-content.ts` (Task 1).
- Produces: `function leetcode150ApiRoutes(db: Database): { "/api/leetcode150/current": { GET: ... } }`.

- [ ] **Step 1: Write the failing tests**

```ts
// leetcode150-api.test.ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { openDb, createProblem } from "./db";
import { localToday } from "./scheduling";
import { migrateLeetcode150 } from "./leetcode150-db";
import { leetcode150ApiRoutes } from "./leetcode150-api";
import { LEETCODE_150, leetcode150Url } from "./leetcode150-content";

let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = openDb(":memory:");
  migrateLeetcode150(db);
  server = Bun.serve({ port: 0, routes: leetcode150ApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("GET /api/leetcode150/current returns the seeded current problem", async () => {
  const res = await fetch(`${base}/api/leetcode150/current`);
  expect(res.status).toBe(200);
  const body: any = await res.json();
  expect(body.position).toBe(30);
  expect(body.number).toBe(209);
  expect(body.title).toBe("Minimum Size Subarray Sum");
  expect(body.topic).toBe("Sliding Window");
  expect(body.difficulty).toBe("Medium");
  expect(body.url).toBe("https://leetcode.com/problems/minimum-size-subarray-sum/");
});

test("GET /api/leetcode150/current reflects advancement after a solve", async () => {
  createProblem(
    db,
    { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" },
    localToday(),
  );
  const body: any = await (await fetch(`${base}/api/leetcode150/current`)).json();
  expect(body.position).toBe(31);
});

test("GET /api/leetcode150/current returns done:true once all 150 are complete", async () => {
  db.query(`UPDATE leetcode150_state SET completed_count = 150 WHERE id = 1`).run();
  const body: any = await (await fetch(`${base}/api/leetcode150/current`)).json();
  expect(body).toEqual({ done: true });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test leetcode150-api.test.ts`
Expected: FAIL — `leetcode150-api.ts` doesn't exist yet.

- [ ] **Step 3: Write the implementation**

```ts
// leetcode150-api.ts
import type { Database } from "bun:sqlite";
import { getCurrentLeetcode150 } from "./leetcode150-db";
import { leetcode150Url } from "./leetcode150-content";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export function leetcode150ApiRoutes(db: Database) {
  return {
    "/api/leetcode150/current": {
      GET: () => {
        const item = getCurrentLeetcode150(db);
        if (!item) return json({ done: true });
        return json({ ...item, url: leetcode150Url(item) });
      },
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test leetcode150-api.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add leetcode150-api.ts leetcode150-api.test.ts
git commit -m "feat: add GET /api/leetcode150/current route"
```

---

### Task 4: UI banner + wiring

**Files:**
- Modify: `frontend.tsx` (add fetcher + `NextProblemBanner` component + render it in `LeetCodeApp`'s board view)
- Modify: `index.ts` (wire migration + routes)

**Interfaces:**
- Consumes: `GET /api/leetcode150/current` (Task 3), response shape `{ position, number, title, topic, difficulty, url } | { done: true }`.

No automated frontend test — this project's established convention (see every prior `*App.tsx` change this session) is manual/visual verification for UI-only changes; `bunx tsc --noEmit` is the compile-correctness gate.

- [ ] **Step 1: Add the fetcher**

In `frontend.tsx`, immediately after the existing `const api = { ... };` block (currently ends at line 85 with `remove: ...`), add a sibling constant:

```ts
interface Leetcode150Current {
  position: number;
  number: number;
  title: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  url: string;
}

const leetcode150Api = {
  current: () =>
    fetch("/api/leetcode150/current").then(
      (r) => r.json() as Promise<Leetcode150Current | { done: true }>,
    ),
};
```

- [ ] **Step 2: Add the `NextProblemBanner` component**

Add this component right after the existing `DueBoard` function (which ends at line 320, just before `function ProblemForm`):

```tsx
function NextProblemBanner() {
  const [current, setCurrent] = useState<Leetcode150Current | { done: true } | null>(null);

  useEffect(() => {
    leetcode150Api.current().then(setCurrent);
  }, []);

  if (current === null) return null;
  if ("done" in current) {
    return (
      <section className="board next-problem-banner" aria-label="Top Interview 150 progress">
        <p className="board-empty">🎉 All 150 Top Interview problems done!</p>
      </section>
    );
  }

  return (
    <section className="board next-problem-banner" aria-label="Next Top Interview 150 problem">
      <div className="board-row">
        <button className="board-row-main" onClick={() => openExternal(current.url)}>
          <span className="tag">next up</span>
          <span className="board-title">
            {current.number}. {current.title}
          </span>
          <span className="lang-tag">{current.topic}</span>
        </button>
      </div>
    </section>
  );
}
```

This reuses the existing `.board`, `.board-row`, `.board-row-main`, `.tag`, `.board-title`, `.lang-tag` classes already defined in `index.css` for `DueBoard` — no new CSS needed. `openExternal` is the existing helper at line 97 (`window.open(url, "_blank", "noopener,noreferrer")`).

- [ ] **Step 3: Render the banner at the top of the LeetCode board**

In `LeetCodeApp` (starts at line 504), the board view currently reads (around line 551-560):

```tsx
      {view.name === "board" && (
        <>
          <Stats problems={problems} today={today} completedToday={completedToday} onOpen={open} />
          <p className="rule-note">
            Pass a review and the problem comes back later: 1 → 3 → 7 → 14 → 30
            days. Fail and it starts over, due tomorrow.
          </p>
          <DueBoard problems={problems} today={today} onOpen={open} />
        </>
      )}
```

Change it to render the banner first, before `<Stats>`:

```tsx
      {view.name === "board" && (
        <>
          <NextProblemBanner />
          <Stats problems={problems} today={today} completedToday={completedToday} onOpen={open} />
          <p className="rule-note">
            Pass a review and the problem comes back later: 1 → 3 → 7 → 14 → 30
            days. Fail and it starts over, due tomorrow.
          </p>
          <DueBoard problems={problems} today={today} onOpen={open} />
        </>
      )}
```

- [ ] **Step 4: Wire the migration and routes into `index.ts`**

`index.ts` currently reads:

```ts
import index from "./index.html";
import { openDb } from "./db";
import { apiRoutes } from "./api";
import { migrateTheory } from "./theory-db";
import { theoryApiRoutes } from "./theory-api";
import { migrateGoals } from "./goals-db";
import { goalsApiRoutes } from "./goals-api";
import { migrateExam } from "./exam-db";
import { examApiRoutes } from "./exam-api";
import { homeApiRoutes } from "./home-api";
import { localToday } from "./scheduling";

const db = openDb(process.env.SRS_DB_PATH ?? "srs.db");
migrateTheory(db, localToday());
migrateGoals(db, localToday());
migrateExam(db, localToday());
```

Add the new domain's import and migration call, and its route spread inside the `Bun.serve({ routes: { ... } })` block:

```ts
import { migrateLeetcode150 } from "./leetcode150-db";
import { leetcode150ApiRoutes } from "./leetcode150-api";
```

```ts
migrateLeetcode150(db);
```

```ts
    ...leetcode150ApiRoutes(db),
```

placed alongside the existing `...examApiRoutes(db),` / `...homeApiRoutes(db),` lines.

- [ ] **Step 5: Typecheck**

Run: `bunx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 6: Run the full test suite**

Run: `bun test`
Expected: all existing tests plus Tasks 1-3's new tests pass; nothing broken.

- [ ] **Step 7: Manual verification**

Start the dev server (`bun --hot index.ts`) against a scratch copy of the database (do not point `SRS_DB_PATH` at the real `srs.db` during ad-hoc manual testing unless you intend to persist against it), open the LeetCode tab in a browser, and confirm:
- A banner reading "next up — 209. Minimum Size Subarray Sum — Sliding Window" appears above the stats/review queue.
- Clicking it opens `https://leetcode.com/problems/minimum-size-subarray-sum/` in a new tab.
- Adding a problem titled "Minimum Size Subarray Sum" with a matching URL, then reloading the LeetCode tab, advances the banner to the next entry (Longest Substring Without Repeating Characters).

- [ ] **Step 8: Commit**

```bash
git add frontend.tsx index.ts
git commit -m "feat: show the next Top Interview 150 problem as a banner on the LeetCode board"
```

---

## Final Verification

- `bun test` — full suite green.
- `bunx tsc --noEmit` — clean.
- Manual browser check per Task 4 Step 7.
- Confirm the real `srs.db` is untouched by any test (`openDb(":memory:")` is used everywhere in tests — grep the new test files to confirm no test opens `"srs.db"` directly).
