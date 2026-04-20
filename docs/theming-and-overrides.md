# Theming & component overrides

Two separate knobs, used together or independently:

- **Theme tokens** — restyle the defaults without replacing any components.
- **Component overrides** — replace any node renderer with your own JSX.

## Theme tokens

`theme` is a deep-partial that merges over the default:

```ts
interface Theme {
  colors: {
    text; textMuted; background; surface; border;
    link; codeBackground; codeText; accent; blockquoteBar;
  };
  spacing: { xs; sm; md; lg; xl };
  radii: { sm; md; lg };
  typography: {
    fontFamily; monoFamily;
    sizeBase; sizeSmall; sizeH1; sizeH2; sizeH3; sizeH4;
    lineHeight;
  };
  motion: { enterDuration; layoutDuration };
  layout: { tableColumnWidth };   // native-only, default 140 (px)
}
```

### `layout.tableColumnWidth` (native)

Per-column target width for tables. When `numCols * tableColumnWidth` exceeds the viewport, the table scrolls horizontally with each column at this width; otherwise it fills the viewport with columns at least this wide. Raise it for roomier cells (and more scroll on narrow screens); lower it for more density.

```tsx
<StreamMarkdown
  text={text}
  theme={{ layout: { tableColumnWidth: 180 } }}
/>
```

Has no effect on web — HTML's `<table>` sizing algorithm handles columns natively.

Usage:

```tsx
import { StreamMarkdown, darkTheme } from 'llm-markdown/web';

<StreamMarkdown
  text={text}
  theme={{
    colors: { accent: '#ef4444', link: '#0ea5e9' },
    radii: { lg: 16 },
    typography: { sizeBase: 15 },
  }}
/>

// Or swap the whole palette:
<StreamMarkdown text={text} theme={darkTheme} />
```

Ship-supplied presets: `defaultTheme` and `darkTheme`. Both are plain objects — compose or clone freely.

## Component overrides

Every node type can be replaced with a component of your own. The override receives the parsed node, the merged theme, and any already-rendered children.

```tsx
import type { NodeRendererProps } from 'llm-markdown/web';

function MyLink({ node, children, theme }: NodeRendererProps) {
  const { url, title } = node as { url: string; title?: string };
  return (
    <a
      href={url}
      title={title}
      style={{ color: theme.colors.link, textDecorationStyle: 'dotted' }}
      onClick={track}
    >
      {children}
    </a>
  );
}

<StreamMarkdown text={text} components={{ link: MyLink }} />;
```

### Full list of override keys

```
root            strong          list            table
paragraph       emphasis        listItem        tableRow
heading         delete          link            tableCell
text            inlineCode      image           html
                code            thematicBreak   break
                blockquote
```

### The `NodeRendererProps` contract

```ts
interface NodeRendererProps<N = AnyNode> {
  node: N;          // the parsed AST node (see core/parser/ast.ts)
  children?: ReactNode;  // rendered children for nodes that have them
  theme: Theme;     // merged theme (defaults + your override)
}
```

For text-like nodes (`text`, `inlineCode`, `code`, `image`, `html`), the value is on `node.value` / `node.url` / etc. For container nodes (`paragraph`, `heading`, `list`, `table`, etc.), children are already rendered — just place them where you want.

### Narrowing the node type

TypeScript sees the generic `AnyNode` union by default. Narrow with `node.type`:

```tsx
function MyHeading({ node, children, theme }: NodeRendererProps) {
  if (node.type !== 'heading') return null;
  // Now `node` is HeadingNode: { depth: 1|2|3|4|5|6, dir?: Direction, … }
  const id = slugify(collectText(node));
  return (
    <h1 id={id} data-depth={node.depth}>
      {children}
    </h1>
  );
}
```

Or import the exact node type:

```ts
import type { HeadingNode } from 'llm-markdown';
function MyHeading({ node }: { node: HeadingNode }) { /* … */ }
```

## Memoization

The bundled defaults are wrapped with `React.memo` and compare by **`node.id` + `theme` reference**. Both checks matter:

- `node.id` — skip re-renders during streaming when the node's content didn't change.
- `theme` — re-render when the consumer swaps theme (e.g. toggles dark mode) mid-stream. If you only compare by `node.id`, nodes that were already rendered keep their old colors baked in.

Do NOT include `children` in the comparator — they are freshly-created React elements every parent render and would break memoization.

```tsx
const MyCode = React.memo(
  function MyCode({ node, theme }: NodeRendererProps) { /* … */ },
  (a, b) => a.node.id === b.node.id && a.theme === b.theme
);
```

Same rule for directive components.

## RTL-aware overrides

Block-level nodes carry a `dir` property (`'ltr' | 'rtl'`) set by the bidi pass. Use it when rendering icons or borders that have a handedness:

```tsx
function MyBlockquote({ node, children, theme }: NodeRendererProps) {
  const rtl = node.dir === 'rtl';
  return (
    <blockquote
      dir={node.dir}
      style={{
        [rtl ? 'borderRight' : 'borderLeft']: `4px solid ${theme.colors.blockquoteBar}`,
        [rtl ? 'paddingRight' : 'paddingLeft']: theme.spacing.md,
      }}
    >
      {children}
    </blockquote>
  );
}
```
