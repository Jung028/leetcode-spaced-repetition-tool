import { test, expect } from "bun:test";
import { highlightJava } from "./highlight";

test("wraps Java keywords in a keyword token span", () => {
  const html = highlightJava("public class Foo {}");
  expect(html).toContain('class="token keyword"');
  expect(html).toContain(">public<");
});

test("wraps string literals in a string token span", () => {
  const html = highlightJava('String s = "hi";');
  expect(html).toContain('class="token string"');
});

test("escapes html-special characters instead of passing them through raw", () => {
  const html = highlightJava('String s = "<script>alert(1)</script>";');
  expect(html).not.toContain("<script>");
  expect(html).toContain("&lt;");
});
