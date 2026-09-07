import { test, expect } from "bun:test";
import { createTokenProvider } from "./auth";

const FULL_ENV = { clientId: "cid", clientSecret: "sec", refreshToken: "rt" };

function stubFetch(responses: Array<{ status: number; body: unknown }>) {
  let call = 0;
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fn = (async (url: string, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    const r = responses[Math.min(call, responses.length - 1)]!;
    call += 1;
    return new Response(JSON.stringify(r.body), { status: r.status });
  }) as unknown as typeof fetch;
  return { fn, calls, get callCount() { return call; } };
}

test("returns an error result when credentials are missing (never throws)", async () => {
  const provider = createTokenProvider({ env: {}, fetch: stubFetch([]).fn });
  const res = await provider();
  expect(res.ok).toBe(false);
  if (!res.ok) expect(res.reason).toContain("gcal-auth.ts");
});

test("exchanges the refresh token and returns the access token", async () => {
  const f = stubFetch([{ status: 200, body: { access_token: "at_1", expires_in: 3600 } }]);
  const provider = createTokenProvider({ env: FULL_ENV, fetch: f.fn, now: () => 0 });
  const res = await provider();
  expect(res).toEqual({ ok: true, token: "at_1" });
  expect(f.calls[0]!.url).toBe("https://oauth2.googleapis.com/token");
  expect(f.calls[0]!.init!.method).toBe("POST");
});

test("caches the token until ~60s before expiry, then refreshes", async () => {
  const f = stubFetch([
    { status: 200, body: { access_token: "at_1", expires_in: 3600 } },
    { status: 200, body: { access_token: "at_2", expires_in: 3600 } },
  ]);
  let clock = 0;
  const provider = createTokenProvider({ env: FULL_ENV, fetch: f.fn, now: () => clock });
  expect(await provider()).toEqual({ ok: true, token: "at_1" });
  clock = 3600_000 - 61_000; // still inside the cache window
  expect(await provider()).toEqual({ ok: true, token: "at_1" });
  expect(f.callCount).toBe(1);
  clock = 3600_000 - 59_000; // past the 60s guard
  expect(await provider()).toEqual({ ok: true, token: "at_2" });
  expect(f.callCount).toBe(2);
});

test("maps invalid_grant to a re-auth message", async () => {
  const f = stubFetch([{ status: 400, body: { error: "invalid_grant" } }]);
  const provider = createTokenProvider({ env: FULL_ENV, fetch: f.fn, now: () => 0 });
  const res = await provider();
  expect(res.ok).toBe(false);
  if (!res.ok) expect(res.reason).toContain("re-run");
});

test("maps a network throw to an error result", async () => {
  const provider = createTokenProvider({
    env: FULL_ENV,
    now: () => 0,
    fetch: (async () => { throw new Error("boom"); }) as unknown as typeof fetch,
  });
  const res = await provider();
  expect(res.ok).toBe(false);
});
