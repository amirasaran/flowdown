import { Fragment, type ReactNode, type ComponentType, Component } from 'react';
import type {
  AnyNode,
  RootNode,
  DirectiveNode,
  NodeType,
} from '../core/parser/ast';
import type { DirectiveComponentProps, NodeRendererProps, Theme } from '../shared/types';
import { useRenderer } from '../core/registry/componentRegistry';
import { Text } from './rn';
import * as D from './components/defaults';
import { SelectableBlock } from './components/selectableText';

export function RenderNode({ node }: { node: AnyNode }): ReactNode {
  const ctx = useRenderer();
  const { components, directives, theme } = ctx;

  if (node.type === 'root') {
    const rootChildren = (node as RootNode).children;
    // With text selection on, merge consecutive text-like blocks into a
    // single native LLMSelectableTextView so iOS UITextView treats them as
    // one selection range (selection flows across them ChatGPT-style). Blocks
    // that can't be inlined (code, table, blockquote, image, directive)
    // intentionally break the group.
    if (ctx.textSelection.enabled) {
      return <SelectableGroupedChildren nodes={rootChildren} />;
    }
    return <RenderChildren nodes={rootChildren} />;
  }

  if (node.type === 'directive') {
    const dn = node as DirectiveNode;
    const Comp = directives[dn.name];
    if (!Comp) {
      return <Text style={{ color: theme.colors.textMuted }}>[{dn.name}]</Text>;
    }
    const children = dn.children ? <RenderChildren nodes={dn.children as AnyNode[]} /> : undefined;
    const props: DirectiveComponentProps = {
      node: dn,
      attributes: dn.attributes,
      theme,
      ...(dn.value !== undefined ? { value: dn.value } : {}),
      ...(children !== undefined ? { children } : {}),
    };
    return (
      <ErrorBoundary fallback={<Text style={{ color: theme.colors.textMuted }}>[{dn.name} error]</Text>}>
        <Comp {...props} />
      </ErrorBoundary>
    );
  }

  const Override = (components as Record<string, ComponentType<NodeRendererProps> | undefined>)[
    node.type
  ];
  const Default = getDefault(node.type);
  const inner = hasChildren(node)
    ? <RenderChildren nodes={(node as { children: AnyNode[] }).children} />
    : undefined;

  const Comp = Override ?? Default;
  if (!Comp) return null;
  const rendered = (
    <Comp node={node} theme={theme}>
      {inner}
    </Comp>
  );
  return applyBlockSlots(node, rendered, ctx.blockSlots, theme);
}

// ---- per-block slots (before / after / actions toolbar) -------------------

import type { BlockSlots, BlockSlot as BlockSlotT } from '../shared/types';
import { View, Pressable } from './rn';

function applyBlockSlots(
  node: AnyNode,
  rendered: ReactNode,
  slots: BlockSlots,
  theme: Theme
): ReactNode {
  const slot = (slots as Record<string, BlockSlotT<AnyNode> | undefined>)[node.type];
  if (!slot) return rendered;
  const hasBefore = !!slot.before;
  const hasAfter = !!slot.after;
  const hasActions = !!slot.actions && slot.actions.length > 0;
  if (!hasBefore && !hasAfter && !hasActions) return rendered;
  return (
    <View>
      {hasBefore ? slot.before!(node) : null}
      {rendered}
      {hasAfter ? slot.after!(node) : null}
      {hasActions ? <BlockActionBar actions={slot.actions!} node={node} theme={theme} /> : null}
    </View>
  );
}

function BlockActionBar({
  actions,
  node,
  theme,
}: {
  actions: { label: string; onPress: (node: AnyNode) => void }[];
  node: AnyNode;
  theme: Theme;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.sm,
        flexWrap: 'wrap',
      }}
    >
      {actions.map((a, i) => (
        <Pressable
          key={`${a.label}-${i}`}
          onPress={() => a.onPress(node)}
          style={{
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.radii.md,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: theme.typography.sizeSmall, fontWeight: '500' }}>
            {a.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function RenderChildren({ nodes }: { nodes: AnyNode[] }) {
  return (
    <>
      {nodes.map((n) => (
        <Fragment key={n.id}>
          <RenderNode node={n} />
        </Fragment>
      ))}
    </>
  );
}

function hasChildren(node: AnyNode): boolean {
  return (
    'children' in node &&
    Array.isArray((node as { children?: unknown }).children) &&
    (node as { children: unknown[] }).children.length > 0
  );
}

function getDefault(type: string): ComponentType<NodeRendererProps> | null {
  const map: Record<string, unknown> = {
    root: D.RootR,
    heading: D.HeadingR,
    paragraph: D.ParagraphR,
    text: D.TextR,
    strong: D.StrongR,
    emphasis: D.EmphasisR,
    delete: D.DeleteR,
    inlineCode: D.InlineCodeR,
    code: D.CodeR,
    blockquote: D.BlockquoteR,
    list: D.ListR,
    listItem: D.ListItemR,
    link: D.LinkR,
    image: D.ImageR,
    thematicBreak: D.ThematicBreakR,
    table: D.TableR,
    tableRow: D.TableRowR,
    tableCell: D.TableCellR,
    break: D.BreakR,
  };
  return (map[type] as ComponentType<NodeRendererProps> | undefined) ?? null;
}

interface EBProps {
  children: ReactNode;
  fallback: ReactNode;
}
interface EBState { hasError: boolean; }
class ErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() {}
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// ---- cross-block selection grouping ---------------------------------------
//
// Wrap consecutive text-like blocks in a single SelectableBlock so the native
// LLMSelectableTextView shows them as one attributed-text UITextView. The
// inner block renderers detect the surrounding context and skip their own
// per-block wrap.

// Blocks that can flatten into the outer <Text> of a SelectableBlock group.
// Lists are included in text-mode (ListR/ListItemR detect insideGroup and
// render inline Text instead of View/flex-row) — see defaults.tsx. Thematic
// breaks still require a rule line that can't live inside Text, so they
// break the group.
const GROUPABLE_TYPES: ReadonlySet<NodeType> = new Set<NodeType>([
  'paragraph',
  'heading',
  'list',
]);

/** A paragraph whose AST contains a block child (image, HTML, etc.) is rendered
 *  by ParagraphR as a View, not a Text, so it can't be flattened into the
 *  outer UITextView's attributed text. Excluding it from the group keeps the
 *  image visible and selection still works per-block.
 *
 *  Lists only group when every item is a single paragraph with inline-only
 *  children — anything else (nested list, image, code, blockquote, table)
 *  would need a View inside Text. */
function isGroupable(node: AnyNode): boolean {
  if (!GROUPABLE_TYPES.has(node.type as NodeType)) return false;
  if (node.type === 'paragraph') {
    const children = (node as { children?: { type: string }[] }).children ?? [];
    if (children.some((c) => c.type === 'image' || c.type === 'html')) return false;
  }
  if (node.type === 'list') {
    type Item = { children?: Array<{ type: string; children?: Array<{ type: string }> }> };
    const items = (node as { children?: Item[] }).children ?? [];
    for (const item of items) {
      const kids = item.children ?? [];
      if (kids.length !== 1) return false;
      const only = kids[0];
      if (!only || only.type !== 'paragraph') return false;
      const inline = only.children ?? [];
      if (inline.some((c) => c.type === 'image' || c.type === 'html')) return false;
    }
  }
  return true;
}

type Group =
  | { kind: 'text'; nodes: AnyNode[] }
  | { kind: 'block'; node: AnyNode };

function groupBlocks(nodes: AnyNode[]): Group[] {
  const out: Group[] = [];
  let buf: AnyNode[] = [];
  // A group of size 1 gains nothing from the outer-Text wrapper (no
  // cross-block selection to enable) and only introduces baseline-font
  // measurement bugs. Emit single groupables as their own block so the
  // per-block renderer handles selection + layout.
  const flushBuf = () => {
    if (buf.length >= 2) {
      out.push({ kind: 'text', nodes: buf });
    } else if (buf.length === 1) {
      out.push({ kind: 'block', node: buf[0]! });
    }
    buf = [];
  };
  for (const n of nodes) {
    if (isGroupable(n)) {
      // Break the group on direction change. Nested <Text> spans inside a
      // single outer <Text> share one Android TextView and can't reliably
      // get per-span textAlign — mixing RTL + LTR paragraphs in one group
      // leaves one of them visually mis-aligned. Splitting at the dir
      // boundary keeps each run internally consistent.
      const prev = buf[buf.length - 1];
      const nodeDir = (n as { dir?: string }).dir;
      const prevDir = prev ? (prev as { dir?: string }).dir : undefined;
      if (prev && nodeDir && prevDir && nodeDir !== prevDir) {
        flushBuf();
      }
      buf.push(n);
    } else {
      flushBuf();
      out.push({ kind: 'block', node: n });
    }
  }
  flushBuf();
  return out;
}

function SelectableGroupedChildren({ nodes }: { nodes: AnyNode[] }) {
  const { theme } = useRenderer();
  const groups = groupBlocks(nodes);
  // Baseline style on the outer Text — Fabric measures nested Text as
  // attributed-string spans of this parent, so it must advertise the
  // largest expected line metrics. Using paragraph's lineHeight also
  // avoids the "truncated last heading" bug where Yoga under-measures
  // the final span because the outer Text inherited the RN default 14pt.
  const outerTextStyle = {
    color: theme.colors.text,
    fontSize: theme.typography.sizeBase,
    lineHeight: theme.typography.sizeBase * theme.typography.lineHeight,
  };
  return (
    <>
      {groups.map((g, gi) => {
        if (g.kind === 'block') {
          return (
            <Fragment key={g.node.id ?? `b-${gi}`}>
              <RenderNode node={g.node} />
            </Fragment>
          );
        }
        // Wrap all grouped blocks inside ONE outer <Text>. Inner Texts (from
        // HeadingR / ParagraphR / inline renderers) become attributed-string
        // spans of this single Text, so Yoga measures them as one block with
        // height matching the UITextView's attributed-text rendering — no
        // leftover reserved space at the bottom, no truncation at the top.
        //
        // Per-block margins are suppressed inside a group, so the group
        // wrapper itself owns the vertical spacing. Extra top space when the
        // group leads with a heading — the individual HeadingR would have
        // given it marginTop:lg outside a group. Zero bottom space when the
        // group ends with a heading — the following block has its own top
        // margin, and doubling them creates a visible gap between the
        // heading and its body (code block, table, etc.).
        const leadsWithHeading = g.nodes[0]?.type === 'heading';
        const endsWithHeading = g.nodes[g.nodes.length - 1]?.type === 'heading';
        const groupStyle = {
          marginTop: leadsWithHeading ? theme.spacing.md : theme.spacing.sm,
          marginBottom: endsWithHeading ? 0 : theme.spacing.sm,
        };
        return (
          <SelectableBlock key={`g-${gi}`} style={groupStyle}>
            <Text style={outerTextStyle}>
              {g.nodes.map((n, i) => {
                // Default sibling separator is a blank line (\n\n). Drop to a
                // single \n when the previous sibling is a heading so the
                // heading's body follows it tightly, matching typical typeset.
                const prev = i > 0 ? g.nodes[i - 1] : undefined;
                const sep = !prev ? '' : prev.type === 'heading' ? '\n' : '\n\n';
                return (
                  <Fragment key={n.id}>
                    {sep}
                    <RenderNode node={n} />
                  </Fragment>
                );
              })}
            </Text>
          </SelectableBlock>
        );
      })}
    </>
  );
}

