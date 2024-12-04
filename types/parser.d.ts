/**
 * Parses a string literal containing a regular expression into an array
 * describing the capture groups.
 */
export type ParseCaptures<Str extends string> = string extends Str
  ? string[]
  : PC<Str, [], [""]>;

type State = ["(", number, number] | ["|", number] | [string];

// prettier-ignore
type PC<
  Str extends string,
  Sta extends State[],
  Dst extends string[]
>
  // Found a backslash escape; skip one extra character.
  = Str extends `\\${string}${infer Rest}` ? PC<Rest, Sta, Dst>

  // Parsing a character class "[...]".
  : Sta extends [["["], ...infer Pop extends State[]]
    // End the character class at "]".
    ? Str extends `]${infer Rest}` ? PC<Rest, Pop, Dst>
    // Skip other characters.
    : Str extends `${string}${infer Rest}` ? PC<Rest, Sta, Dst>
    // Pop an unterminated character class.
    : PC<Str, Pop, Dst>

  // Parsing a repetition count "{...}".
  : Sta extends [["{"], ...infer Pop extends State[]]
    // End the repetition count at "}".
    ? Str extends `}${infer Rest}` ? PC<Rest, Pop, Dst>
    // Skip other characters.
    : Str extends `${string}${infer Rest}` ? PC<Rest, Sta, Dst>
    // Pop an unterminated repetition count.
    : PC<Str, Pop, Dst>

  // Parsing in a group "(...)", a choice "...|...|...", or the top-level regexp.

  // End a group at ")"
  : Str extends `)${infer Rest}`
    // In a choice state; mark optional and pop without consuming the character.
    ? Sta extends [["|", infer Start extends number], ...infer Pop extends State[]]
      ? PC<Str, Pop, MarkOptional<Dst, Start>>
    // Ending a group state.
    : Sta extends [["(", infer Outer extends number, number], ...infer Pop extends State[]]
      // Look ahead for optional quantifiers.
      ? Str extends `)?${string}` | `)*${string}` | `){0,${string}`
        ? PC<Rest, Pop, MarkOptional<Dst, Outer>>
      // No optional quantifiers found.
      : PC<Rest, Pop, Dst>
    // Ignore unexpected ")" at top level.
    : PC<Rest, Sta, Dst>

  // Start a character class "[...".
  : Str extends `[${infer Rest}` ? PC<Rest, [["["], ...Sta], Dst>

  // Start a repetition count "{...".
  : Str extends `{${infer Rest}` ? PC<Rest, [["{"], ...Sta], Dst>

  // Start a special group "(?...".
  : Str extends `(?${infer Rest}`
    // Not a capture group; e.g. lookbehind "(?<=...)" or "(?<!...)"
    ? Str extends `(?<${NotNameChar}${string}`
      ? PC<Rest, [["(", Dst["length"], Dst["length"]], ...Sta], Dst>
    // Found a named capture group
    : Str extends `(?<${infer Name}>${infer Rest}`
      ? PC<Rest, [["(", Dst["length"], [...Dst, Name]["length"]], ...Sta], [...Dst, Name]>
    // Not a capture group; e.g. non-capturing group "(?:...)"
    : PC<Rest, [["(", Dst["length"], Dst["length"]], ...Sta], Dst>

  // Start a capture group "(..."
  : Str extends `(${infer Rest}`
    ? PC<Rest, [["(", Dst["length"], [...Dst, ""]["length"]], ...Sta], [...Dst, ""]>

  // Start a choice within the current group "|".
  : Str extends `|${infer Rest}`
    // Copy the inner position from current group state "(" to a choice state "|".
    ? Sta extends [["(", number, infer Inner extends number], ...State[]]
      ? PC<Rest, [["|", Inner], ...Sta], Dst>
    // Entering a choice at the top level, so always start with the first capture.
    : Sta extends [] ? PC<Rest, [["|", 1], ...Sta], Dst>
    // Already in a choice state.
    : PC<Rest, Sta, Dst>

  // Skip other characters.
  : Str extends `${string}${infer Rest}` ? PC<Rest, Sta, Dst>

  // At end of input.
  : Str extends ""
    // In a choice state, so mark optional and pop.
    ? Sta extends [["|", infer Start extends number], ...infer Pop extends State[]]
      ? PC<Str, Pop, MarkOptional<Dst, Start>>
    // Pop an unterminated group.
    : Sta extends [State, ...infer Pop extends State[]] ? PC<Str, Pop, Dst>
    // No more states, so return.
    : Dst

  // The input is not a string literal.
  : string[]
;

// prettier-ignore
type MarkOptional<Src extends string[], Start extends number, Dst extends string[] = []>
  // Have more elements to process.
  = Src extends [infer Head extends string, ...infer Rest extends string[]]
    // Have reached the requested start.
    ? Start extends 0 | Dst["length"]
      ? MarkOptional<Rest, 0, [...Dst, Head extends `${string}?` ? Head : `${Head}?`]>
    : MarkOptional<Rest, Start, [...Dst, Head]>
  // No more input, so return.
  : Dst

/**
 * ASCII symbols that are not part of a capture group name. This set consists
 * of all the printable characters except letters, numbers, and underscore.
 */
type NotNameChar = CharsOf<"!\"#$%&'()*+,-./:;<=>?@[\\]^`{|}~">;

/** Splits a string literal into the union of all its characters. */
type CharsOf<Str extends string> = Str extends `${infer Head}${infer Tail}`
  ? Head | CharsOf<Tail>
  : never;
