import { describe, expect, expectTypeOf, test } from "vitest";
import { TypedRegExp } from "@crlfe.ca/typed-regexp";

// prettier-ignore
describe("examples", () => {
  test("concat", () => {
    const what = new TypedRegExp("".concat(
      "hello",
      "\\s+",
      "(?<place>world)",
    ));

    const whatMatch = what.exec("hello world");
    if (whatMatch) {
      // Your IDE type hints and suggestions should work!
      console.log(whatMatch.groups.place);
    }
  });

  test("join", () => {
    // The "as const" following the array is required to keep TypeScript
    // from simplifying the ["...", "..."] tuple to string[].
    const fancy = new TypedRegExp(([
      "(?<fizz>fizz)",
      "(?<buzz>buzz)",
    ] as const).join("|"));

    const fancyMatch = fancy.exec("buzz");
    if (fancyMatch) {
      // Your IDE type hints and suggestions should work!
      console.log(fancyMatch.groups);
    }
  });
});

test("join", () => {
  // Without a const, literal tuples will degrade to array.
  expectTypeOf(["a", "b"]).toEqualTypeOf<string[]>();
  expectTypeOf(["a", "b"]).not.toEqualTypeOf<[string, string]>();
  expectTypeOf(["a", "b"] as const).toEqualTypeOf<readonly ["a", "b"]>();

  // Our enhanced declaration can join literal tuples.
  expectTypeOf((["a", "b"] as const).join()).toEqualTypeOf<"a,b">();
  expectTypeOf((["a", "b"] as const).join("")).toEqualTypeOf<"ab">();
  expectTypeOf((["a", "b"] as const).join("|")).toEqualTypeOf<"a|b">();
});

test("regexp from join", () => {
  const re = new TypedRegExp((["(?<fizz>fi)", "(?<buzz>bu)"] as const).join());
  const input = "fi,bu";
  const m = re.exec(input);
  expectTypeOf(m).toEqualTypeOf<
    | (string[] & {
        0: string;
        1: string;
        2: string;
        index: number;
        input: string;
        groups: {
          fizz: string;
          buzz: string;
        };
      })
    | null
  >();
  expect(m).toEqual(
    Object.assign(["fi,bu", "fi", "bu"], {
      index: 0,
      input,
      groups: { fizz: "fi", buzz: "bu" },
    }),
  );
});

test("concat", () => {
  // Without a const, literal values will degrade to string.
  expectTypeOf("a").toEqualTypeOf<string>();
  expectTypeOf("a").not.toEqualTypeOf<["a"]>();
  expectTypeOf("a" as const).toEqualTypeOf<"a">();

  // However, we can still grab the literal value of this.
  expectTypeOf("a".concat("bc", "d")).toEqualTypeOf<"abcd">();

  // Or use strings that are marked const.
  const a = "fizz" as const;
  const b = "buzz" as const;
  expectTypeOf(a.concat(b)).toEqualTypeOf<"fizzbuzz">();
});

test("regexp from concat", () => {
  const re = new TypedRegExp("(".concat("fi", ")(?<", "z>z+)"));
  const input = "fizzz";
  const m = re.exec(input);
  expectTypeOf(m).toEqualTypeOf<
    | (string[] & {
        0: string;
        1: string;
        2: string;
        index: number;
        input: string;
        groups: {
          z: string;
        };
      })
    | null
  >();
});

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
