# Typed RegExp

This library adds better tooltips and stricter types for regular expressions,
based on compile-time parsing in Typescript type declarations.

Install "typed-regexp" directly from this repository:

    npm i '@crlfe.ca/typed-regexp'

Unfortunately, Typescript does not let us access tagged template literals or
regexp literals at compile-time, so you need to provide the input pattern as
a string literal:

    import { parse } from "typed-regexp";

    // Double slash is needed before "s" to match whitespace.
    const good = parse("(hello)\\s+(?<place>world)");
    const goodMatch = good.exec("hello world");
    if (goodMatch) {
      // Your IDE type hints and suggestions should work!
      console.log(goodMatch.groups.place);
    }

    // Only string literals can not be parsed.
    const bad = parse("(hello)\\s+" + "(?<place>world)");
    const badMatch = bad.exec("hello world");
    if (badMatch) {
      // Your IDE can not help here, but the value is the same.
      console.log(badMatch.groups.place);
    }
