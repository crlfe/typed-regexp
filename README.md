# Typed RegExp

This library adds better tooltips and stricter types for regular expressions,
based on compile-time parsing in Typescript type declarations.

```Shell
npm i '@crlfe.ca/typed-regexp'
```

To use the bleeding-edge development version instead, you can install
directly from this git repository:

```Shell
npm i 'github:crlfe/typed-regexp'
```

Unfortunately, Typescript does not let us access tagged template literals or
regexp literals at compile-time, so you need to provide the input pattern as
a string literal:

```TypeScript
import { TypedRegExp } from "@crlfe.ca/typed-regexp";

// Double slash is needed before "s" to match whitespace.
const good = new TypedRegExp("(hello)\\s+(?<place>world)");
const goodMatch = good.exec("hello world");
if (goodMatch) {
  // Your IDE type hints and suggestions should work!
  console.log(goodMatch.groups.place);
}

// Only strings known at compile-time can be parsed.
const bad = new TypedRegExp("(hello)\\s+" + "(?<place>world)");
const badMatch = bad.exec("hello world");
if (badMatch) {
  // Your IDE can not help here, but the value is the same.
  console.log(badMatch.groups.place);
}
```

Because regular expressions can be large and complex, we provide wrappers
for some common string manipulation functions so that their values are
visible to the type system, and therefore to TypedRegExp:

```TypeScript
import { concat, join, TypedRegExp } from "@crlfe.ca/typed-regexp";

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
```
