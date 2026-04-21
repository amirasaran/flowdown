# API reference

All public exports. The API is identical on web and native unless marked otherwise.

## `LLMMarkdown`

```ts
import { LLMMarkdown } from 'llm-markdown/web';
// or
import { LLMMarkdown } from 'llm-markdown/native';
```

### Props

```ts
interface LLMMarkdownProps {
  text: string;
  streaming?: boolean;                   // default true
  components?: ComponentOverrides;
  directives?: DirectiveRegistry;
  before?: ReactNode;
  after?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  card?: CardConfig;
  theme?: DeepPartial<Theme>;
  direction?: 'auto' | 'ltr' | 'rtl';    // default 'auto'
  virtualize?: boolean;                  // native only, experimental
  onHeadingInView?: (id: string, depth: number, text: string) => void;
  onDirectiveRender?: (node: DirectiveNode) => ReactNode | null | undefined;
}
```

| prop                | meaning                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| `text`              | The markdown source. Can change on every render while streaming.                                  |
| `streaming`         | If `true`, the parser tolerates partial/unclosed blocks and tags them `streaming: true`.          |
| `components`        | Per-node-type renderer overrides. See [theming doc](./theming-and-overrides.md).                  |
| `directives`        | `{ [name]: Component }` registry for `:::name{…}` and `:name{…}` elements.                        |
| `before` / `after`  | Nodes rendered inside the card, around the markdown content.                                      |
| `header` / `footer` | Nodes rendered inside the card, above `before` and below `after`.                                 |
| `card`              | Card appearance + animation config. See below.                                                    |
| `theme`             | Partial theme merged over the default.                                                            |
| `direction`         | `'auto'` (default) uses per-block detection; `'ltr'` / `'rtl'` force the entire document.         |
| `virtualize`        | (Native only, experimental) If `true`, uses a virtualized list for block nodes > 80.              |
| `onHeadingInView`   | Fires when a heading is visible; useful for TOCs.                                                 |
| `onDirectiveRender` | Intercept directive rendering; return a `ReactNode` to replace, `null`/`undefined` to let it run. |

### `CardConfig`

```ts
interface CardConfig {
  animation?: 'none' | 'fade' | 'fadeSlide' | 'scale' | 'typewriter';
  enterDuration?: number;      // ms
  layoutAnimation?: boolean;   // animate height changes while streaming
  padding?: number;
  radius?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}
```

## `useLLMMarkdown`

```ts
import { useLLMMarkdown } from 'llm-markdown/web';

const { tree } = useLLMMarkdown(text, {
  streaming: true,
  direction: 'auto',
});
```

Use this when you want the parsed AST but not the default card wrapper. `tree` is a `RootNode` with stable node ids and direction already annotated.

## `Theme`

```ts
interface Theme {
  colors: {
    text;            textMuted;     background;   surface;      border;
    link;            codeBackground; codeText;     accent;       blockquoteBar;
  };
  spacing:    { xs; sm; md; lg; xl };
  radii:      { sm; md; lg };
  typography: {
    fontFamily; monoFamily;
    sizeBase; sizeSmall; sizeH1; sizeH2; sizeH3; sizeH4;
    lineHeight;
  };
  motion:     { enterDuration; layoutDuration };
  layout:     { tableColumnWidth };   // native only — per-column target (px)
}
```

Shipped presets: `defaultTheme`, `darkTheme`. `mergeTheme(base, partial)` is exported for advanced composition.

## `ComponentOverrides`

```ts
type ComponentOverrides = Partial<{
  root:           ComponentType<NodeRendererProps>;
  paragraph:      ComponentType<NodeRendererProps>;
  heading:        ComponentType<NodeRendererProps>;
  text:           ComponentType<NodeRendererProps>;
  strong:         ComponentType<NodeRendererProps>;
  emphasis:       ComponentType<NodeRendererProps>;
  delete:         ComponentType<NodeRendererProps>;
  inlineCode:     ComponentType<NodeRendererProps>;
  code:           ComponentType<NodeRendererProps>;
  blockquote:     ComponentType<NodeRendererProps>;
  list:           ComponentType<NodeRendererProps>;
  listItem:       ComponentType<NodeRendererProps>;
  link:           ComponentType<NodeRendererProps>;
  image:          ComponentType<NodeRendererProps>;
  thematicBreak:  ComponentType<NodeRendererProps>;
  table:          ComponentType<NodeRendererProps>;
  tableRow:       ComponentType<NodeRendererProps>;
  tableCell:      ComponentType<NodeRendererProps>;
  html:           ComponentType<NodeRendererProps>;
  break:          ComponentType<NodeRendererProps>;
}>;
```

## `NodeRendererProps`

```ts
interface NodeRendererProps<N = AnyNode> {
  node: N;
  children?: ReactNode;
  theme: Theme;
}
```

## `DirectiveRegistry` / `DirectiveComponentProps`

```ts
type DirectiveRegistry = Record<string, ComponentType<DirectiveComponentProps>>;

interface DirectiveComponentProps {
  node: DirectiveNode;
  attributes: Record<string, string | number | boolean>;
  value?: string;         // raw body (opaque directives)
  children?: ReactNode;   // rendered body (prose directives)
  theme: Theme;
}
```

## AST node types

From `llm-markdown` (re-exported at package root and from `/web`, `/native`):

```
RootNode        ParagraphNode   HeadingNode     TextNode
StrongNode      EmphasisNode    DeleteNode      InlineCodeNode
CodeNode        BlockquoteNode  ListNode        ListItemNode
LinkNode        ImageNode       ThematicBreakNode
TableNode       TableRowNode    TableCellNode
HtmlNode        BreakNode       DirectiveNode

BlockNode  = ParagraphNode | HeadingNode | CodeNode | BlockquoteNode
           | ListNode | ThematicBreakNode | TableNode | HtmlNode | DirectiveNode
InlineNode = TextNode | StrongNode | EmphasisNode | DeleteNode
           | InlineCodeNode | LinkNode | ImageNode | BreakNode | DirectiveNode
AnyNode    = RootNode | BlockNode | InlineNode | ListItemNode | TableRowNode | TableCellNode
```

Every node has:

- `id: string` — stable content-hash id
- `type: NodeType`
- `dir?: 'ltr' | 'rtl'` — on block-level nodes after the bidi pass
- `streaming?: true` — on pending/unclosed nodes while streaming

## Low-level utilities

```ts
import {
  parseMarkdown,       // (source, { streaming }) → RootNode (no ids, no dir)
  assignIds,           // (root) → root with stable ids
  annotateDirection,   // (root, fallback='ltr') → root with dir tags
  diffTrees,           // (prev, next) → Patch[] (for telemetry/debug)
  directionOf,         // (text) → 'ltr' | 'rtl' | null
  defaultTheme, darkTheme, mergeTheme,
  parseAttributes,     // (attrString) → Record<string, string|number|boolean>
  OPAQUE_BODY_DIRECTIVES,
} from 'llm-markdown';
```

Use these if you need to build a renderer pipeline outside React (e.g. server-side pre-processing).

## Entry points

| import path                  | what you get                                                  |
| ---------------------------- | ------------------------------------------------------------- |
| `llm-markdown`            | core AST + hook + types (no React components)                 |
| `llm-markdown/core`       | same as above (explicit alias)                                |
| `llm-markdown/web`        | `LLMMarkdown` using React DOM primitives + web defaults    |
| `llm-markdown/native`     | `LLMMarkdown` using React Native primitives + RN defaults  |
