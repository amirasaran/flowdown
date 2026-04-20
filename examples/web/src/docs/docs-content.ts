/**
 * The full in-app documentation, written as markdown. Rendered by
 * StreamMarkdown itself — the library renders its own docs.
 */
export const docsMarkdown = `# llm-markdown

A universal **streaming markdown renderer** for React and React Native, built for AI output. Every rendered element in this page is produced by the library you are about to install — the docs **dogfood** the runtime.

## What the library does

- Renders CommonMark + GFM (headings, emphasis, links, images, blockquotes, lists, tables, strikethrough, task lists, fenced code) from a single installable package.
- Tolerates partial / unclosed markdown mid-stream — ideal for AI token streams.
- Detects RTL/LTR per block automatically (mixed Arabic + Hebrew + Latin in one reply → each paragraph flows correctly).
- Scrolls wide content (tables, long code lines) horizontally inside a bounded card.
- Supports **custom widgets** inline via \`:::directive{attrs}\` blocks.
- Lets you replace **every node's renderer** from the outside.
- Exposes **theme tokens** (colors, typography, spacing, radii, motion, layout) that merge over defaults.
- Ships a slot-based card wrapper with enter animations (framer-motion-style CSS on web, Reanimated on native).

## Install

\`\`\`bash
# Web
npm i llm-markdown react react-dom

# React Native (with Expo or bare)
npm i llm-markdown react react-native react-native-reanimated
\`\`\`

The library is a single package with platform-specific exports — you import from \`llm-markdown/web\` or \`llm-markdown/native\` and the API is identical.

## Quick start — web

\`\`\`tsx
import { StreamMarkdown } from 'llm-markdown/web';

export function AssistantMessage({ text }: { text: string }) {
  return <StreamMarkdown text={text} streaming direction="auto" />;
}
\`\`\`

## Quick start — React Native

\`\`\`tsx
import { StreamMarkdown } from 'llm-markdown/native';

export function AssistantMessage({ text }: { text: string }) {
  return <StreamMarkdown text={text} streaming direction="auto" />;
}
\`\`\`

The two platforms accept the exact same props.

---

## Full \`StreamMarkdown\` props reference

\`\`\`ts
interface StreamMarkdownProps {
  text: string;                              // required; the markdown source
  streaming?: boolean;                       // default true
  components?: ComponentOverrides;           // per-node-type renderer overrides
  directives?: DirectiveRegistry;            // :::name → Component
  before?: ReactNode;                        // slot inside card, above content
  after?: ReactNode;                         // slot inside card, below content
  header?: ReactNode;                        // slot above \`before\`
  footer?: ReactNode;                        // slot below \`after\`
  card?: CardConfig;                         // wrapper visuals + animations
  theme?: DeepPartial<Theme>;                // merged over defaults
  direction?: 'auto' | 'ltr' | 'rtl';        // default 'auto' (per-block)
  virtualize?: boolean;                      // native only, experimental
  onHeadingInView?: (id, depth, text) => void;
  onDirectiveRender?: (node) => ReactNode | null | undefined;
}
\`\`\`

---

## Theming

The theme object deep-merges over the shipped \`defaultTheme\` / \`darkTheme\`. You only override what you care about:

\`\`\`tsx
import { StreamMarkdown, darkTheme } from 'llm-markdown/web';

<StreamMarkdown
  text={text}
  theme={{
    colors: {
      accent: '#ef4444',            // changes link hover, code accent, chart bars
      link: '#0ea5e9',
      codeBackground: '#0B1020',    // dark navy code blocks
    },
    typography: {
      fontFamily: "'Inter', system-ui, sans-serif",
      monoFamily: "'Fira Code', ui-monospace, monospace",
      sizeBase: 15,
      lineHeight: 1.6,
    },
    radii: { lg: 16 },              // rounder card
    motion: { enterDuration: 300 }, // slower enter
    layout: { tableColumnWidth: 160 }, // native-only: wider table cells
  }}
/>;
\`\`\`

### Full theme shape

\`\`\`ts
interface Theme {
  colors: {
    text; textMuted; background; surface; border;
    link; codeBackground; codeText; accent; blockquoteBar;
  };
  spacing: { xs: 4; sm: 8; md: 12; lg: 16; xl: 24 };
  radii: { sm: 4; md: 8; lg: 12 };
  typography: {
    fontFamily; monoFamily;
    sizeBase; sizeSmall; sizeH1; sizeH2; sizeH3; sizeH4;
    lineHeight;
  };
  motion: { enterDuration; layoutDuration };
  layout: { tableColumnWidth };    // native-only, default 140
}
\`\`\`

### Dark mode

\`\`\`tsx
import { StreamMarkdown, darkTheme } from 'llm-markdown/web';

<StreamMarkdown text={text} theme={darkTheme} />;
\`\`\`

Both \`defaultTheme\` and \`darkTheme\` are plain objects — you can import, clone, tweak, and pass. Or derive a custom palette:

\`\`\`tsx
import { defaultTheme, mergeTheme } from 'llm-markdown';

const brandTheme = mergeTheme(defaultTheme, {
  colors: {
    accent: '#10b981',
    link:   '#10b981',
    surface:'#F8FAFC',
  },
});
\`\`\`

---

## Component overrides

Every node type has a **default renderer** and can be replaced by passing an entry in \`components\`. The override receives the parsed AST node, an already-rendered children tree, and the merged theme.

### Example: custom link renderer

\`\`\`tsx
import React from 'react';
import type { NodeRendererProps } from 'llm-markdown/web';

const MyLink = React.memo(
  function MyLink({ node, children, theme }: NodeRendererProps) {
    const { url, title } = node as { url: string; title?: string };
    return (
      <a
        href={url}
        title={title}
        onClick={() => trackClick(url)}
        style={{
          color: theme.colors.link,
          textDecoration: 'underline dotted',
        }}
      >
        {children}
      </a>
    );
  },
  // CRITICAL: compare node.id + theme. Without this, streaming
  // re-renders every node on every tick, and dark-mode toggles
  // won't repaint already-rendered nodes.
  (a, b) => a.node.id === b.node.id && a.theme === b.theme
);

<StreamMarkdown text={text} components={{ link: MyLink }} />;
\`\`\`

### Every overridable key

\`\`\`
root            strong          list            table
paragraph       emphasis        listItem        tableRow
heading         delete          link            tableCell
text                            image           html
                inlineCode      thematicBreak   break
                code
                blockquote
\`\`\`

### The \`NodeRendererProps\` contract

\`\`\`ts
interface NodeRendererProps<N = AnyNode> {
  node: N;                // the parsed AST node
  children?: ReactNode;   // already-rendered children (for containers)
  theme: Theme;           // merged theme (defaults + your overrides)
}
\`\`\`

---

## Customizing the code block

Two levers, from simple to full control.

### Lever 1 — theme tokens only

For just changing colors and font:

\`\`\`tsx
<StreamMarkdown
  text={text}
  theme={{
    colors: {
      codeBackground: '#0B1020',
      codeText: '#E2E8F0',
    },
    typography: {
      monoFamily: "'Fira Code', ui-monospace, monospace",
      sizeSmall: 13,
    },
  }}
/>;
\`\`\`

Applies to both inline \`\\\`code\\\`\` and fenced blocks.

### Lever 2 — full component replacement

Replace the entire renderer. You get the node (\`lang\`, \`value\`, \`streaming?\`) and can add copy buttons, syntax highlighting, language badges — whatever you want.

\`\`\`tsx
import React, { useState } from 'react';
import type { NodeRendererProps, CodeNode } from 'llm-markdown/web';

const MyCode = React.memo(
  function MyCode({ node, theme }: NodeRendererProps) {
    const c = node as CodeNode;
    const [copied, setCopied] = useState(false);

    return (
      <figure style={{
        margin: \`\${theme.spacing.sm}px 0\`,
        borderRadius: theme.radii.md,
        background: theme.colors.codeBackground,
        overflow: 'hidden',
        border: \`1px solid \${theme.colors.border}\`,
      }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 12px',
          background: 'rgba(255,255,255,0.04)',
          fontSize: 12,
          color: theme.colors.textMuted,
          fontFamily: theme.typography.monoFamily,
        }}>
          <span>{c.lang ?? 'text'}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(c.value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            style={{
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
              color: 'inherit',
            }}
          >
            {copied ? 'copied ✓' : 'copy'}
          </button>
        </header>
        <pre style={{
          margin: 0,
          padding: 12,
          overflowX: 'auto',
          fontFamily: theme.typography.monoFamily,
          fontSize: theme.typography.sizeSmall,
          color: theme.colors.codeText,
        }}>
          <code>{c.value}</code>
          {c.streaming ? <span style={{ opacity: 0.6 }}>▍</span> : null}
        </pre>
      </figure>
    );
  },
  (a, b) => a.node.id === b.node.id && a.theme === b.theme
);

<StreamMarkdown text={text} components={{ code: MyCode }} />;
\`\`\`

**Note:** \`inlineCode\` is a **separate node type**. If you only override \`code\`, inline backticks keep the default style. Override \`inlineCode\` too if you want both to match.

### \`CodeNode\` shape your renderer receives

\`\`\`ts
interface CodeNode {
  id: string;            // stable hash — use in memo comparator
  type: 'code';
  lang?: string;         // "ts", "python", "chart", …
  meta?: string;         // anything after the lang
  value: string;         // the code body
  streaming?: true;      // present while the closing \\\`\\\`\\\` hasn't arrived
  dir?: 'ltr' | 'rtl';
}
\`\`\`

---

## Directives — embed custom widgets inside markdown

Directives are the escape hatch for inlining custom components (charts, canvases, tool-call cards, etc.). The syntax is readable for humans **and** emittable by AIs.

### Block directive

\`\`\`
:::name{key=value key2="quoted val" flag}
optional body
:::
\`\`\`

### Inline directive

\`\`\`
:name[label]{attrs}
\`\`\`

### Registering a directive

\`\`\`tsx
import type { DirectiveComponentProps } from 'llm-markdown/web';

function Chart({ attributes, value, theme }: DirectiveComponentProps) {
  // For opaque directives, body comes in as \`value\` (raw string).
  const { data } = JSON.parse(value ?? '{"data":[]}');
  return <YourBarChart data={data} title={attributes.title as string} />;
}

function Callout({ attributes, children, theme }: DirectiveComponentProps) {
  // For prose directives, body comes in as parsed \`children\`.
  return (
    <aside className={\`callout-\${attributes.tone}\`}>
      <strong>{attributes.title}</strong>
      {children}
    </aside>
  );
}

<StreamMarkdown
  text={text}
  directives={{ chart: Chart, callout: Callout }}
/>;
\`\`\`

### Opaque vs. prose body

- **Opaque** directives (default: \`chart\`, \`canvas\`, \`mermaid\`, \`math\`) receive their body as a raw string via \`value\` — the body is **not** re-parsed as markdown.
- **Prose** directives receive the body as rendered \`children\` — markdown inside works.

### Example markdown

\`\`\`
:::chart{type=bar title="Quarterly revenue"}
{"data":[{"label":"Q1","value":12},{"label":"Q2","value":19}]}
:::

:::callout{tone=info title="Heads up"}
This callout contains **markdown**, [links](https://example.com),
and \\\`code\\\` — all rendered recursively.
:::
\`\`\`

Unregistered directive names render as \`[name]\` in muted color; a directive component that throws is caught by a per-directive error boundary so the rest of the message stays intact.

---

## RTL / LTR handling

The library scans each block-level node's text and tags it with \`dir: 'ltr' | 'rtl'\` based on the first strong directional character (Unicode Bidi rule P2).

### The \`direction\` prop

\`\`\`tsx
<StreamMarkdown text={text} direction="auto" />   // default: per-block detection
<StreamMarkdown text={text} direction="ltr"  />   // force whole document LTR
<StreamMarkdown text={text} direction="rtl"  />   // force whole document RTL
\`\`\`

### What the default renderers do

- **Web** — sets the \`dir\` attribute on each block element. The browser handles bidi, punctuation mirroring, caret behavior.
- **Native** — sets \`writingDirection\` on \`Text\`, and swaps \`flexDirection\` to \`row-reverse\` on containers with a leading marker (list items, blockquote bar).

### Using direction in custom renderers

\`\`\`tsx
function MyBlockquote({ node, children, theme }: NodeRendererProps) {
  const rtl = node.dir === 'rtl';
  return (
    <blockquote
      dir={node.dir}
      style={{
        [rtl ? 'borderRight' : 'borderLeft']:
          \`4px solid \${theme.colors.blockquoteBar}\`,
        [rtl ? 'paddingRight' : 'paddingLeft']: theme.spacing.md,
      }}
    >
      {children}
    </blockquote>
  );
}
\`\`\`

---

## Tables

### Wide tables scroll horizontally

Any table wider than its container is wrapped in a horizontal scroll region automatically (web: \`overflow-x: auto\`; native: horizontal \`ScrollView\`).

### Per-column width on native

React Native's Yoga doesn't have HTML's table layout algorithm, so the library sizes columns explicitly. The per-column target is exposed as a theme token:

\`\`\`tsx
<StreamMarkdown
  text={text}
  theme={{ layout: { tableColumnWidth: 180 } }}  // roomy cells
/>;
\`\`\`

Default is **140 px**. On narrow viewports where \`numCols × width\` exceeds the screen, the table scrolls horizontally at this column width; on wider viewports the columns share the whole viewport evenly (at least this wide).

HTML \`<table>\` on web sizes itself natively, so this knob is ignored there.

---

## Streaming

### How it works

- The parser tolerates **partial / unclosed** tokens: a code fence without a closing \\\`\\\`\\\`, an open list, a half-written table — all render as "pending" and tagged \`streaming: true\`.
- Every node carries a **stable id** derived from \`path + content-hash\`. When the text grows, unchanged nodes keep the same id, so React reuses their rendered component instances.
- The default renderers are wrapped with \`React.memo\` using an \`id + theme\` comparator, so unchanged nodes skip re-rendering during streaming.

### Pushing chunks directly

Do **not** debounce upstream for the renderer's sake. Push every chunk:

\`\`\`tsx
import { useState, useEffect } from 'react';
import { StreamMarkdown } from 'llm-markdown/web';

export function StreamedMessage({ prompt }: { prompt: string }) {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(\`/api/chat?q=\${encodeURIComponent(prompt)}\`);
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

  return <StreamMarkdown text={text} streaming={!done} />;
}
\`\`\`

### Using the hook directly

When you want the AST without the default card:

\`\`\`tsx
import { useStreamMarkdown } from 'llm-markdown/web';

function Raw({ text }: { text: string }) {
  const { tree } = useStreamMarkdown(text, {
    streaming: true,
    direction: 'auto',
  });
  return <pre>{JSON.stringify(tree, null, 2)}</pre>;
}
\`\`\`

---

## Slots around the content

The \`StreamMarkdown\` card has four optional slots:

\`\`\`tsx
<StreamMarkdown
  text={text}
  header={<div>Thread · April 2026</div>}
  before={<RoleBadge role="assistant" />}
  after={<Citations items={citations} />}
  footer={<FeedbackButtons />}
/>;
\`\`\`

Slot order inside the card, top to bottom:

1. \`header\`
2. \`before\`
3. the rendered markdown content
4. \`after\`
5. \`footer\`

---

## Card visuals + animations

\`\`\`tsx
<StreamMarkdown
  text={text}
  card={{
    animation: 'fadeSlide',        // 'none'|'fade'|'fadeSlide'|'scale'|'typewriter'
    enterDuration: 200,            // ms
    layoutAnimation: true,         // animate height as stream grows
    padding: 16,
    radius: 12,
    backgroundColor: '#F9FAFB',
    borderColor:     '#E5E7EB',
    borderWidth: 1,
  }}
/>;
\`\`\`

On React Native, layout animations use Reanimated (optional peer dep); on web they use CSS transitions — no framer-motion runtime required.

---

## Performance

- **Every override must be memoized** with a comparator that returns \`true\` when \`a.node.id === b.node.id && a.theme === b.theme\`. Without this, streaming re-renders every node on every tick and drops frames.
- **Wrap your \`components\` / \`directives\` / \`theme\` props with \`useMemo\`** so the renderer context doesn't churn.
- **Fresh theme objects trigger a full re-render** — merge once, reuse.
- **For chat lists**, mount one \`<StreamMarkdown>\` per message and let a \`FlatList\` / \`FlashList\` virtualize the list.

---

## Slash commands available in this demo

The chat demo on this site supports slash commands for quick testing. Type \`/\` in the composer to filter. All live in [\`examples/shared/slash-commands.ts\`](https://github.com/amirasaran/llm-markdown/blob/main/examples/shared/slash-commands.ts).

\`\`\`
/everything  /headings   /inline     /lists      /code
/blockquote  /table      /wide       /chart      /callout
/directives  /rtl        /persian    /farsi      /arabic
/streaming   /align
\`\`\`

---

## API exports

### From the root (\`llm-markdown\`)

\`\`\`ts
import {
  // core
  parseMarkdown, assignIds, annotateDirection,
  diffTrees, directionOf,
  defaultTheme, darkTheme, mergeTheme,
  parseAttributes, OPAQUE_BODY_DIRECTIVES,
  useStreamMarkdown,

  // types (re-exported)
  type StreamMarkdownProps, type Theme, type DeepPartial,
  type ComponentOverrides, type NodeRendererProps,
  type DirectiveRegistry, type DirectiveComponentProps,
  type CardConfig, type CardAnimationPreset,
  type RootNode, type BlockNode, type InlineNode,
  type DirectiveNode, type Direction, type AnyNode,
} from 'llm-markdown';
\`\`\`

### From \`llm-markdown/web\`

\`\`\`ts
import {
  StreamMarkdown,
  useStreamMarkdown,
  defaultTheme, darkTheme,
  /* all the types above */
} from 'llm-markdown/web';
\`\`\`

### From \`llm-markdown/native\`

\`\`\`ts
import {
  StreamMarkdown,
  useStreamMarkdown,
  defaultTheme, darkTheme,
  /* all the types above */
} from 'llm-markdown/native';
\`\`\`

---

## Supported markdown

- **Headings** — \`# H1\` through \`###### H6\`
- **Paragraphs** — soft breaks with two trailing spaces or \`\\\\\` + newline
- **Emphasis** — \`*em*\`, \`_em_\`, \`**strong**\`, \`~~del~~\`
- **Inline code** — \`\\\`code\\\`\`
- **Fenced code blocks** — \\\`\\\`\\\`ts + language id
- **Lists** — unordered (\`-\` \`*\` \`+\`) and ordered (\`1.\` \`2)\`) with nested content
- **Task lists** — \`- [ ]\` and \`- [x]\`
- **Links** — \`[text](url "title")\` and autolinks \`<https://…>\`
- **Images** — \`![alt](url "title")\`
- **Tables** — GFM pipe tables with alignment (\`:---\`, \`:---:\`, \`---:\`)
- **Thematic breaks** — \`---\`, \`***\`, \`___\`
- **Blockquotes** — \`>\`, nested via \`>>\`, lazy continuation
- **HTML blocks** — passed through as \`html\` nodes (sanitize yourself if untrusted)
- **Directives** — \`:::name{attrs}\` blocks and \`:name[label]{attrs}\` inline

---

## More

- The **Playground** lets you toggle every prop live and paste your own markdown.
- The **Chat demo** shows the library inside a WhatsApp-style conversation, with slash commands that inject preset messages.
- The [GitHub repo](https://github.com/amirasaran/llm-markdown) contains the full source, tests, and more detailed docs in \`./docs\`.
`;
