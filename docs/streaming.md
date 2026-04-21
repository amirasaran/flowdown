# Streaming model

`llm-markdown` is built around the assumption that **the text is still growing**. That changes three things versus a static renderer.

## 1. The parser tolerates partial tokens

Set `streaming={true}` (default). The parser then accepts input that would be malformed for a one-shot renderer:

- A fenced code block without a closing ` ``` ` — everything up to the end of input becomes the code body, with the node tagged `streaming: true`.
- An open `:::directive` block without its closing `:::` — same behaviour; children are parsed or left raw depending on the directive.
- A list or table mid-row — rendered as far as it can be parsed.

Your custom renderers can check `node.streaming` to add a caret, a shimmer, or just do nothing. The library does not inject a caret by default; it keeps the DOM/React-tree clean.

## 2. Stable ids preserve component instances

Every node gets an id derived from `path + content-hash`. When you re-render with a longer `text`, unchanged prefix nodes keep the same id, so React reuses their components:

```
text "A\n\nB"         → ids [r/0:hA, r/1:hB]
text "A\n\nB extra"   → ids [r/0:hA, r/1:hBExtra]
```

The heading `A` keeps its id, so its rendered component is not unmounted. That is the single biggest win for streaming perf.

Combined with the default `React.memo` comparator (`a.node.id === b.node.id`), a node whose content has not changed will skip rendering entirely — even if its siblings have grown.

## 3. The hook keeps state across updates

`useLLMMarkdown(text, options)` holds the last parse in a ref. If you pass the same `text`, it returns the same tree identity (no recompute). If `text` grows, it reparses and annotates direction once, then hands back a new tree.

```ts
import { useLLMMarkdown } from 'llm-markdown/web';

const { tree } = useLLMMarkdown(text, { streaming: true, direction: 'auto' });
```

You can use the hook without the `LLMMarkdown` component if you want to render the tree yourself.

## Practical notes

- **Do not debounce** upstream for the renderer's sake. Push every chunk through — `React.memo` keeps this cheap.
- When the stream ends, flip `streaming={false}` if you want the parser to complain about unclosed blocks instead of silently rendering them as pending. The default is to be permissive both ways.
- If your AI emits text slower than once per second you still get incremental benefit; if it emits tens of tokens per second, the stable-id diffing is what keeps rendering smooth.
- The parser is fast (~hundreds of μs for typical chat replies); the bottleneck is React reconciliation, which stable ids + memoization attack directly.

## Why not an append-only tokenizer?

A fully append-only tokenizer is possible but fragile: a single new character can re-classify prior lines (e.g. a blank line promoting a paragraph into a setext heading, or a list-item continuation becoming a new paragraph). A full re-parse with stable ids keeps correctness guarantees while letting React handle the rendering delta — a smaller, simpler engine with the same practical perf.

## Debugging a stream

The example app at [`examples/web`](../examples/web) exposes live controls:

- Preset selector (run every feature set)
- Streaming speed: chars-per-tick + tick-interval sliders, with a live chars/sec readout
- Restart / skip-to-end buttons
- Toggle between streaming and all-at-once

Use it to reproduce an issue in isolation before filing a bug.
