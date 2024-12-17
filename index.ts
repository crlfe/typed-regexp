import type { ParseCaptures } from "./types/parser";
import type { TypedRegExp as TypedRegExpType } from "./types/regexp";

/**
 * A strictly-typed wrapper for RegExp.
 */
export const TypedRegExp = RegExp as {
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
