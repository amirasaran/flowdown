# Directives

Directives are the library's escape hatch for embedding **custom components** — charts, canvases, price tickers, pollable tool calls — directly inside markdown. They are designed to be readable both for humans and for an AI that emits them.

## Syntax

### Block directive

```
:::name{key=value key2="quoted value" flag}
optional body
:::
```

- Opens with three colons, a name, and optional `{attributes}`.
- Closes with three colons on a line of their own.
- The body between them is either **raw text** (opaque directives) or **nested markdown** (prose directives).

### Inline directive

```
:name[label]{attrs}
```

- Single colon, name, optional `[label]`, optional `{attrs}`.
- Appears inline in a paragraph, heading, or list item.

### Attribute grammar

```
attrs   ::=  attr (whitespace attr)*
attr    ::=  key              // → { key: true }
           | key=bare         // → { key: "bare" or number or boolean }
           | key="double"     // → { key: "double" }
           | key='single'     // → { key: "single" }
```

Numbers (`-?\d+(\.\d+)?`) auto-coerce to `number`. `true`/`false` coerce to `boolean`. Everything else stays a string.

## Registering a directive

```tsx
import type { DirectiveComponentProps } from 'llm-markdown/web';

function PriceCard({ attributes, theme }: DirectiveComponentProps) {
  const symbol = String(attributes.symbol ?? '—');
  return <span style={{ color: theme.colors.accent }}>{symbol}</span>;
}

<LLMMarkdown
  text={text}
  directives={{ price: PriceCard }}
/>;
```

Markdown input:

```
The current price of :price{symbol=AAPL} looks healthy.
```

## Opaque vs. prose body

By default the library marks four directive names as **opaque** — their body is not re-parsed as markdown, you get the raw string:

- `chart`
- `canvas`
- `mermaid`
- `math`

Everything else gets a **prose body** — the body is parsed as markdown and handed to your component as rendered `children`.

```tsx
// opaque body: receive `value`
function Chart({ attributes, value, theme }: DirectiveComponentProps) {
  const data = JSON.parse(value ?? '{}');
  return <BarChart data={data} />;
}

// prose body: receive `children`
function Callout({ attributes, children, theme }: DirectiveComponentProps) {
  return <div className={`callout-${attributes.tone}`}>{children}</div>;
}
```

If you need a new directive with an opaque body, export it from a forked `directives.ts` or wrap your registry:

```ts
import { OPAQUE_BODY_DIRECTIVES } from 'llm-markdown';
OPAQUE_BODY_DIRECTIVES.add('svg');
```

## Examples

### Chart directive

```
:::chart{type=bar title="Quarterly revenue"}
{"data":[{"label":"Q1","value":12},{"label":"Q2","value":19},{"label":"Q3","value":9},{"label":"Q4","value":24}]}
:::
```

```tsx
function Chart({ attributes, value, theme }: DirectiveComponentProps) {
  const { data } = JSON.parse(value ?? '{"data":[]}');
  return <BarChart data={data} title={attributes.title as string} />;
}
```

### Callout directive (prose body)

```
:::callout{tone=info title="Heads up"}
Callouts render **markdown** inside their body, so you get:

- lists
- [links](https://example.com)
- \`code\`

for free.
:::
```

### Inline badge

```
This message is classified :badge{level=warn}internal only:badge{}.
```

## AI prompting tips

When you expect an AI to emit directives, include one example per directive in the system prompt and specify:

1. The directive **name** and **attribute names** (the library does not validate attribute schemas — your component does).
2. Whether the body is **JSON, raw text, or markdown** (opaque vs prose).
3. That the directive **must be closed** (`:::` on its own line), though the library will render unclosed directives too while streaming.

Example instruction block:

```
You have access to:
- :::chart{type=bar|line title=...}  — body must be JSON of shape {"data":[{"label","value"}]}
- :::callout{tone=info|success|warn|danger title=...} — body is markdown
- :badge{level=info|warn|danger}text:badge{} — inline badge

Always close directives with ::: on a blank line.
```

## Error handling

Each directive is wrapped in an **error boundary**. If your component throws, the library renders a small `[name error]` placeholder in the theme's muted color and keeps the rest of the message intact — one broken chart never blanks the whole message.

If a directive name is **not registered** in `directives={…}`, the library renders `[name]` in the muted color as a fallback.

## Fenced-code aliasing (coming soon)

Some AIs are more comfortable emitting fenced code than directives. The plan is to let you declare a fence language alias:

```
```chart
{"data": […]}
```
```

Track this via the roadmap; for now, directives are the supported path.
