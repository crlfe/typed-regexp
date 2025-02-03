import { expect, expectTypeOf, test } from "vitest";
import { TypedRegExp } from "..";

test("match non-global", () => {
  const re = new TypedRegExp("(?:(?<fizz>fi)|(?<buzz>bu))(?<z>z+)", "");
  const input = "fizzbuzzzz";

  const m = input.match(re);
  expectTypeOf(m).toEqualTypeOf<
    | (string[] & {
        0: string;
        3: string;
        index: number;
        input: string;
        groups: {
          fizz: string | undefined;
          buzz: string | undefined;
          z: string;
        };
      })
    | null
  >();

  expect(m).toEqual(
    Object.assign(["fizz", "fi", undefined, "zz"], {
      index: 0,
      input,
      groups: {
        fizz: "fi",
        buzz: undefined,
        z: "zz",
      },
    }),
  );
});

test("match non-global empty", () => {
  const re = new TypedRegExp("(?:(?<fizz>fi)|(?<buzz>bu))(?<z>z+)", "");
  const input = "fuzzbizzzz";

  const m = input.match(re);
  expectTypeOf(m).toEqualTypeOf<
    | (string[] & {
        0: string;
        3: string;
        index: number;
        input: string;
        groups: {
          fizz: string | undefined;
          buzz: string | undefined;
          z: string;
        };
      })
    | null
  >();
  expect(m).toBeNull();
});

test("match global", () => {
  const re = new TypedRegExp("(?:(?<fizz>fi)|(?<buzz>bu))(?<z>z+)", "g");
  const input = "fizzbuzzzz";

  const matches = input.match(re);
  expect(matches).toHaveLength(2);
  expect(matches).toEqual(["fizz", "buzzzz"]);
});

test("match global empty", () => {
  const re = new TypedRegExp("(?:(?<fizz>fi)|(?<buzz>bu))(?<z>z+)", "g");
  const input = "fuzzbizzzz";

  const matches = input.match(re);
  expect(matches).toBeNull();
});

test("matchAll", () => {
  const re = new TypedRegExp("(?:(?<fizz>fi)|(?<buzz>bu))(?<z>z+)", "g");
  const input = "fizzbuzzzz";

  const matches = Array.from(input.matchAll(re));
  expectTypeOf(matches).toEqualTypeOf<
    (string[] & {
      0: string;
      3: string;
      index: number;
      input: string;
      groups: {
        fizz: string | undefined;
        buzz: string | undefined;
        z: string;
      };
    })[]
  >();
  expect(matches).toHaveLength(2);
  expect(matches[0]).toEqual(
    Object.assign(["fizz", "fi", undefined, "zz"], {
      index: 0,
      input,
      groups: {
        fizz: "fi",
        buzz: undefined,
        z: "zz",
      },
    }),
  );
  expect(matches[1]).toEqual(
    Object.assign(["buzzzz", undefined, "bu", "zzzz"], {
      index: 4,
      input,
      groups: {
        fizz: undefined,
        buzz: "bu",
        z: "zzzz",
      },
    }),
  );
});

test("replace non-global", () => {
  const re = new TypedRegExp("(?:(?<fizz>fi)|(?<buzz>bu))(?<z>z+)", "");
  const input = "fizzbuzzzz";

  const calls: unknown[] = [];
  const result = input.replace(re, (...args) => {
    expectTypeOf(args).toEqualTypeOf<
      [
        // Tuple labels can not be set or checked by the TS type system.
        // So the closest we can get for match and p# is m_0, m_1, etc.
        match: string,
        p1: string | undefined,
        p2: string | undefined,
        p3: string,
        offset: number,
        string: string,
        groups: {
          fizz: string | undefined;
          buzz: string | undefined;
          z: string;
        },
      ]
    >();
    calls.push(args);
    return "wut";
  });
  expect(result).toEqual("wutbuzzzz");
  expect(calls).toEqual([
    [
      "fizz",
      "fi",
      undefined,
      "zz",
      0,
      input,
      { fizz: "fi", buzz: undefined, z: "zz" },
    ],
  ]);
});

test("replace global", () => {
  const re = new TypedRegExp("(?:(?<fizz>fi)|(?<buzz>bu))(?<z>z+)", "g");
  const input = "fizzbuzzzz";

  const calls: unknown[] = [];
  const result = input.replace(re, (...args) => {
    expectTypeOf(args).toEqualTypeOf<
      [
        // Tuple labels can not be set or checked by the TS type system.
        // So the closest we can get for match and p# is m_0, m_1, etc.
        match: string,
        p1: string | undefined,
        p2: string | undefined,
        p3: string,
        offset: number,
        string: string,
        groups: {
          fizz: string | undefined;
          buzz: string | undefined;
          z: string;
        },
      ]
    >();
    calls.push(args);
    return "wut";
  });
  expect(result).toEqual("wutwut");
  expect(calls).toEqual([
    [
      "fizz",
      "fi",
      undefined,
      "zz",
      0,
      input,
      { fizz: "fi", buzz: undefined, z: "zz" },
    ],
    [
      "buzzzz",
      undefined,
      "bu",
      "zzzz",
      4,
      input,
      { fizz: undefined, buzz: "bu", z: "zzzz" },
    ],
  ]);
});

test("replaceAll global", () => {
  const re = new TypedRegExp("(?:(?<fizz>fi)|(?<buzz>bu))(?<z>z+)", "g");
  const input = "fizzbuzzzz";

  const calls: unknown[] = [];
  const result = input.replaceAll(re, (...args) => {
    expectTypeOf(args).toEqualTypeOf<
      [
        // Tuple labels can not be set or checked by the TS type system.
        // So the closest we can get for match and p# is m_0, m_1, etc.
        match: string,
        p1: string | undefined,
        p2: string | undefined,
        p3: string,
        offset: number,
        string: string,
        groups: {
          fizz: string | undefined;
          buzz: string | undefined;
          z: string;
        },
      ]
    >();
    calls.push(args);
    return "wut";
  });
  expect(result).toEqual("wutwut");
  expect(calls).toEqual([
    [
      "fizz",
      "fi",
      undefined,
      "zz",
      0,
      input,
      { fizz: "fi", buzz: undefined, z: "zz" },
    ],
    [
      "buzzzz",
      undefined,
      "bu",
      "zzzz",
      4,
      input,
      { fizz: undefined, buzz: "bu", z: "zzzz" },
    ],
  ]);
});
