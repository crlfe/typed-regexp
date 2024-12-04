import type { ParseCaptures } from "./types/parser";
import type { TypedRegExp } from "./types/regexp";

/**
 * Create a strictly-typed wrapper for a new RegExp.
 */
export function parse<Pattern extends string, Flags extends string = "">(
  pattern: Pattern,
  flags?: Flags,
): TypedRegExp<ParseCaptures<Pattern>, Flags> {
  return new RegExp(pattern, flags || "") as TypedRegExp<
    ParseCaptures<Pattern>,
    Flags
  >;
}
