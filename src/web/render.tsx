import { Fragment, type ReactNode, type ComponentType } from 'react';
import type {
  AnyNode,
  BlockNode,
  InlineNode,
  RootNode,
  DirectiveNode,
} from '../core/parser/ast';
import type {
  BlockSlots,
  BlockSlot as BlockSlotT,
  DirectiveComponentProps,
  NodeRendererProps,
  Theme,
} from '../shared/types';
import { useRenderer } from '../core/registry/componentRegistry';
import * as D from './components/defaults';

export function RenderNode({ node }: { node: AnyNode }): ReactNode {
  const ctx = useRenderer();
  const { components, directives, theme } = ctx;

  if (node.type === 'root') return <RenderChildren nodes={(node as RootNode).children} />;

  if (node.type === 'directive') {
    const dn = node as DirectiveNode;
    const Comp = directives[dn.name];
    if (!Comp) {
      // Unregistered: render as plain text fallback so message doesn't blank out
      return <span style={{ color: theme.colors.textMuted }}>[{dn.name}]</span>;
    }
    const children = dn.children
      ? <RenderChildren nodes={dn.children as AnyNode[]} />
      : undefined;
    const props: DirectiveComponentProps = {
      node: dn,
      attributes: dn.attributes,
      theme,
      ...(dn.value !== undefined ? { value: dn.value } : {}),
      ...(children !== undefined ? { children } : {}),
    };
    return (
      <ErrorBoundary fallback={<span style={{ color: theme.colors.textMuted }}>[{dn.name} error]</span>}>
        <Comp {...props} />
      </ErrorBoundary>
    );
  }

  const Override = (components as Record<string, ComponentType<NodeRendererProps> | undefined>)[
    node.type
  ];
  const Default = getDefault(node.type);

  const inner = hasChildren(node) ? <RenderChildren nodes={(node as BlockNode & { children: AnyNode[] }).children} /> : undefined;

  const Comp = Override ?? Default;
  if (!Comp) return null;
  const rendered = (
    <Comp node={node} theme={theme}>
      {inner}
    </Comp>
  );
  return applyBlockSlots(node, rendered, ctx.blockSlots, theme);
}

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
    <div>
      {hasBefore ? slot.before!(node) : null}
      {rendered}
      {hasAfter ? slot.after!(node) : null}
      {hasActions ? <BlockActionBar actions={slot.actions!} node={node} theme={theme} /> : null}
    </div>
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
    <div
      style={{
        display: 'flex',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.sm,
        flexWrap: 'wrap',
      }}
    >
      {actions.map((a, i) => (
        <button
          key={`${a.label}-${i}`}
          type="button"
          onClick={() => a.onPress(node)}
          style={{
            padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
            borderRadius: theme.radii.md,
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text,
            fontSize: theme.typography.sizeSmall,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {a.label}
        </button>
      ))}
    </div>
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
  switch (type) {
    case 'root':
      return D.RootR as unknown as ComponentType<NodeRendererProps>;
    case 'heading':
      return D.HeadingR as unknown as ComponentType<NodeRendererProps>;
    case 'paragraph':
      return D.ParagraphR as unknown as ComponentType<NodeRendererProps>;
    case 'text':
      return D.TextR as unknown as ComponentType<NodeRendererProps>;
    case 'strong':
      return D.StrongR as unknown as ComponentType<NodeRendererProps>;
    case 'emphasis':
      return D.EmphasisR as unknown as ComponentType<NodeRendererProps>;
    case 'delete':
      return D.DeleteR as unknown as ComponentType<NodeRendererProps>;
    case 'inlineCode':
      return D.InlineCodeR as unknown as ComponentType<NodeRendererProps>;
    case 'code':
      return D.CodeR as unknown as ComponentType<NodeRendererProps>;
    case 'blockquote':
      return D.BlockquoteR as unknown as ComponentType<NodeRendererProps>;
    case 'list':
      return D.ListR as unknown as ComponentType<NodeRendererProps>;
    case 'listItem':
      return D.ListItemR as unknown as ComponentType<NodeRendererProps>;
    case 'link':
      return D.LinkR as unknown as ComponentType<NodeRendererProps>;
    case 'image':
      return D.ImageR as unknown as ComponentType<NodeRendererProps>;
    case 'thematicBreak':
      return D.ThematicBreakR as unknown as ComponentType<NodeRendererProps>;
    case 'table':
      return D.TableR as unknown as ComponentType<NodeRendererProps>;
    case 'tableRow':
      return D.TableRowR as unknown as ComponentType<NodeRendererProps>;
    case 'tableCell':
      return D.TableCellR as unknown as ComponentType<NodeRendererProps>;
    case 'break':
      return D.BreakR as unknown as ComponentType<NodeRendererProps>;
    case 'html':
      return D.HtmlR as unknown as ComponentType<NodeRendererProps>;
    default:
      return null;
  }
}

import { Component } from 'react';

interface EBProps {
  children: ReactNode;
  fallback: ReactNode;
}
interface EBState {
  hasError: boolean;
}

class ErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    // swallow; error boundary is scoped to a single directive
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
