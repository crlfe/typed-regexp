import { expect, expectTypeOf, test } from "vitest";
import { TypedRegExp } from "..";

test("example", () => {
  // Double slash is needed before "s" to match whitespace.
  const good = new TypedRegExp("(hello)\\s+(?<place>world)");
  const goodMatch = good.exec("hello world");
  if (goodMatch) {
    // Your IDE type hints and suggestions should work!
    console.log(goodMatch.groups.place);
  }

  // Only string literals can be parsed.
  const bad = new TypedRegExp("(hello)\\s+" + "(?<place>world)");
  const badMatch = bad.exec("hello world");
  if (badMatch) {
    // Your IDE can not help here, but the value is the same.
    // @ts-expect-error{4111} A strict tsconfig requires ["place"].
    console.log(badMatch.groups.place);
  }
});

test("smoke", () => {
  const re = new TypedRegExp("(?:(?<fizz>fi)|(?<buzz>bu))(?<z>z+)", "g");
  const input = "fizzbuzzzz";

  let m = re.exec(input);
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

  m = re.exec(input);
  expect(m).toEqual(
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

// Assembling the pattern at runtime means we can not do compile-time parsing.
test("fallback", () => {
  const pattern = ["(?:(?<fizz>fi)", "(?<buzz>bu))(?<z>z+)"].join("|");
  const re = new TypedRegExp(pattern, "g");
  const input = "fizzbuzzzz";

  const m = re.exec(input);
  expectTypeOf(m).toEqualTypeOf<
    | (string[] & {
        0: string;
        index: number;
        input: string;
        groups: Record<string, string | undefined>;
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

// The "d" flag adds [start, end] indices for every capture group.
test("indices", () => {
  const re = new TypedRegExp("(a)(?<b>b)(c)?(?<d>d)?", "d");
  const input = "abcd";

  const m = re.exec(input);
  expectTypeOf(m).toEqualTypeOf<
    | (string[] & {
        0: string;
        1: string;
        2: string;
        index: number;
        input: string;
        groups: {
          b: string;
          d: string | undefined;
        };
        indices: [number, number][] & {
          0: [number, number];
          1: [number, number];
          2: [number, number];
          groups: {
            b: [number, number];
            d: [number, number] | undefined;
          };
        };
      })
    | null
  >();

  expect(m).toEqual(
    Object.assign(["abcd", "a", "b", "c", "d"], {
      index: 0,
      input,
      groups: {
        b: "b",
        d: "d",
      },
      indices: Object.assign(
        [
          [0, 4],
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
        ],
        {
          groups: {
            b: [1, 2],
            d: [3, 4],
          },
        },
      ),
    }),
  );
});

test("fallback indices", () => {
  const re = new TypedRegExp("(a)(?<b>b)" + "(c)?(?<d>d)?", "d");
  const input = "abcd";

  const m = re.exec(input);
  expectTypeOf(m).toEqualTypeOf<
    | (string[] & {
        0: string;
        index: number;
        input: string;
        groups: Record<string, string | undefined>;
        indices: [number, number][] & {
          0: [number, number];
          groups: Record<string, [number, number] | undefined>;
        };
      })
    | null
  >();

  expect(m).toEqual(
    Object.assign(["abcd", "a", "b", "c", "d"], {
      index: 0,
      input,
      groups: {
        b: "b",
        d: "d",
      },
      indices: Object.assign(
        [
          [0, 4],
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
        ],
        {
          groups: {
            b: [1, 2],
            d: [3, 4],
          },
        },
      ),
    }),
  );
});
