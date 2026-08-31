import { useEffect, useRef, useId } from "react";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "strict" });

// Renders Mermaid diagram syntax (flowchart/sequence/etc.) as inline SVG.
// mermaid.render() is async and keyed by a unique id per call — reusing one
// id across re-renders makes mermaid reuse a stale internal DOM node, so
// useId() gives each mounted instance its own.
export function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = `mermaid-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    let cancelled = false;
    mermaid
      .render(id, chart)
      .then(({ svg }) => {
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      })
      .catch((err) => {
        if (!cancelled && ref.current) ref.current.textContent = `Diagram failed to render: ${errorMessage(err)}`;
      });
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  return <div className="exam-diagram" ref={ref} />;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
