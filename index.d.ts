import type { ParseCaptures } from "./lib/parser.d.ts";
import type { TypedRegExp } from "./lib/regexp.d.ts";

/**
 * Create a strictly-typed wrapper for a new RegExp.
 */
export declare function parse<
  Pattern extends string,
  Flags extends string = "",
>(pattern: Pattern, flags?: Flags): TypedRegExp<ParseCaptures<Pattern>, Flags>;
