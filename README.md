# Typed RegExp

This library adds better tooltips and stricter types for regular expressions,
based on compile-time parsing in Typescript type declarations.

    npm i '@crlfe.ca/typed-regexp'

To use the bleeding-edge development version instead, you can install
directly from this git repository:

    npm i github:crlfe/typed-regexp

Unfortunately, Typescript does not let us access tagged template literals or
regexp literals at compile-time, so you need to provide the input pattern as
a string literal:

    import { TypedRegExp } from "@crlfe.ca/typed-regexp";

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
      console.log(badMatch.groups.place);
    }

We have experimentally extended the global String.concat and
ReadonlyArray.join declarations to produce string literals that also work:

    const what = new TypedRegExp("".concat(
      "hello",
      "\\s+",
      "(?<place>world)",
    ));

    const whatMatch = what.exec("hello world");
    if (whatMatch) {
      // Your IDE type hints and suggestions should work!
      console.log(whatMatch.groups.place);
    }

    // The "as const" following the array is required to keep TypeScript
    // from simplifying the ["...", "..."] tuple to string[].
    const fancy = new TypedRegExp(([
      "(?<fizz>fizz)",
      "(?<buzz>buzz)",
    ] as const).join("|"));

    const fancyMatch = fancy.exec("buzz");
    if (fancyMatch) {
      // Your IDE type hints and suggestions should work!
      console.log(fancyMatch.groups);
    }
