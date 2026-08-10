// ==UserScript==
// @name         LeetCode → Review Board Sync
// @namespace    https://github.com/Jung028/leetcode-spaced-repetition-tool
// @version      3.2.0
// @description  Three always-available buttons on LeetCode problem pages: Add (save title/link/code, no scheduling effect), Completed (Pass), and Failed — Completed/Failed create the problem if it's new and immediately apply spaced repetition. Each action opens a one-click Google Calendar quick-add for the new review date. Also auto-resets the editor to default starter code the first time you open a problem in a tab, so review sessions never start by looking at a past attempt.
// @match        https://leetcode.com/problems/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      localhost
// ==/UserScript==

(function () {
  "use strict";

  // Change this if your review board runs on a different port (see index.ts / PORT).
  const APP_URL = "http://localhost:3000";

  // Monaco's internal language id doesn't always match LeetCode's own langSlug
  // (used by its codeSnippets API) — these two are the only ones that differ.
  const MONACO_TO_LEETCODE_SLUG = { python: "python3", go: "golang" };

  // --- Calendar quick-add (mirrors sydneyTime.ts / the openCalendarQuickAdd
  // helper in frontend.tsx — duplicated here since this file ships standalone,
  // not bundled through the app's build) ---

  const SYDNEY_FMT = new Intl.DateTimeFormat("en-US", {
    timeZone: "Australia/Sydney",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  function asUtcInstant(y, m, d, h, min, s) {
    return Date.UTC(y, m - 1, d, h, min, s);
  }

  function sydneyWallClockToUtc(dateStr, hour, minute) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const target = asUtcInstant(y, m, d, hour, minute, 0);
    let instant = target;
    for (let i = 0; i < 3; i++) {
      const parts = Object.fromEntries(
        SYDNEY_FMT.formatToParts(new Date(instant)).map((p) => [p.type, p.value]),
      );
      const shown = asUtcInstant(
        Number(parts.year),
        Number(parts.month),
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
        Number(parts.second),
      );
      const diff = target - shown;
      if (diff === 0) break;
      instant += diff;
    }
    return new Date(instant);
  }

  function toGoogleUtcStamp(date) {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  function addOneDay(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const next = new Date(y, m - 1, d + 1);
    const pad = (n) => String(n).padStart(2, "0");
    return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
  }

  function openCalendarQuickAdd(title, url, nextReview) {
    const start = sydneyWallClockToUtc(nextReview, 22, 0);
    const end = sydneyWallClockToUtc(addOneDay(nextReview), 0, 0);
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `LeetCode review: ${title}`,
      dates: `${toGoogleUtcStamp(start)}/${toGoogleUtcStamp(end)}`,
      details: `Open on LeetCode: ${url}`,
    });
    window.open(
      `https://calendar.google.com/calendar/render?${params.toString()}`,
      "_blank",
    );
  }

  const style = document.createElement("style");
  style.textContent = `
    .srs-btn {
      position: fixed;
      bottom: 20px;
      z-index: 9999;
      width: 48px;
      height: 48px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      color: #fff;
      font-size: 20px;
      line-height: 1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
      transition: transform 0.1s ease, opacity 0.2s ease;
    }
    .srs-btn:hover { transform: translateY(-2px) scale(1.05); }
    .srs-btn:disabled { opacity: 0.6; cursor: default; }
    #srs-add-btn { right: 20px; background: #2563eb; }
    #srs-pass-btn { right: 78px; background: #16a34a; }
    #srs-fail-btn { right: 136px; background: #dc2626; }
    #srs-toast {
      position: fixed;
      bottom: 78px;
      right: 20px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      padding: 10px 14px;
      border-radius: 8px;
      background: #262626;
      color: #eff2f6;
      border-left: 3px solid #ffa116;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      max-width: 280px;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }
    #srs-toast.show { opacity: 1; }
    #srs-toast.error { border-left-color: #ff375f; }
  `;
  document.head.appendChild(style);

  const addButton = document.createElement("button");
  addButton.id = "srs-add-btn";
  addButton.className = "srs-btn";
  addButton.textContent = "➕";
  addButton.title = "Add problem (title, link, current code) — no scheduling effect";
  document.body.appendChild(addButton);

  const passButton = document.createElement("button");
  passButton.id = "srs-pass-btn";
  passButton.className = "srs-btn";
  passButton.textContent = "✅";
  passButton.title = "Completed — adds it if new, then marks Passed";
  document.body.appendChild(passButton);

  const failButton = document.createElement("button");
  failButton.id = "srs-fail-btn";
  failButton.className = "srs-btn";
  failButton.textContent = "❌";
  failButton.title = "Failed — adds it if new, then marks Failed";
  document.body.appendChild(failButton);

  const allButtons = [addButton, passButton, failButton];

  const toast = document.createElement("div");
  toast.id = "srs-toast";
  document.body.appendChild(toast);

  let toastTimer;
  function showToast(message, isError) {
    toast.textContent = message;
    toast.classList.toggle("error", !!isError);
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 4500);
  }

  function slugFromLocation() {
    const match = location.pathname.match(/\/problems\/([a-z0-9-]+)/i);
    return match ? match[1] : null;
  }

  function graphql(query, variables) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "POST",
        url: "https://leetcode.com/graphql",
        headers: { "content-type": "application/json" },
        data: JSON.stringify({ query, variables }),
        onload: (res) => {
          try {
            const body = JSON.parse(res.responseText);
            if (body.errors && body.errors.length) reject(new Error(body.errors[0].message));
            else resolve(body.data);
          } catch (e) {
            reject(e);
          }
        },
        onerror: () => reject(new Error("Could not reach leetcode.com/graphql")),
      });
    });
  }

  const QUESTION_QUERY = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        titleSlug
        codeSnippets { lang langSlug code }
      }
    }
  `;

  function getMonacoModel() {
    const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    const models = win.monaco && win.monaco.editor.getModels();
    return models && models.length ? models[0] : null;
  }

  // Reads the current code + language directly from Monaco (the reliable
  // path); falls back to scraping the rendered lines if the page's Monaco
  // global can't be reached, since LeetCode's editor wrapper has shifted
  // across redesigns before.
  function readCurrentCode() {
    const model = getMonacoModel();
    if (model) {
      const monacoLang = model.getLanguageId();
      return {
        code: model.getValue(),
        langSlug: MONACO_TO_LEETCODE_SLUG[monacoLang] || monacoLang,
      };
    }
    const lines = Array.from(document.querySelectorAll(".view-lines .view-line"))
      .map((el) => el.textContent || "")
      .join("\n");
    return { code: lines, langSlug: null };
  }

  function postCapture(payload) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "POST",
        url: `${APP_URL}/api/capture`,
        headers: { "content-type": "application/json" },
        data: JSON.stringify(payload),
        onload: (res) => {
          if (res.status >= 200 && res.status < 300) {
            resolve(JSON.parse(res.responseText));
          } else {
            reject(new Error(`Review board responded ${res.status}`));
          }
        },
        onerror: () =>
          reject(new Error("Could not reach the review board — is `bun run dev` running?")),
      });
    });
  }

  // Resets the visible editor AND clears LeetCode's own localStorage cache for
  // this problem+language. Skipping the localStorage part means the reset only
  // looks like it worked: LeetCode's bootstrap JS silently restores the old
  // code from localStorage the next time this page loads.
  function resetEditor(questionId, langSlug, codeSnippets) {
    const snippet = codeSnippets.find((s) => s.langSlug === langSlug);
    if (!snippet) return;

    const model = getMonacoModel();
    if (model) model.setValue(snippet.code);

    const keyPrefix = `${questionId}_${langSlug}_`;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(keyPrefix)) localStorage.removeItem(key);
    }
  }

  function toastFor(result, captured) {
    const outcome = result === "pass" ? "passed" : result === "fail" ? "failed" : null;
    if (captured.created) {
      return outcome
        ? `Added & marked ${outcome} — next review ${captured.next_review}`
        : "Added to review board";
    }
    return outcome
      ? `Updated — ${outcome}, next review ${captured.next_review}`
      : "Saved — solution updated";
  }

  // Always available, all three: `result` is undefined for a plain Add
  // (create-or-update fields only, schedule untouched), or "pass"/"fail" for
  // Completed/Failed — which create the problem if it's new AND immediately
  // apply that result, since a successful first solve IS the first review.
  // Never silently assumes success.
  async function doSubmit(result) {
    for (const b of allButtons) b.disabled = true;
    try {
      const slug = slugFromLocation();
      if (!slug) throw new Error("Not on a LeetCode problem page");

      const { question } = await graphql(QUESTION_QUERY, { titleSlug: slug });
      const { code, langSlug } = readCurrentCode();
      const language =
        langSlug || (question.codeSnippets[0] && question.codeSnippets[0].langSlug) || "java";

      if (!code || !code.trim()) throw new Error("Editor looks empty — nothing to save");

      const payload = {
        title: question.title,
        url: `${location.origin}${location.pathname}`,
        solution: code,
        language,
      };
      if (result) payload.result = result;

      const captured = await postCapture(payload);
      showToast(toastFor(result, captured));
      openCalendarQuickAdd(captured.title, captured.url, captured.next_review);
      resetEditor(question.questionId, language, question.codeSnippets);
    } catch (err) {
      showToast((err && err.message) || "Something went wrong", true);
    } finally {
      for (const b of allButtons) b.disabled = false;
    }
  }

  addButton.addEventListener("click", () => doSubmit(undefined));
  passButton.addEventListener("click", () => doSubmit("pass"));
  failButton.addEventListener("click", () => doSubmit("fail"));

  function waitForMonacoModel(timeoutMs) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      (function poll() {
        const model = getMonacoModel();
        if (model) return resolve(model);
        if (Date.now() - start > timeoutMs) return reject(new Error("Monaco never loaded"));
        setTimeout(poll, 250);
      })();
    });
  }

  // Wipes the editor back to the default starter code the moment a problem
  // page is opened, so reviewing a problem never starts by looking at a
  // previous attempt. Gated on sessionStorage (not just "once ever") so an
  // accidental refresh mid-solve doesn't also nuke whatever you're currently
  // typing — only the first open of this problem in this browser tab resets.
  async function autoResetOnOpen() {
    const slug = slugFromLocation();
    if (!slug) return;

    const flagKey = `srs-auto-reset:${slug}`;
    if (sessionStorage.getItem(flagKey)) return;

    try {
      await waitForMonacoModel(15000);
      const { question } = await graphql(QUESTION_QUERY, { titleSlug: slug });
      const { langSlug } = readCurrentCode();
      const language =
        langSlug || (question.codeSnippets[0] && question.codeSnippets[0].langSlug);
      if (!language) return;

      resetEditor(question.questionId, language, question.codeSnippets);
      sessionStorage.setItem(flagKey, "1");
      showToast("Editor reset to default code for a fresh attempt");
    } catch (err) {
      // Silent: the manual buttons remain the fallback if e.g. Monaco is slow
      // to load or the GraphQL call fails, and a toast here would just be
      // background noise the user can't act on.
    }
  }

  autoResetOnOpen();
})();
