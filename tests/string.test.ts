import { describe, expect, expectTypeOf, test } from "vitest";
import { concat, join, TypedRegExp } from "@crlfe.ca/typed-regexp";

describe("examples", () => {
  // Extra whitespace for README example.
  // prettier-ignore
  test("concat", () => {
    const what = new TypedRegExp(
      concat(
        "hello",
        "\\s+",
        "(?<place>world)"
      )
    );

    const whatMatch = what.exec("hello world");
    if (whatMatch) {
      // Your IDE type hints and suggestions should work!
      console.log(whatMatch.groups.place);
    }
  });

  // Extra whitespace for README example.
  // prettier-ignore
  test("join", () => {
    const fancy = new TypedRegExp(
      join("|",
        "(?<fizz>fizz)",
        "(?<buzz>buzz)"
      )
    );

    const fancyMatch = fancy.exec("buzz");
    if (fancyMatch) {
      // Your IDE type hints and suggestions should work!
      console.log(fancyMatch.groups);
    }
  });
});

test("join", () => {
  // Our enhanced declaration can join literal strings.
  expectTypeOf(join(",", "a", "b")).toEqualTypeOf<"a,b">();
  expectTypeOf(join("", "a", "b")).toEqualTypeOf<"ab">();
  expectTypeOf(join("|", "a", "b")).toEqualTypeOf<"a|b">();
});

test("regexp from join", () => {
  const re = new TypedRegExp(join(",", "(?<fizz>fi)", "(?<buzz>bu)"));
  const input = "fi,bu";
  const m = re.exec(input);
  expectTypeOf(m).toEqualTypeOf<
    | (string[] & {
        0: string;
        1: string;
        2: string;
        length: 3;
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

  // However, we can still grab the literal values with a function.
  expectTypeOf(concat("a", "bc", "d")).toEqualTypeOf<"abcd">();

  // Or use strings that are marked const.
  const a = "fizz" as const;
  const b = "buzz" as const;
  expectTypeOf(concat(a, b)).toEqualTypeOf<"fizzbuzz">();
});

test("regexp from concat", () => {
  const re = new TypedRegExp(concat("(", "fi", ")(?<", "z>z+)"));
  const input = "fizzz";
  const m = re.exec(input);
  expectTypeOf(m).toEqualTypeOf<
    | (string[] & {
        0: string;
        1: string;
        2: string;
        length: 3;
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
        length: 4;
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
        length: 4;
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
      length: 4;
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
