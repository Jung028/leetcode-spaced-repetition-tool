// Pure helpers for the new question formats: deterministic shuffles (so a reload
// shows the same layout), the order-question move, and parsers for the JSON a
// student's answer is stored as. Kept free of React so it is unit-tested.

// FNV-1a over the parts joined — a small stable 32-bit hash.
export function seedFor(...parts: (string | number)[]): number {
  let h = 2166136261;
  for (const ch of parts.join("|")) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32 PRNG.
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  const rand = rng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

// A permutation of 0..n-1 that is never the identity (for n >= 2), so an order
// question never opens already solved.
export function shuffledNotIdentity(n: number, seed: number): number[] {
  const base = Array.from({ length: n }, (_, i) => i);
  if (n < 2) return base;
  const p = seededShuffle(base, seed);
  return p.every((v, i) => v === i) ? [...p.slice(1), p[0]!] : p;
}

// Display order of a match question's right-hand choices, as canonical indices
// (pairs' rights first, then decoys).
export function matchChoiceOrder(pairCount: number, decoyCount: number, seed: number): number[] {
  return seededShuffle(Array.from({ length: pairCount + decoyCount }, (_, i) => i), seed);
}

export function moveItem(arr: number[], from: number, dir: -1 | 1): number[] {
  const to = from + dir;
  if (to < 0 || to >= arr.length) return arr;
  const out = [...arr];
  [out[from], out[to]] = [out[to]!, out[from]!];
  return out;
}

export function parseNumberArray(raw: string): number[] | null {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) && v.every((x) => Number.isInteger(x)) ? (v as number[]) : null;
  } catch {
    return null;
  }
}

export function parseStringArray(raw: string): string[] | null {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]) : null;
  } catch {
    return null;
  }
}
