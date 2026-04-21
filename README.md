# llm-markdown

> Universal streaming markdown renderer for **React** and **React Native**, built for AI output.

One package, two platforms, every visual fully overridable. Optimized for the streaming case that breaks most markdown renderers: partial tokens, unclosed blocks, mixed RTL/LTR content, and inline custom widgets like charts and canvases.

```tsx
import { LLMMarkdown } from 'llm-markdown/web'; // or 'llm-markdown/native'

<LLMMarkdown
  text={aiStreamingText}
  streaming
  directives={{ chart: MyChart, callout: MyCallout }}
  direction="auto"
  card={{ animation: 'fadeSlide', layoutAnimation: true }}
  textSelection={{
    enabled: true,
    actions: [{ label: 'Ask AI', onPress: (t) => askAI(t) }],
  }}
  blockSlots={{
    code: {
      actions: [
        { label: 'Copy', onPress: (n) => navigator.clipboard.writeText(n.value) },
      ],
    },
  }}
/>
```

---

## Why this library

| Problem with typical renderers                                        | How `llm-markdown` handles it                                                                     |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Re-mount the whole tree on every token, dropping frames               | Stable content-hash node ids + `React.memo` — unchanged subtrees never re-render while streaming     |
| Blank out when a code fence or table is half-written                  | Parser tolerates unclosed blocks and tags pending nodes with `streaming: true` so you can style them |
| Need separate libraries for web and mobile                            | Single package, platform exports `llm-markdown/web` and `llm-markdown/native`                  |
| Custom widgets (charts, canvas) require escape hatches or raw HTML    | First-class `:::directive{attrs}` syntax + component registry                                        |
| Wrong direction when AI mixes Arabic, Hebrew, and English in one reply| Per-block first-strong-character detection (Unicode Bidi P2)                                         |
| Wide tables overflow the card and break layout                        | Automatic horizontal scroll for tables and long code blocks                                          |
| Every visual locked inside the library                                | Every node renderer is overridable via `components={}`                                               |

---

## Installation

```bash
# peer deps you need for web
npm i llm-markdown react react-dom

# peer deps for React Native (reanimated enables card animations; optional)
npm i llm-markdown react react-native react-native-reanimated
```

Supported React versions: `18.x` and `19.x`.

---

## Quickstart

### Web

```tsx
import { LLMMarkdown } from 'llm-markdown/web';

export function Message({ text }: { text: string }) {
  return (
    <LLMMarkdown
      text={text}
      streaming
      card={{ animation: 'fadeSlide', layoutAnimation: true }}
      direction="auto"
    />
  );
}
```

### React Native

```tsx
import { LLMMarkdown } from 'llm-markdown/native';

export function Message({ text }: { text: string }) {
  return (
    <LLMMarkdown
      text={text}
      streaming
      card={{ animation: 'fadeSlide', layoutAnimation: true }}
      direction="auto"
    />
  );
}
```

The API surface is identical across platforms.

---

## Features at a glance

- ✅ CommonMark + GFM: headings, emphasis, links, images, blockquotes, lists, tables, strikethrough, task lists, fenced code
- ✅ **Streaming-aware parser** — tolerates partial tokens and unclosed blocks
- ✅ **AST diff + stable ids** — only changed nodes re-render
- ✅ **Directives** — `:::name{attrs}` blocks and `:name{attrs}` inline, plugged to your components
- ✅ **Per-block RTL/LTR** detection, with manual override
- ✅ **Horizontal scroll** for wide tables and long code lines
- ✅ **Card wrapper** with presets (`fade`, `fadeSlide`, `scale`, `typewriter`, `none`) + layout animations
- ✅ **Slots** — `header`, `before`, `after`, `footer` around the content
- ✅ **Text selection** — system menu + optional custom actions ("Copy", "Ask AI"), continuous selection across text blocks on native (ChatGPT-style)
- ✅ **Per-block toolbars** — `blockSlots` with Copy / Run / Export for code, tables, images
- ✅ **Theme tokens** — colors, spacing, radii, typography, motion
- ✅ **Error-bounded directives** — one broken chart does not blank the message
- ✅ **Zero runtime deps** (core); React Native animations use the peer `react-native-reanimated` if present

---

## Documentation

- [Getting started](./docs/getting-started.md)
- [Streaming model](./docs/streaming.md)
- [Directives (custom blocks)](./docs/directives.md)
- [Theming & component overrides](./docs/theming-and-overrides.md)
- [RTL / LTR auto-detection](./docs/rtl.md)
- [API reference](./docs/api.md)
- [LLM usage guide (LLM.txt)](./LLM.txt) — machine-readable cheat sheet for AI tools

---

## Examples

Two runnable examples live under [`examples/`](./examples/):

- [`examples/web`](./examples/web) — Vite + React 18. Controls for preset, streaming speed, direction, animation, slots, custom markdown.
- [`examples/native`](./examples/native) — Expo app with matching controls.

```bash
pnpm install
pnpm build            # build the library once
pnpm example:web      # opens the Vite playground
pnpm example:native   # opens the Expo playground
```

---

## Development

```bash
pnpm install
pnpm build       # tsup: ESM + CJS + d.ts
pnpm typecheck   # strict TS
pnpm test        # vitest parser + bidi tests
pnpm dev         # watch mode
```

Library source is under [`src/`](./src):

- [`src/core/`](./src/core) — parser, AST, diff, bidi, registry, hook (platform-agnostic)
- [`src/web/`](./src/web) — React DOM renderers + framer-motion-style CSS transitions
- [`src/native/`](./src/native) — React Native renderers + Reanimated animations
- [`src/shared/`](./src/shared) — public types

---

## License

MIT
