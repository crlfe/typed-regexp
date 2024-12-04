import { test, expectTypeOf } from "vitest";
import type { ParseCaptures } from "./parser.js";

test("smoke", () => {
  expectTypeOf<ParseCaptures<"">>().toEqualTypeOf<[""]>();
  expectTypeOf<ParseCaptures<"a">>().toEqualTypeOf<[""]>();
  expectTypeOf<ParseCaptures<"(a)b">>().toEqualTypeOf<["", ""]>();
  expectTypeOf<ParseCaptures<"a(b)">>().toEqualTypeOf<["", ""]>();
  expectTypeOf<ParseCaptures<"(a)(b)">>().toEqualTypeOf<["", "", ""]>();
  expectTypeOf<ParseCaptures<"(?<x>a)b">>().toEqualTypeOf<["", "x"]>();
  expectTypeOf<ParseCaptures<"a(?<y>b)">>().toEqualTypeOf<["", "y"]>();
  expectTypeOf<ParseCaptures<"(?<x>a)(?<y>b)">>().toEqualTypeOf<
    ["", "x", "y"]
  >();
});

test("fallback", () => {
  expectTypeOf<ParseCaptures<string>>().toEqualTypeOf<string[]>();
});

test("choice", () => {
  expectTypeOf<ParseCaptures<"a|b|c">>().toEqualTypeOf<[""]>();
  expectTypeOf<ParseCaptures<"(a)|b|c">>().toEqualTypeOf<["", "?"]>();
  expectTypeOf<ParseCaptures<"a|(b)|c">>().toEqualTypeOf<["", "?"]>();
  expectTypeOf<ParseCaptures<"a|b|(c)">>().toEqualTypeOf<["", "?"]>();
  expectTypeOf<ParseCaptures<"(a)|(b)|c">>().toEqualTypeOf<["", "?", "?"]>();
  expectTypeOf<ParseCaptures<"a|(b)|(c)">>().toEqualTypeOf<["", "?", "?"]>();
  expectTypeOf<ParseCaptures<"(a)|b|(c)">>().toEqualTypeOf<["", "?", "?"]>();
  expectTypeOf<ParseCaptures<"(a|b)|c">>().toEqualTypeOf<["", "?"]>();
  expectTypeOf<ParseCaptures<"a|(b|c)">>().toEqualTypeOf<["", "?"]>();

  expectTypeOf<ParseCaptures<"((a|b|c))">>().toEqualTypeOf<["", "", ""]>();
  expectTypeOf<ParseCaptures<"((a)|b|c)">>().toEqualTypeOf<["", "", "?"]>();
  expectTypeOf<ParseCaptures<"(a|(b)|c)">>().toEqualTypeOf<["", "", "?"]>();
  expectTypeOf<ParseCaptures<"(a|b|(c))">>().toEqualTypeOf<["", "", "?"]>();
  expectTypeOf<ParseCaptures<"((a)|(b)|c)">>().toEqualTypeOf<
    ["", "", "?", "?"]
  >();
  expectTypeOf<ParseCaptures<"(a|(b)|(c))">>().toEqualTypeOf<
    ["", "", "?", "?"]
  >();
  expectTypeOf<ParseCaptures<"((a)|b|(c))">>().toEqualTypeOf<
    ["", "", "?", "?"]
  >();
  expectTypeOf<ParseCaptures<"((a|b)|c)">>().toEqualTypeOf<["", "", "?"]>();
  expectTypeOf<ParseCaptures<"(a|(b|c))">>().toEqualTypeOf<["", "", "?"]>();
});

test("quantifiers", () => {
  expectTypeOf<ParseCaptures<"(a)?">>().toEqualTypeOf<["", "?"]>();
  expectTypeOf<ParseCaptures<"(a)*">>().toEqualTypeOf<["", "?"]>();
  expectTypeOf<ParseCaptures<"(a){0,9}">>().toEqualTypeOf<["", "?"]>();
  expectTypeOf<ParseCaptures<"(a){1,9}">>().toEqualTypeOf<["", ""]>();

  expectTypeOf<ParseCaptures<"(?<x>a)?">>().toEqualTypeOf<["", "x?"]>();
  expectTypeOf<ParseCaptures<"(?<x>a)*">>().toEqualTypeOf<["", "x?"]>();
  expectTypeOf<ParseCaptures<"(?<x>a){0,9}">>().toEqualTypeOf<["", "x?"]>();
  expectTypeOf<ParseCaptures<"(?<x>a){1,9}">>().toEqualTypeOf<["", "x"]>();

  expectTypeOf<ParseCaptures<"(a)(b)?(c)">>().toEqualTypeOf<
    ["", "", "?", ""]
  >();
  expectTypeOf<ParseCaptures<"(a)(b)*(c)">>().toEqualTypeOf<
    ["", "", "?", ""]
  >();
  expectTypeOf<ParseCaptures<"(a)(b){0,9}(c)">>().toEqualTypeOf<
    ["", "", "?", ""]
  >();
  expectTypeOf<ParseCaptures<"(a)(b){1,9}(c)">>().toEqualTypeOf<
    ["", "", "", ""]
  >();

  expectTypeOf<ParseCaptures<"(a)(?<x>b)?(c)">>().toEqualTypeOf<
    ["", "", "x?", ""]
  >();
  expectTypeOf<ParseCaptures<"(a)(?<x>b)*(c)">>().toEqualTypeOf<
    ["", "", "x?", ""]
  >();
  expectTypeOf<ParseCaptures<"(a)(?<x>b){0,9}(c)">>().toEqualTypeOf<
    ["", "", "x?", ""]
  >();
  expectTypeOf<ParseCaptures<"(a)(?<x>b){1,9}(c)">>().toEqualTypeOf<
    ["", "", "x", ""]
  >();
});

test("duplicate names", () => {
  expectTypeOf<ParseCaptures<"(?<x>a)|(?<x>b)">>().toEqualTypeOf<
    ["", "x?", "x?"]
  >();
});

test("character classes", () => {
  expectTypeOf<ParseCaptures<"(a)[b](c)">>().toEqualTypeOf<["", "", ""]>();
  expectTypeOf<ParseCaptures<"[(?<a>)](?<b>)">>().toEqualTypeOf<["", "b"]>();
  expectTypeOf<ParseCaptures<"[\\](?<a>)](?<b>)">>().toEqualTypeOf<["", "b"]>();

  // Named character classes (e.g. "[:alnum:]") are not supported by the
  // standard Javascript Regexp, so the first closing bracket should end the
  // character class and find our capture group.
  expectTypeOf<ParseCaptures<"[[:alnum:](?<a>)]">>().toEqualTypeOf<["", "a"]>();
});
