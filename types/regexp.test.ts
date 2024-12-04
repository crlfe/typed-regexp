import { test, expectTypeOf } from "vitest";
import type { ExecArray, Expand } from "./regexp.js";

test("smoke", () => {
  expectTypeOf<Expand<ExecArray<[""], "">>>().toEqualTypeOf<
    string[] & { 0: string; index: number; input: string }
  >();
  expectTypeOf<
    Expand<ExecArray<["", "", "?", "foo", "bar?"], "">>
  >().toEqualTypeOf<
    string[] & {
      0: string;
      1: string;
      3: string;
      index: number;
      input: string;
      groups: {
        foo: string;
        bar: string | undefined;
      };
    }
  >();
});

test("fallback", () => {
  expectTypeOf<Expand<ExecArray<string[], "">>>().toEqualTypeOf<
    string[] & {
      0: string;
      index: number;
      input: string;
      groups: Record<string, string | undefined>;
    }
  >();
});
