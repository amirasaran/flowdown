import type { ReactNode, ComponentType } from 'react';
import type {
  BlockNode,
  InlineNode,
  DirectiveNode,
  RootNode,
  Direction,
  AnyNode,
} from '../core/parser/ast';

export type { BlockNode, InlineNode, DirectiveNode, RootNode, Direction, AnyNode };

export interface Theme {
  colors: {
    text: string;
    textMuted: string;
    background: string;
    surface: string;
    border: string;
    link: string;
    codeBackground: string;
    codeText: string;
    accent: string;
    blockquoteBar: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radii: {
    sm: number;
    md: number;
    lg: number;
  };
  typography: {
    fontFamily: string;
    monoFamily: string;
    sizeBase: number;
    sizeSmall: number;
    sizeH1: number;
    sizeH2: number;
    sizeH3: number;
    sizeH4: number;
    lineHeight: number;
  };
  motion: {
    enterDuration: number;
    layoutDuration: number;
  };
  layout: {
    /** Target per-column width for tables (px). When total table width would
     *  exceed the viewport, the table scrolls horizontally; otherwise it
     *  fills the viewport with columns at least this wide. Native only — on
     *  web, HTML handles column sizing natively. */
    tableColumnWidth: number;
  };
}

export interface NodeRendererProps<N = AnyNode> {
  node: N;
  children?: ReactNode;
  theme: Theme;
}

/** Shape of the per-node-type override map that consumers pass in. */
export type ComponentOverrides = Partial<{
  root: ComponentType<NodeRendererProps>;
  paragraph: ComponentType<NodeRendererProps>;
  heading: ComponentType<NodeRendererProps>;
  text: ComponentType<NodeRendererProps>;
  strong: ComponentType<NodeRendererProps>;
  emphasis: ComponentType<NodeRendererProps>;
  delete: ComponentType<NodeRendererProps>;
  inlineCode: ComponentType<NodeRendererProps>;
  code: ComponentType<NodeRendererProps>;
  blockquote: ComponentType<NodeRendererProps>;
  list: ComponentType<NodeRendererProps>;
  listItem: ComponentType<NodeRendererProps>;
  link: ComponentType<NodeRendererProps>;
  image: ComponentType<NodeRendererProps>;
  thematicBreak: ComponentType<NodeRendererProps>;
  table: ComponentType<NodeRendererProps>;
  tableRow: ComponentType<NodeRendererProps>;
  tableCell: ComponentType<NodeRendererProps>;
  html: ComponentType<NodeRendererProps>;
  break: ComponentType<NodeRendererProps>;
}>;

export interface DirectiveComponentProps {
  node: DirectiveNode;
  attributes: Record<string, string | number | boolean>;
  /** Raw body text when the directive's children were not parsed as markdown. */
  value?: string;
  /** Rendered children when the directive wraps markdown prose. */
  children?: ReactNode;
  theme: Theme;
}

export type DirectiveRegistry = Record<string, ComponentType<DirectiveComponentProps>>;

export type CardAnimationPreset = 'none' | 'fade' | 'fadeSlide' | 'scale' | 'typewriter';

export interface TextSelectionAction {
  /** Label shown in the selection menu. */
  label: string;
  /** Fired when the user picks this action. Receives the currently selected text. */
  onPress: (selectedText: string) => void;
}

export interface TextSelectionConfig {
  /** Master switch — when false all text-selection behavior is disabled. */
  enabled: boolean;
  /** Custom menu actions shown alongside the system defaults.
   *  Native: requires optional peer `react-native-selectable-text`; when it
   *  isn't installed we fall back to `selectable` with the system menu only.
   *  Web: rendered in a floating action bar anchored to the selection. */
  actions?: TextSelectionAction[];
  /** Fired whenever the user's selection inside this card changes.
   *  Receives the selected text ('' when selection clears). */
  onSelect?: (selectedText: string) => void;
}

/** Shorthand: `textSelection={true}` ≡ `{ enabled: true }`. */
export type TextSelection = boolean | TextSelectionConfig;

export interface CardConfig {
  animation?: CardAnimationPreset;
  enterDuration?: number;
  layoutAnimation?: boolean;
  padding?: number;
  radius?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface LLMMarkdownProps {
  /** The markdown text. Can change incrementally while streaming. */
  text: string;
  /** When true, the parser tolerates unclosed blocks and emits streaming: true on pending nodes. */
  streaming?: boolean;
  /** Per-node-type renderer overrides. */
  components?: ComponentOverrides;
  /** Custom directives: maps directive name to a component. */
  directives?: DirectiveRegistry;
  /** Slot rendered before the markdown content, inside the card. */
  before?: ReactNode;
  /** Slot rendered after the markdown content, inside the card. */
  after?: ReactNode;
  /** Slot rendered above the card. */
  header?: ReactNode;
  /** Slot rendered below the card. */
  footer?: ReactNode;
  /** Card configuration. */
  card?: CardConfig;
  /** Partial theme override, merged over the default theme. */
  theme?: DeepPartial<Theme>;
  /** 'auto' detects direction per block; 'ltr'/'rtl' force the whole document. */
  direction?: 'auto' | Direction;
  /** Opt-in: virtualize the block list (native only, uses FlashList when available). */
  virtualize?: boolean;
  /** Callback fired when a heading becomes visible; useful for TOCs. */
  onHeadingInView?: (id: string, depth: number, text: string) => void;
  /** Escape hatch: called right before a directive renders, can return a replacement node. */
  onDirectiveRender?: (node: DirectiveNode) => ReactNode | null | undefined;
  /** Enable text selection with optional custom menu actions.
   *  `true` is sugar for `{ enabled: true }` (system menu only). Pass a config
   *  to add custom actions or listen to selection changes. */
  textSelection?: TextSelection;
}

export type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;
