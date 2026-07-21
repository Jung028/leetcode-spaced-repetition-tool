import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-java";

export function highlightJava(code: string): string {
  return Prism.highlight(code, Prism.languages.java!, "java");
}
