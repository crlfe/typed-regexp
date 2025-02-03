/* Enhance String to support TypedRegExp arguments. */
declare global {
  interface String {
    match<Captures extends CaptureList, Flags extends string>(
      regexp: TypedRegExp<Captures, Flags>,
    ):
      | (Flags extends `${string}g${string}`
          ? string[]
          : Flags extends `${string}`
            ? Expand<ExecArray<Captures, Flags>>
            : unknown)
      | null;

    matchAll<Captures extends CaptureList, Flags extends string>(
      regexp: TypedRegExp<Captures, Flags>,
    ): RegExpStringIterator<Expand<ExecArray<Captures, Flags>>>;

    replace<Captures extends CaptureList, Flags extends string>(
      pattern: TypedRegExp<Captures, Flags>,
      replacement: StringReplacementCallback<Captures>,
    ): string;

    replaceAll<Captures extends CaptureList, Flags extends string>(
      pattern: TypedRegExp<Captures, Flags>,
      replacement: StringReplacementCallback<Captures>,
    ): string;
  }
}

type StringReplacementCallback<Captures> = (
  ...m: [
    ...{
      [Key in keyof Captures]: Key extends `${number}`
        ? Captures[Key] extends `${string}?`
          ? string | undefined
          : string
        : Captures[Key];
    },
    offset: number,
    string: string,
    groups: Expand<NamedCaptures<Captures, string>>,
  ]
) => string;

/**
 * An array of string literals describing the capture groups of a RegExp.
 *
 * Element '0' must be "" for the implicit capture of the entire match. Other
 * elements consist of the name of the capture group, if any, followed by a '?'
 * if the capture group might not be matched when the whole pattern is.
 */
export type CaptureList = string[];

// prettier-ignore
/**
 * Typed wrapper for the RegExp class.
 *
 * @template {CaptureList} Captures - Information about the RegExp capture groups.
 * @template {string} Flags - A string literal containing the RegExp flags.
 */
export type TypedRegExp<Captures extends CaptureList, Flags extends string>
  = Omit<RegExp, "exec">
  & {
    exec(source: string): null | Expand<ExecArray<Captures, Flags>>;
  };

// prettier-ignore
/**
 * Typed wrapper for the result of a successful `RegExp.exec` match.
 *
 * @template {CaptureList} Captures - Information about the RegExp capture groups.
 * @template {string} Flags - A string literal containing the RegExp flags.
 */
type ExecArray<Captures extends CaptureList, Flags extends string>
  = string[]
  & IndexedCaptures<Captures, string>
  & {
      index: number;
      input: string;
    }
  // If there are any named capture groups, the 'groups' property maps them to their values.
  & { [Key in "groups" as  keyof NamedCaptures<Captures, unknown> extends never ? never : Key]:
      Expand<NamedCaptures<Captures, string>> }

  // If indices are enabled in the flags ("d"), the 'indices' property reports them.
  & { [Key in "indices" as Flags extends `${string}d${string}` ? Key : never]:
      Expand<IndicesArray<Captures>> };

// prettier-ignore
/** Typed wrapper for the indices included with a successful `RegExp.exec` match. */
type IndicesArray<Captures extends CaptureList>
  = [number, number][]
  & IndexedCaptures<Captures, [number, number]>
  // If there are any named capture groups, the 'groups' property maps them to their indices.
  & { [Key in "groups" as keyof NamedCaptures<Captures, unknown> extends never ? never : Key]:
      Expand<NamedCaptures<Captures, [number, number]>> };

// prettier-ignore
/** Generates a field for each non-optional indexed captures containing the type T. */
type IndexedCaptures<Captures extends CaptureList, T>
  = string[] extends Captures ? Record<"0", T>
  : { [Key in keyof Captures as Key extends `${number}`
      ? Captures[Key] extends `${string}?` ? never : Key : never]: T };

// prettier-ignore
/**
 * Generates a field for each named capture, storing the type T and also
 * permitting undefined if the capture is optional.
 */
type NamedCaptures<Captures extends CaptureList, T>
  = string[] extends Captures ? Record<string, T | undefined>
  : { [Key in keyof Captures as Key extends `${number}`
      ? Captures[Key] extends "" | "?" ? never
        : Captures[Key] extends `${infer Base}?` ? Base
        : Captures[Key]
      : never]: Captures[Key] extends `${string}?` ? T | undefined : T };

// prettier-ignore
/**
 * Expands the type names shown in tooltips.
 *
 * If the specified type extends Array, those inherited keys will be collapsed
 * to display as something like 'string[] & { thisIsAnAddedKey: number }'.
 */
type Expand<T> = T extends (infer E)[]
  ? E[]
    & { [Key in keyof T as Key extends keyof E[] ? never : Key]: T[Key] }
  : { [Key in keyof T]: T[Key] };
