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
//# sourceMappingURL=index.d.ts.map
