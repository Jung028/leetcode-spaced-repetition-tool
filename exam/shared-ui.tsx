import React from "react";

const EXCALIDRAW_URL = "https://excalidraw.com";

export function DrawingLink() {
  return (
    <a className="exam-diagram-link" href={EXCALIDRAW_URL} target="_blank" rel="noreferrer">
      Open Excalidraw to sketch this ↗
    </a>
  );
}

// Question prompts/model answers sometimes embed a real code/data snippet
// (e.g. tracely's code-reading questions) as a blank-line-separated block
// within an otherwise plain-English string — there's no markdown fence
// convention in the content, so a multi-line block containing code-ish
// punctuation is rendered in a monospace <pre> block; everything else stays
// normal wrapped prose.
function looksLikeCode(block: string): boolean {
  return block.includes("\n") && /[{}()_]|:=|==|=>|\b(def|class|import|return)\b/.test(block);
}

export function PromptText({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text.split(/\n\n+/).map((block, i) =>
        looksLikeCode(block) ? (
          <pre key={i} className="exam-code-block">{block}</pre>
        ) : (
          <p key={i} className={className} style={{ whiteSpace: "pre-wrap" }}>
            {block}
          </p>
        ),
      )}
    </>
  );
}
