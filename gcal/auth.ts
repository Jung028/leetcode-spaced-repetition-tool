const TOKEN_URL = "https://oauth2.googleapis.com/token";
const REFRESH_GUARD_MS = 60_000;

export interface TokenOk {
  ok: true;
  token: string;
}
export interface TokenErr {
  ok: false;
  reason: string;
}
export type TokenResult = TokenOk | TokenErr;

export interface AuthEnv {
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

export interface AuthDeps {
  fetch?: typeof fetch;
  now?: () => number;
  env?: AuthEnv;
}

const NOT_CONNECTED =
  "Google Calendar not connected — run: bun scripts/gcal-auth.ts";
const REAUTH =
  "Google Calendar authorisation expired — re-run: bun scripts/gcal-auth.ts";

export function createTokenProvider(deps: AuthDeps = {}): () => Promise<TokenResult> {
  const doFetch = deps.fetch ?? fetch;
  const now = deps.now ?? Date.now;
  const env: AuthEnv =
    deps.env ?? {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    };

  let cache: { token: string; expiresAt: number } | null = null;

  return async function getToken(): Promise<TokenResult> {
    if (!env.clientId || !env.clientSecret || !env.refreshToken) {
      return { ok: false, reason: NOT_CONNECTED };
    }
    if (cache && now() < cache.expiresAt - REFRESH_GUARD_MS) {
      return { ok: true, token: cache.token };
    }
    try {
      const res = await doFetch(TOKEN_URL, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: env.clientId,
          client_secret: env.clientSecret,
          refresh_token: env.refreshToken,
          grant_type: "refresh_token",
        }).toString(),
      });
      const data = (await res.json().catch(() => ({}))) as {
        access_token?: string;
        expires_in?: number;
        error?: string;
      };
      if (!res.ok || !data.access_token) {
        if (data.error === "invalid_grant") return { ok: false, reason: REAUTH };
        return { ok: false, reason: `Google token refresh failed (${res.status})` };
      }
      cache = {
        token: data.access_token,
        expiresAt: now() + (data.expires_in ?? 3600) * 1000,
      };
      return { ok: true, token: data.access_token };
    } catch (err) {
      return {
        ok: false,
        reason: err instanceof Error ? `Google token endpoint unreachable (${err.message})` : "Google token endpoint unreachable",
      };
    }
  };
}

export const getAccessToken = createTokenProvider();
