import { test, expect } from "bun:test";
import { canOverrule, seedFor, seededShuffle, shuffledNotIdentity, matchChoiceOrder, moveItem, parseNumberArray, parseStringArray } from "./formats";

test("seedFor is stable and sensitive to every part", () => {
  expect(seedFor("A", 1, 2, 3)).toBe(seedFor("A", 1, 2, 3));
  expect(seedFor("A", 1, 2, 3)).not.toBe(seedFor("A", 1, 2, 4));
});

test("seededShuffle is deterministic and a permutation", () => {
  const a = seededShuffle([1, 2, 3, 4, 5, 6], 42);
  expect(a).toEqual(seededShuffle([1, 2, 3, 4, 5, 6], 42));
  expect([...a].sort()).toEqual([1, 2, 3, 4, 5, 6]);
});

test("shuffledNotIdentity is a permutation of 0..n-1 and never the identity (n>=2)", () => {
  for (let seed = 0; seed < 200; seed++) {
    for (const n of [2, 3, 4, 7]) {
      const p = shuffledNotIdentity(n, seed);
      expect([...p].sort((x, y) => x - y)).toEqual(Array.from({ length: n }, (_, i) => i));
      expect(p.every((v, i) => v === i)).toBe(false);
    }
  }
  expect(shuffledNotIdentity(1, 5)).toEqual([0]);
});

test("matchChoiceOrder covers every canonical right index (pairs then decoys) exactly once", () => {
  const order = matchChoiceOrder(4, 2, 9);
  expect([...order].sort((x, y) => x - y)).toEqual([0, 1, 2, 3, 4, 5]);
});

test("moveItem swaps neighbours and ignores moves off either end", () => {
  expect(moveItem([0, 1, 2], 0, 1)).toEqual([1, 0, 2]);
  expect(moveItem([0, 1, 2], 2, -1)).toEqual([0, 2, 1]);
  expect(moveItem([0, 1, 2], 0, -1)).toEqual([0, 1, 2]);
  expect(moveItem([0, 1, 2], 2, 1)).toEqual([0, 1, 2]);
});

test("parsers return null for bad or wrong-shaped JSON", () => {
  expect(parseNumberArray("[1,2,0]")).toEqual([1, 2, 0]);
  expect(parseNumberArray("")).toBeNull();
  expect(parseNumberArray("not json")).toBeNull();
  expect(parseNumberArray('["a"]')).toBeNull();
  expect(parseStringArray('["mac","hash"]')).toEqual(["mac", "hash"]);
  expect(parseStringArray("[1]")).toBeNull();
});

test("canOverrule: only after a wrong grade, never while reviewing a submitted paper", () => {
  expect(canOverrule(true, 0, false)).toBe(true);
  expect(canOverrule(true, 0, true)).toBe(false);
  expect(canOverrule(true, 1, false)).toBe(false);
  expect(canOverrule(false, null, false)).toBe(false);
});

test("seedFor hashes astral characters by code point and is still stable", () => {
  expect(seedFor("😀", 1)).toBe(seedFor("😀", 1));
  expect(seedFor("😀", 1)).not.toBe(seedFor("😁", 1));
});
