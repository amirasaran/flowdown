import { useMemo } from 'react';
import type { LLMMarkdownProps } from '../shared/types';
import { useLLMMarkdown } from '../core/hooks/useLLMMarkdown';
import {
  RendererContext,
  type RendererContextValue,
} from '../core/registry/componentRegistry';
import { defaultTheme, mergeTheme } from '../core/registry/theme';
import { normalizeTextSelection } from '../core/textSelection';
import { Card } from './Card';
import { RenderNode } from './render';

export function LLMMarkdown(props: LLMMarkdownProps) {
  const {
    text,
    streaming = true,
    components,
    directives,
    before,
    after,
    header,
    footer,
    card,
    theme,
    direction = 'auto',
    textSelection,
    blockSlots,
  } = props;

  const mergedTheme = useMemo(() => mergeTheme(defaultTheme, theme), [theme]);
  const normalizedSelection = useMemo(
    () => normalizeTextSelection(textSelection),
    [textSelection]
  );
  const { tree } = useLLMMarkdown(text, { streaming, direction });

  const ctxValue = useMemo<RendererContextValue>(() => {
    const base: RendererContextValue = {
      components: components ?? {},
      directives: directives ?? {},
      theme: mergedTheme,
      direction,
      textSelection: normalizedSelection,
      blockSlots: blockSlots ?? {},
    };
    if (props.onHeadingInView) base.onHeadingInView = props.onHeadingInView;
    return base;
  }, [components, directives, mergedTheme, direction, normalizedSelection, blockSlots, props.onHeadingInView]);

  return (
    <RendererContext.Provider value={ctxValue}>
      <Card
        theme={mergedTheme}
        direction={direction}
        {...(card ? { config: card } : {})}
        {...(header ? { header } : {})}
        {...(before ? { before } : {})}
        {...(after ? { after } : {})}
        {...(footer ? { footer } : {})}
      >
        <RenderNode node={tree} />
      </Card>
    </RendererContext.Provider>
  );
}

export { defaultTheme, darkTheme } from '../core/registry/theme';
export { useLLMMarkdown } from '../core/hooks/useLLMMarkdown';
export type {
  LLMMarkdownProps,
  ComponentOverrides,
  DirectiveRegistry,
  DirectiveComponentProps,
  NodeRendererProps,
  CardConfig,
  CardAnimationPreset,
  TextSelection,
  TextSelectionConfig,
  TextSelectionAction,
  BlockSlots,
  BlockSlot,
  BlockAction,
  Theme,
  Direction,
  BlockNode,
  InlineNode,
  DirectiveNode,
  RootNode,
  AnyNode,
} from '../shared/types';
export type {
  HeadingNode,
  ParagraphNode,
  TextNode,
  StrongNode,
  EmphasisNode,
  DeleteNode,
  InlineCodeNode,
  CodeNode,
  BlockquoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  ImageNode,
  ThematicBreakNode,
  TableNode,
  TableRowNode,
  TableCellNode,
  HtmlNode,
  BreakNode,
  BaseNode,
  NodeType,
} from '../core/parser/ast';
