# Getting started

## Install

```bash
npm i llm-markdown react react-dom
# or, for React Native:
npm i llm-markdown react react-native react-native-reanimated
```

Peer deps:

| Platform      | Required                                   | Optional                                                     |
| ------------- | ------------------------------------------ | ------------------------------------------------------------ |
| Web           | `react`, `react-dom`                       | `framer-motion` (not required; internal CSS transitions)     |
| React Native  | `react`, `react-native`                    | `react-native-reanimated` (for card enter/layout animations) |

The library ships both ESM and CJS plus full type definitions. Tree-shakes the platform you do not import.

## Your first message

```tsx
// web
import { LLMMarkdown } from 'llm-markdown/web';

export function AssistantMessage({ text }: { text: string }) {
  return <LLMMarkdown text={text} streaming direction="auto" />;
}
```

```tsx
// React Native
import { LLMMarkdown } from 'llm-markdown/native';

export function AssistantMessage({ text }: { text: string }) {
  return <LLMMarkdown text={text} streaming direction="auto" />;
}
```

Everything past `text` is optional — sensible defaults light up immediately.

## Stream from your AI SDK

Any source that incrementally updates a string works. Example with `fetch` + a Server-Sent-Events loop:

```tsx
import { useState, useEffect } from 'react';
import { LLMMarkdown } from 'llm-markdown/web';

export function Streamed({ prompt }: { prompt: string }) {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/chat?q=${encodeURIComponent(prompt)}`);
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      for (;;) {
        const { value, done: d } = await reader.read();
        if (d || cancelled) break;
        buf += decoder.decode(value, { stream: true });
        setText(buf);
      }
      setDone(true);
    })();
    return () => { cancelled = true; };
  }, [prompt]);

  return <LLMMarkdown text={text} streaming={!done} />;
}
```

Because the parser tolerates partial/unclosed markdown, you can push `buf` on every chunk without waiting for complete blocks.

## Composing the card

The card wraps your content and accepts slots. Useful for showing role, tools, citations, etc.:

```tsx
<LLMMarkdown
  text={text}
  streaming
  header={<div>Thread · April 2026</div>}
  before={<RoleBadge role="assistant" />}
  after={<Citations items={citations} />}
  footer={<Feedback onThumb={thumb} />}
  card={{
    animation: 'fadeSlide',
    layoutAnimation: true,
    padding: 16,
    radius: 12,
  }}
/>
```

## Overriding a node renderer

Every node type can be replaced:

```tsx
import type { NodeRendererProps } from 'llm-markdown/web';

function MyCode({ node, theme }: NodeRendererProps) {
  const code = (node as { value: string }).value;
  return <pre className="my-code">{code}</pre>;
}

<LLMMarkdown text={text} components={{ code: MyCode }} />;
```

See [Theming & component overrides](./theming-and-overrides.md) for the full list of node types and the override contract.

## Registering a directive (custom widget)

```tsx
import type { DirectiveComponentProps } from 'llm-markdown/web';

function PriceCard({ attributes, theme }: DirectiveComponentProps) {
  const symbol = String(attributes.symbol);
  return <div className="price-card">Latest price of {symbol}…</div>;
}

<LLMMarkdown
  text={text}
  directives={{ price: PriceCard }}
/>;

// In markdown: `:::price{symbol=AAPL}\n:::`
```

See [Directives](./directives.md) for block vs inline forms, opaque vs markdown bodies, and AI-friendly patterns.

## Running the examples

```bash
pnpm install
pnpm build
pnpm example:web      # http://localhost:5173
pnpm example:native   # Expo Dev Tools
```

Both examples have a full control panel: preset picker, custom-markdown editor, streaming speed sliders, direction / animation selectors, and toggles for each card slot.
