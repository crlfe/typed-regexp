import { concat, join, TypedRegExp } from "@crlfe.ca/typed-regexp";
import { expect, test } from "vitest";

// Based on: https://html.spec.whatwg.org/multipage/syntax.html

const DOCTYPE_LEGACY = `\\s+SYSTEM\\s+(?<doctypeSystem>"[^"]*"|'[^']*')`;
const DOCTYPE = `(?<doctype><!DOCTYPE\\s+html(?:${DOCTYPE_LEGACY})?\\s*>)`;

const TAG_NAME = `[0-9A-Za-z:\\-]+`; // TODO: Fix allowed characters.

const START_TAG_BEGIN = `<(?<startTag>${TAG_NAME})`;
const START_TAG_END = `(?<startSelfClosing>/)?(?<startTagEnd>>)`;

// TODO: Void tags and those with different text rules.

const END_TAG = `</(?<endTag>${TAG_NAME})\\s*>`;

const ATTR_NAME = `[0-9A-Za-z:\\-]+`; // TODO: Fix allowed characters.
const ATTR_UQ = `[^\\s"'=<>\`]+`;
const ATTR_SQ = `'[^']*'`;
const ATTR_DQ = `"[^"]*"`;
const ATTR_VALUE = `${ATTR_UQ}|${ATTR_SQ}|${ATTR_DQ}`;
const ATTR = concat(
  `(?<attrName>${ATTR_NAME})`,
  `(?:\\s*=\\s*(?<attrValue>${ATTR_VALUE}))?`,
);

const TEXT = `(?<text>[^<]+)`;
const CDATA = `<!\\[CDATA\\[(?<cdata>.*?)]]>`;
const COMMENT = `<!--(?<comment>.*?)-->`;

const HTML_PATTERN = new TypedRegExp(
  join("|", DOCTYPE, START_TAG_BEGIN, END_TAG, TEXT, CDATA, COMMENT),
  "iy",
);

const HTML_ATTR_PATTERN = new TypedRegExp(
  join("|", START_TAG_END, ATTR, "\\s+"),
  "iy",
);

type HtmlToken =
  | {
      kind: "doctype";
      system: string | null;
    }
  | {
      kind: "startTag";
      tag: string;
      attrs: Record<string, string | null>;
      selfClosing: boolean;
    }
  | { kind: "endTag"; tag: string }
  | { kind: "text" | "cdata" | "comment"; text: string };

function* tokenizeHtml(src: string): Generator<HtmlToken, void, void> {
  let last = 0;
  while (true) {
    HTML_PATTERN.lastIndex = last;
    const m = HTML_PATTERN.exec(src);
    if (!m) break;
    last = HTML_PATTERN.lastIndex;

    if (m.groups.doctype) {
      yield { kind: "doctype", system: m.groups.doctypeSystem ?? null };
    } else if (m.groups.startTag) {
      const attrs: Record<string, string | null> = {};
      let selfClosing = false;
      while (true) {
        HTML_ATTR_PATTERN.lastIndex = last;
        const m = HTML_ATTR_PATTERN.exec(src);
        if (!m) break;
        last = HTML_ATTR_PATTERN.lastIndex;

        if (m.groups.attrName) {
          let value = null;
          if (m.groups.attrValue) {
            value = m.groups.attrValue.replace(/^(['"])(.*)\1/, "$2");
          }
          attrs[m.groups.attrName] = value;
        } else if (m.groups.startTagEnd) {
          selfClosing = !!m.groups.startSelfClosing;
          break;
        }
      }
      yield { kind: "startTag", tag: m.groups.startTag, attrs, selfClosing };
    } else if (m.groups.endTag) {
      yield { kind: "endTag", tag: m.groups.endTag };
    } else if (m.groups.text) {
      const trimmed = m.groups.text.trim();
      if (trimmed) {
        yield { kind: "text", text: trimmed };
      }
    } else if (m.groups.cdata) {
      yield { kind: "cdata", text: m.groups.cdata };
    } else if (m.groups.comment) {
      yield { kind: "comment", text: m.groups.comment };
    }
  }
}

test("simple html", () => {
  const input = `\
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script type="module" src="dist/app.js"></script>
  </head>
  <body></body>
</html>
`;

  const tokens = Array.from(tokenizeHtml(input));
  expect(tokens).toEqual([
    { kind: "doctype", system: null },
    { kind: "startTag", tag: "html", attrs: {}, selfClosing: false },
    { kind: "startTag", tag: "head", attrs: {}, selfClosing: false },
    {
      kind: "startTag",
      tag: "meta",
      attrs: { charset: "utf-8" },
      selfClosing: true,
    },
    {
      kind: "startTag",
      tag: "meta",
      attrs: {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      selfClosing: true,
    },
    {
      kind: "startTag",
      tag: "script",
      attrs: { type: "module", src: "dist/app.js" },
      selfClosing: false,
    },
    { kind: "endTag", tag: "script" },
    { kind: "endTag", tag: "head" },
    { kind: "startTag", tag: "body", attrs: {}, selfClosing: false },
    { kind: "endTag", tag: "body" },
    { kind: "endTag", tag: "html" },
  ]);
});
