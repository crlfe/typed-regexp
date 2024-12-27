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

test("null prototype", () => {
  // While RegExp declares the groups and index.groups objects with a null
  // prototype, there is no support in TypeScript for actually declaring those
  // types: <https://github.com/microsoft/TypeScript/issues/1108>
  //
  // We could cludge it by adding `toString: never` and similar to the named
  // capture type (based on keyof typeof Object.prototype), but that clutters
  // the IDE auto-complete and defeats half the purpose of this library.

  expectTypeOf<
    Expand<ExecArray<["", "__proto__", "toString", "valueOf"], "">>
  >().toEqualTypeOf<
    string[] & {
      0: string;
      1: string;
      2: string;
      3: string;
      index: number;
      input: string;
      groups: {
        __proto__: string;
        toString: string;
        valueOf: string;
      };
    }
  >();
});
