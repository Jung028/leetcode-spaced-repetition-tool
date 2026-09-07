const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/calendar.events";

export function buildConsentUrl(clientId: string, redirectUri: string): string {
  const url = new URL(AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("scope", SCOPE);
  return url.toString();
}

export async function exchangeCode(params: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
  fetch?: typeof fetch;
}): Promise<{ ok: true; refreshToken: string } | { ok: false; error: string }> {
  const doFetch = params.fetch ?? fetch;
  try {
    const res = await doFetch(TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: params.clientId,
        client_secret: params.clientSecret,
        code: params.code,
        redirect_uri: params.redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });
    const data = (await res.json().catch(() => ({}))) as { refresh_token?: string; error?: string };
    if (!res.ok || !data.refresh_token) {
      return { ok: false, error: data.error ?? `token exchange failed (${res.status})` };
    }
    return { ok: true, refreshToken: data.refresh_token };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "token exchange error" };
  }
}

export async function appendEnv(path: string, key: string, value: string): Promise<void> {
  const file = Bun.file(path);
  const existing = (await file.exists()) ? await file.text() : "";
  const lines = existing.split("\n").filter((l) => l.length > 0 && !l.startsWith(`${key}=`));
  lines.push(`${key}=${value}`);
  await Bun.write(path, lines.join("\n") + "\n");
}

if (import.meta.main) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first (see docs/module-planner-calendar-setup.md).");
    process.exit(1);
  }

  const server = Bun.serve({
    port: 0,
    fetch(req) {
      const code = new URL(req.url).searchParams.get("code");
      if (code) {
        (async () => {
          const redirectUri = `http://localhost:${server.port}`;
          const result = await exchangeCode({ clientId, clientSecret, code, redirectUri });
          if (result.ok) {
            await appendEnv(".env", "GOOGLE_REFRESH_TOKEN", result.refreshToken);
            console.log("\n✅ Saved GOOGLE_REFRESH_TOKEN to .env — calendar sync is live.\n");
          } else {
            console.error("\n❌ Token exchange failed:", result.error, "\n");
          }
          setTimeout(() => process.exit(result.ok ? 0 : 1), 200);
        })();
        return new Response("You can close this tab and return to the terminal.");
      }
      return new Response("Waiting for Google redirect…");
    },
  });

  const redirectUri = `http://localhost:${server.port}`;
  const consent = buildConsentUrl(clientId, redirectUri);
  console.log("\n1. Add this exact URI to your OAuth client's 'Authorized redirect URIs':\n   " + redirectUri);
  console.log("\n2. Then open this URL and approve:\n   " + consent + "\n");
}
