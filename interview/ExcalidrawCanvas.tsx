import React, { useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

function safeParseScene(scene: string | null): any {
  if (!scene) return null;
  try {
    return JSON.parse(scene);
  } catch {
    return null;
  }
}

export function ExcalidrawCanvas({
  initialScene,
  onChange,
}: {
  initialScene: string | null;
  onChange: (scene: string) => void;
}) {
  // Parsed once per mount — Excalidraw owns the live scene state after that;
  // this component only needs the parsed value to seed `initialData`. Typed
  // `any` (matching Task 1's spike) rather than a hand-written interface:
  // Excalidraw's real `ExcalidrawInitialDataState.elements` type is its own
  // internal `ExcalidrawElement[]`, which a plain JSON round-trip can't be
  // typed against without importing Excalidraw's internal types.
  const initialData = useRef<any>(safeParseScene(initialScene));

  return (
    <div className="interview-canvas">
      <Excalidraw
        initialData={initialData.current ?? undefined}
        onChange={(elements, appState) => {
          onChange(JSON.stringify({ elements, appState: { viewBackgroundColor: appState.viewBackgroundColor } }));
        }}
      />
    </div>
  );
}
