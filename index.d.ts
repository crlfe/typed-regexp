import type { ParseCaptures } from "./types/parser";
import type { TypedRegExp as TypedRegExpType } from "./types/regexp";

/**
 * A strictly-typed wrapper for RegExp.
 */
export declare const TypedRegExp: {
  new <Pattern extends string>(
    pattern: Pattern,
  ): TypedRegExpType<ParseCaptures<Pattern>, "">;

  new <Pattern extends string, Flags extends string>(
    pattern: Pattern,
    flags: Flags,
  ): TypedRegExpType<ParseCaptures<Pattern>, Flags>;

  <Pattern extends string>(
    pattern: Pattern,
  ): TypedRegExpType<ParseCaptures<Pattern>, "">;

  <Pattern extends string, Flags extends string>(
    pattern: Pattern,
    flags: Flags,
  ): TypedRegExpType<ParseCaptures<Pattern>, Flags>;
};

export declare function concat<Strings extends string[]>(
  ...strings: Strings
): Join<Strings, "">;

export declare function join<Sep extends string, Strings extends string[]>(
  sep: Sep,
  ...strings: Strings
): Join<Strings, Sep>;

type Join<Strs, Sep = ""> = Strs extends readonly [infer Str, ...infer Rest]
  ? Rest extends []
    ? `${Str}`
    : `${Str}${Sep}${Join<Rest, Sep>}`
  : "";
