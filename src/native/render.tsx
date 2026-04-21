import { Fragment, useMemo, type ReactNode, type ComponentType, Component } from 'react';
import type {
  AnyNode,
  RootNode,
  DirectiveNode,
  ParagraphNode,
  HeadingNode,
  TextNode,
  InlineCodeNode,
  LinkNode,
  ListNode,
  ListItemNode,
  NodeType,
} from '../core/parser/ast';
import type { DirectiveComponentProps, NodeRendererProps, Theme } from '../shared/types';
import { useRenderer } from '../core/registry/componentRegistry';
import { Text, TextInput } from './rn';
import * as D from './components/defaults';

export function RenderNode({ node }: { node: AnyNode }): ReactNode {
  const ctx = useRenderer();
  const { components, directives, theme } = ctx;

  if (node.type === 'root') {
    const rootChildren = (node as RootNode).children;
    // When text selection is enabled, group consecutive text-like blocks
    // (paragraph/heading/hr/list) into a single TextInput so selection can
    // flow across them ChatGPT-style. Non-text blocks (code, table,
    // blockquote, image, directive, html) stay as their own renderers and
    // intentionally break the selection range — matches ChatGPT's own UX.
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
  return (
    <Comp node={node} theme={theme}>
      {inner}
    </Comp>
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

// ---- selectable grouping --------------------------------------------------
//
// When textSelection is enabled, consecutive text-like blocks are rendered
// as children of a single <TextInput> so iOS (UITextView) treats them as
// one attributed-text range. Selection + highlight flow across blocks.
// Non-groupable blocks (backgrounds, 2D layouts, custom renderers) break
// the grouping and render via the normal pipeline.

const GROUPABLE_TYPES: ReadonlySet<NodeType> = new Set<NodeType>([
  'paragraph',
  'heading',
  'thematicBreak',
  'list',
]);

type Group =
  | { kind: 'text'; nodes: AnyNode[] }
  | { kind: 'block'; node: AnyNode };

function groupBlocks(nodes: AnyNode[]): Group[] {
  const out: Group[] = [];
  let buf: AnyNode[] = [];
  for (const n of nodes) {
    if (GROUPABLE_TYPES.has(n.type as NodeType)) {
      buf.push(n);
    } else {
      if (buf.length > 0) {
        out.push({ kind: 'text', nodes: buf });
        buf = [];
      }
      out.push({ kind: 'block', node: n });
    }
  }
  if (buf.length > 0) out.push({ kind: 'text', nodes: buf });
  return out;
}

function SelectableGroupedChildren({ nodes }: { nodes: AnyNode[] }) {
  const { theme } = useRenderer();
  const groups = useMemo(() => groupBlocks(nodes), [nodes]);
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
        return (
          <TextInput
            key={`g-${gi}`}
            editable={false}
            multiline
            scrollEnabled={false}
            textAlignVertical="top"
            style={{ marginVertical: theme.spacing.sm }}
          >
            {g.nodes.map((n, i) => (
              <Fragment key={n.id ?? `n-${i}`}>
                {inlineRenderBlock(n, theme)}
                {i < g.nodes.length - 1 ? <Text>{'\n\n'}</Text> : null}
              </Fragment>
            ))}
          </TextInput>
        );
      })}
    </>
  );
}

/** Render a block-level node as an attributed <Text> element suitable for
 *  nesting inside a parent <TextInput>. Used only inside text-groups. */
function inlineRenderBlock(node: AnyNode, theme: Theme): ReactNode {
  if (node.type === 'paragraph') {
    const p = node as ParagraphNode;
    return (
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.typography.sizeBase,
          lineHeight: theme.typography.sizeBase * theme.typography.lineHeight,
        }}
      >
        {inlineRenderMany(p.children as AnyNode[], theme)}
      </Text>
    );
  }
  if (node.type === 'heading') {
    const h = node as HeadingNode;
    const sizeMap: Record<number, number> = {
      1: theme.typography.sizeH1,
      2: theme.typography.sizeH2,
      3: theme.typography.sizeH3,
      4: theme.typography.sizeH4,
      5: theme.typography.sizeBase,
      6: theme.typography.sizeBase,
    };
    return (
      <Text style={{ color: theme.colors.text, fontSize: sizeMap[h.depth], fontWeight: '700' }}>
        {inlineRenderMany(h.children as AnyNode[], theme)}
      </Text>
    );
  }
  if (node.type === 'thematicBreak') {
    return <Text style={{ color: theme.colors.textMuted }}>{'\n──────────\n'}</Text>;
  }
  if (node.type === 'list') {
    const list = node as ListNode;
    const start = list.start ?? 1;
    return (
      <Text>
        {list.children.map((item, i) => {
          const marker = list.ordered ? `${start + i}. ` : '•  ';
          const li = item as ListItemNode;
          return (
            <Text key={li.id ?? i}>
              {marker}
              {inlineRenderMany(li.children as AnyNode[], theme)}
              {i < list.children.length - 1 ? '\n' : ''}
            </Text>
          );
        })}
      </Text>
    );
  }
  return null;
}

/** Render an inline (or nested block) node as attributed text. */
function inlineRenderOne(node: AnyNode, theme: Theme): ReactNode {
  switch (node.type) {
    case 'text':
      return (node as TextNode).value;
    case 'break':
      return '\n';
    case 'strong':
      return (
        <Text style={{ fontWeight: '700' }}>
          {inlineRenderMany(((node as { children?: AnyNode[] }).children ?? []) as AnyNode[], theme)}
        </Text>
      );
    case 'emphasis':
      return (
        <Text style={{ fontStyle: 'italic' }}>
          {inlineRenderMany(((node as { children?: AnyNode[] }).children ?? []) as AnyNode[], theme)}
        </Text>
      );
    case 'delete':
      return (
        <Text style={{ textDecorationLine: 'line-through' }}>
          {inlineRenderMany(((node as { children?: AnyNode[] }).children ?? []) as AnyNode[], theme)}
        </Text>
      );
    case 'inlineCode':
      return (
        <Text
          style={{
            fontFamily: theme.typography.monoFamily,
            color: theme.colors.codeText,
            backgroundColor: theme.colors.codeBackground,
          }}
        >
          {(node as InlineCodeNode).value}
        </Text>
      );
    case 'link':
      return (
        <Text style={{ color: theme.colors.link, textDecorationLine: 'underline' }}>
          {inlineRenderMany((node as LinkNode).children as AnyNode[], theme)}
        </Text>
      );
    // Block-level nodes reached as descendants (e.g. list-item → paragraph):
    // render their children inline without their own block styling.
    case 'paragraph':
    case 'listItem':
      return inlineRenderMany(
        ((node as { children?: AnyNode[] }).children ?? []) as AnyNode[],
        theme
      );
    default:
      return null;
  }
}

function inlineRenderMany(nodes: AnyNode[], theme: Theme): ReactNode {
  return nodes.map((n, i) => (
    <Fragment key={n.id ?? `m-${i}`}>{inlineRenderOne(n, theme)}</Fragment>
  ));
}
