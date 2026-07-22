import { test, expect } from "bun:test";
import { highlightCode } from "./highlight";

test("wraps Java keywords in a keyword token span by default", () => {
  const html = highlightCode("public class Foo {}");
  expect(html).toContain('class="token keyword"');
  expect(html).toContain(">public<");
});

test("wraps string literals in a string token span", () => {
  const html = highlightCode('String s = "hi";', "java");
  expect(html).toContain('class="token string"');
});

test("escapes html-special characters instead of passing them through raw", () => {
  const html = highlightCode('String s = "<script>alert(1)</script>";', "java");
  expect(html).not.toContain("<script>");
  expect(html).toContain("&lt;");
});

test("highlights python using LeetCode's python3 language id", () => {
  const html = highlightCode("def two_sum():\n    pass", "python3");
  expect(html).toContain('class="token keyword"');
  expect(html).toContain(">def<");
});

test("highlights using LeetCode's golang language id as go", () => {
  const html = highlightCode('func main() {}', "golang");
  expect(html).toContain('class="token keyword"');
  expect(html).toContain(">func<");
});

test("falls back to clike tokenizing for an unrecognized language id", () => {
  // clike is Prism's minimal base grammar (no keyword list of its own),
  // so punctuation/class-name tokens are the observable signal it ran at all.
  const html = highlightCode("public class Foo {}", "some-made-up-lang");
  expect(html).toContain('class="token punctuation"');
});
