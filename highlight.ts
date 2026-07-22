import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-python";
import "prismjs/components/prism-go";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-markup-templating";
import "prismjs/components/prism-php";
import "prismjs/components/prism-typescript";

// Maps LeetCode's own language ids to Prism's grammar keys.
const LANGUAGE_ALIASES: Record<string, string> = {
  python3: "python",
  golang: "go",
  csharp: "csharp",
  javascript: "javascript",
  typescript: "typescript",
};

export function highlightCode(code: string, language: string = "java"): string {
  const prismLang = LANGUAGE_ALIASES[language] ?? language;
  const grammar = Prism.languages[prismLang] ?? Prism.languages.clike!;
  return Prism.highlight(code, grammar, prismLang);
}
