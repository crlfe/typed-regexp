These d.ts files often disable the automatic code formater because manual
layout is our only hope to make the deeply-nested type definitions even
vaguely comprehensible.

In general, follow the prettier behavior. Where an override is necessary,
use a two-space indent and put wrapped binary operators at the start of a
line. Ternary operators are nested very deeply so, unlike the normal
conventions, the condition and then ("?") expression may be kept on one
line, and the else (":") expression need not be indented deeper than the
condition.
