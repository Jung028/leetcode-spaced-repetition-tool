import { test, expect } from "bun:test";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildConsentUrl, exchangeCode, appendEnv } from "./gcal-auth";

test("buildConsentUrl requests offline access to calendar.events with consent prompt", () => {
  const url = new URL(buildConsentUrl("cid.apps.googleusercontent.com", "http://localhost:43117"));
  expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
  expect(url.searchParams.get("client_id")).toBe("cid.apps.googleusercontent.com");
  expect(url.searchParams.get("redirect_uri")).toBe("http://localhost:43117");
  expect(url.searchParams.get("response_type")).toBe("code");
  expect(url.searchParams.get("access_type")).toBe("offline");
  expect(url.searchParams.get("prompt")).toBe("consent");
  expect(url.searchParams.get("scope")).toBe("https://www.googleapis.com/auth/calendar.events");
});

test("exchangeCode posts to the token endpoint and returns the refresh token", async () => {
  const calls: Array<{ url: string; body: string }> = [];
  const fakeFetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url: String(url), body: String(init?.body) });
    return new Response(JSON.stringify({ refresh_token: "1//rt_abc", access_token: "at" }), { status: 200 });
  }) as unknown as typeof fetch;
  const res = await exchangeCode({
    clientId: "cid",
    clientSecret: "sec",
    code: "auth_code",
    redirectUri: "http://localhost:43117",
    fetch: fakeFetch,
  });
  expect(res).toEqual({ ok: true, refreshToken: "1//rt_abc" });
  expect(calls[0]!.url).toBe("https://oauth2.googleapis.com/token");
  expect(calls[0]!.body).toContain("grant_type=authorization_code");
});

test("exchangeCode reports an error when Google returns no refresh_token", async () => {
  const fakeFetch = (async () =>
    new Response(JSON.stringify({ error: "invalid_grant" }), { status: 400 })) as unknown as typeof fetch;
  const res = await exchangeCode({
    clientId: "cid",
    clientSecret: "sec",
    code: "bad",
    redirectUri: "http://localhost:1",
    fetch: fakeFetch,
  });
  expect(res.ok).toBe(false);
});

test("appendEnv adds a new key and replaces an existing one", async () => {
  const path = join(tmpdir(), `env-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await Bun.write(path, "GOOGLE_CLIENT_ID=cid\nGOOGLE_REFRESH_TOKEN=old\n");
  await appendEnv(path, "GOOGLE_REFRESH_TOKEN", "new");
  await appendEnv(path, "EXTRA_KEY", "yes");
  const text = await Bun.file(path).text();
  expect(text).toContain("GOOGLE_REFRESH_TOKEN=new");
  expect(text).not.toContain("GOOGLE_REFRESH_TOKEN=old");
  expect(text).toContain("EXTRA_KEY=yes");
  expect(text).toContain("GOOGLE_CLIENT_ID=cid");
});
