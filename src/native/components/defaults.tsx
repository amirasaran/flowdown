import { createContext, memo, useContext, useState, type ReactNode } from 'react';
// @ts-ignore - react-native peer dep
import { useWindowDimensions } from 'react-native';
import type { Theme } from '../../shared/types';
import type {
  HeadingNode,
  ParagraphNode,
  TextNode,
  CodeNode,
  InlineCodeNode,
  LinkNode,
  ImageNode,
  BlockquoteNode,
  ListNode,
  ListItemNode,
  TableNode,
  TableCellNode,
  BaseNode,
} from '../../core/parser/ast';
import { View, Text, TextInput, Image, Linking, Pressable } from '../rn';
import { HScroll } from '../scroll/HScroll';
import {
  SelectableStringText,
  useTextSelection,
  warnRichParagraphOnce,
} from './selectableText';

/** True when every AST child is a plain text node — i.e. the block has no
 *  bold/italic/link/inline-code children. Such blocks can render via
 *  <TextInput editable={false}> (which shows selection highlight correctly
 *  on iOS Fabric) without losing any formatting. */
function allPlainText(children: Array<{ type: string }>): boolean {
  return children.length > 0 && children.every((c) => c.type === 'text');
}

/** Concat plain-text children into a single string. */
function flattenPlainText(children: Array<{ type: string; value?: string }>): string {
  return children.map((c) => c.value ?? '').join('');
}

const memoEqual = (
  a: { node: BaseNode; theme: Theme },
  b: { node: BaseNode; theme: Theme }
) => a.node.id === b.node.id && a.theme === b.theme;

export const RootR = memo(function RootR({ children }: { children?: ReactNode; theme: Theme }) {
  return <View>{children}</View>;
});

export const HeadingR = memo(function HeadingR({
  node,
  children,
  theme,
}: {
  node: HeadingNode;
  children?: ReactNode;
  theme: Theme;
}) {
  const sel = useTextSelection();
  const sizeMap: Record<number, number> = {
    1: theme.typography.sizeH1,
    2: theme.typography.sizeH2,
    3: theme.typography.sizeH3,
    4: theme.typography.sizeH4,
    5: theme.typography.sizeBase,
    6: theme.typography.sizeBase,
  };
  const headingStyle = {
    fontSize: sizeMap[node.depth],
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    writingDirection: node.dir,
  };
  // When selection is on, use TextInput instead of Text. On iOS multiline
  // TextInput maps to UITextView, which supports attributed text from
  // <Text> children AND renders selection highlights correctly (the plain
  // <Text selectable> does not on Fabric). On plain headings we use `value`
  // since there's no rich formatting to preserve.
  if (sel.enabled) {
    if (allPlainText(node.children)) {
      return (
        <TextInput
          value={flattenPlainText(node.children)}
          editable={false}
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
          style={headingStyle}
        />
      );
    }
    return (
      <TextInput
        editable={false}
        multiline
        scrollEnabled={false}
        textAlignVertical="top"
        style={headingStyle}
      >
        {children}
      </TextInput>
    );
  }
  return <Text style={headingStyle}>{children}</Text>;
}, memoEqual);

export const ParagraphR = memo(function ParagraphR({
  node,
  children,
  theme,
}: {
  node: ParagraphNode;
  children?: ReactNode;
  theme: Theme;
}) {
  const sel = useTextSelection();
  // RN forbids <Image> (and most non-Text views) as a child of <Text>. If the
  // paragraph contains any image child, fall back to a View wrapper so each
  // rendered child becomes a block-level sibling instead of a Text descendant.
  const hasBlockChild = node.children.some((c) => c.type === 'image');
  if (hasBlockChild) {
    return (
      <View
        style={{
          marginVertical: theme.spacing.sm,
          gap: theme.spacing.xs,
        }}
      >
        {children}
      </View>
    );
  }
  const paragraphStyle = {
    color: theme.colors.text,
    fontSize: theme.typography.sizeBase,
    lineHeight: theme.typography.sizeBase * theme.typography.lineHeight,
    marginVertical: theme.spacing.sm,
    writingDirection: node.dir,
  };
  // Use TextInput when selection is enabled. On iOS multiline TextInput is
  // a UITextView which accepts <Text> children as attributed text AND
  // renders selection highlights properly (the plain <Text selectable>
  // does not on Fabric). For rich paragraphs (with bold/italic/link/code
  // children) we keep children as-is so formatting is preserved; for
  // plain-text paragraphs we go through `value` for a tighter render.
  if (sel.enabled) {
    if (allPlainText(node.children)) {
      return (
        <TextInput
          value={flattenPlainText(node.children)}
          editable={false}
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
          style={paragraphStyle}
        />
      );
    }
    // Rich children: custom menu actions via react-native-selectable-text
    // still can't reach these (that lib needs a flat value string).
    if (sel.actions && sel.actions.length > 0) warnRichParagraphOnce();
    return (
      <TextInput
        editable={false}
        multiline
        scrollEnabled={false}
        textAlignVertical="top"
        style={paragraphStyle}
      >
        {children}
      </TextInput>
    );
  }
  return <Text style={paragraphStyle}>{children}</Text>;
}, memoEqual);

export const TextR = memo(function TextR({ node }: { node: TextNode; theme: Theme }) {
  return <Text>{node.value}</Text>;
}, memoEqual);

export const StrongR = function StrongR({
  children,
}: {
  children?: ReactNode;
  theme: Theme;
}) {
  return <Text style={{ fontWeight: '700' }}>{children}</Text>;
};

export const EmphasisR = function EmphasisR({
  children,
}: {
  children?: ReactNode;
  theme: Theme;
}) {
  return <Text style={{ fontStyle: 'italic' }}>{children}</Text>;
};

export const DeleteR = function DeleteR({
  children,
}: {
  children?: ReactNode;
  theme: Theme;
}) {
  return <Text style={{ textDecorationLine: 'line-through' }}>{children}</Text>;
};

export const InlineCodeR = memo(function InlineCodeR({
  node,
  theme,
}: {
  node: InlineCodeNode;
  theme: Theme;
}) {
  return (
    <Text
      style={{
        fontFamily: theme.typography.monoFamily,
        backgroundColor: theme.colors.codeBackground,
        color: theme.colors.codeText,
        fontSize: theme.typography.sizeBase * 0.9,
        paddingHorizontal: 4,
        borderRadius: theme.radii.sm,
      }}
    >
      {node.value}
    </Text>
  );
}, memoEqual);

export const CodeR = memo(function CodeR({ node, theme }: { node: CodeNode; theme: Theme }) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.codeBackground,
        borderRadius: theme.radii.md,
        padding: theme.spacing.md,
        marginVertical: theme.spacing.sm,
      }}
    >
      <HScroll>
        <SelectableStringText
          value={node.value}
          style={{
            fontFamily: theme.typography.monoFamily,
            color: theme.colors.codeText,
            fontSize: theme.typography.sizeSmall,
          }}
        />
      </HScroll>
    </View>
  );
}, memoEqual);

export const BlockquoteR = memo(function BlockquoteR({
  node,
  children,
  theme,
}: {
  node: BlockquoteNode;
  children?: ReactNode;
  theme: Theme;
}) {
  const isRtl = node.dir === 'rtl';
  return (
    <View
      style={{
        flexDirection: isRtl ? 'row-reverse' : 'row',
        marginVertical: theme.spacing.sm,
      }}
    >
      <View
        style={{
          width: 4,
          backgroundColor: theme.colors.blockquoteBar,
          borderRadius: 2,
          marginRight: isRtl ? 0 : theme.spacing.md,
          marginLeft: isRtl ? theme.spacing.md : 0,
        }}
      />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}, memoEqual);

export const ListR = memo(function ListR({
  children,
  theme,
}: {
  node: ListNode;
  children?: ReactNode;
  theme: Theme;
}) {
  return <View style={{ marginVertical: theme.spacing.sm }}>{children}</View>;
}, memoEqual);

export const ListItemR = memo(function ListItemR({
  node,
  children,
  theme,
}: {
  node: ListItemNode;
  children?: ReactNode;
  theme: Theme;
}) {
  const rtl = node.dir === 'rtl';
  const isTask = node.checked !== undefined && node.checked !== null;
  const marker = isTask ? (node.checked ? '☑' : '☐') : '•';
  // ParagraphR (the default child of every list item in our parser) applies
  // marginVertical: theme.spacing.sm to its text. The marker sits in a Text
  // of its own with no margin, so without this offset it floats above the
  // first line of content. Matching top margin puts them on the same line.
  return (
    <View
      style={{
        flexDirection: rtl ? 'row-reverse' : 'row',
        marginBottom: theme.spacing.xs,
      }}
    >
      <Text
        style={{
          color: theme.colors.textMuted,
          marginRight: rtl ? 0 : theme.spacing.sm,
          marginLeft: rtl ? theme.spacing.sm : 0,
          marginTop: theme.spacing.sm,
          width: isTask ? 20 : 16,
          fontSize: isTask ? theme.typography.sizeBase : theme.typography.sizeBase,
          lineHeight: theme.typography.sizeBase * theme.typography.lineHeight,
          textAlign: rtl ? 'right' : 'left',
        }}
      >
        {marker}
      </Text>
      {/* flexBasis:'auto' is critical — with flex:1's default flexBasis:0,
          if the row has no definite parent width (common in chat bubbles
          sized to content), this wrapper collapses to zero and forces the
          text inside to wrap word-by-word. auto lets it start at content
          width and only shrink when capped by an ancestor maxWidth. */}
      <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0 }}>
        {children}
      </View>
    </View>
  );
}, memoEqual);

export const LinkR = memo(function LinkR({
  node,
  children,
  theme,
}: {
  node: LinkNode;
  children?: ReactNode;
  theme: Theme;
}) {
  return (
    <Text
      style={{ color: theme.colors.link, textDecorationLine: 'underline' }}
      onPress={() => Linking.openURL(node.url)}
    >
      {children}
    </Text>
  );
}, memoEqual);

export const ImageR = memo(function ImageR({
  node,
  theme,
}: {
  node: ImageNode;
  theme: Theme;
}) {
  // Measure the loaded image's natural dimensions so we can compute a real
  // aspect ratio; fall back to 16:9 while the image is still loading or if
  // it fails. Capped by maxHeight so portraits can't dominate the screen.
  const [ratio, setRatio] = useState<number | null>(null);
  return (
    <View style={{ marginVertical: theme.spacing.sm }}>
      <Image
        source={{ uri: node.url }}
        accessibilityLabel={node.alt}
        onLoad={(e: unknown) => {
          const src = (e as { nativeEvent?: { source?: { width: number; height: number } } })
            ?.nativeEvent?.source;
          if (src && src.width > 0 && src.height > 0) {
            setRatio(src.width / src.height);
          }
        }}
        style={
          {
            width: '100%',
            aspectRatio: ratio ?? 16 / 9,
            maxHeight: 400,
            resizeMode: 'contain',
            borderRadius: theme.radii.sm,
            backgroundColor: theme.colors.codeBackground,
          } as unknown as object
        }
      />
    </View>
  );
}, memoEqual);

export const ThematicBreakR = memo(
  function ThematicBreakR({ theme }: { theme: Theme }) {
    return (
      <View
        style={{
          height: 1,
          backgroundColor: theme.colors.border,
          marginVertical: theme.spacing.lg,
        }}
      />
    );
  },
  (a, b) => a.theme === b.theme
);

/** Conservative guess of horizontal chrome around a table (card padding +
 *  safe area). Anything left over after this becomes the "available" width. */
const TABLE_HORIZ_CHROME = 48;

/** The concrete per-cell width, pushed down from TableR so every cell — in
 *  every row — renders at the exact same width. This is what guarantees
 *  alignment, where Yoga's flex:1 was unreliable with variable RTL content. */
const TableColumnWidthContext = createContext<number>(140);

export const TableR = memo(function TableR({
  node,
  children,
  theme,
}: {
  node: TableNode;
  children?: ReactNode;
  theme: Theme;
}) {
  const { width } = useWindowDimensions();
  const numCols = Math.max(1, node.align?.length ?? 1);
  const available = Math.max(0, width - TABLE_HORIZ_CHROME);
  // Fit the viewport when we can, overflow (scroll) when we can't.
  // `theme.layout.tableColumnWidth` is the per-column target; raise it for
  // roomier cells (and more horizontal scroll on narrow viewports).
  const idealColWidth = theme.layout.tableColumnWidth;
  const tableWidth = Math.max(numCols * idealColWidth, available);
  const perCol = Math.floor(tableWidth / numCols);
  return (
    <TableColumnWidthContext.Provider value={perCol}>
      <HScroll style={{ marginVertical: theme.spacing.sm }}>
        <View
          style={{
            width: perCol * numCols,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radii.sm,
            overflow: 'hidden',
          }}
        >
          {children}
        </View>
      </HScroll>
    </TableColumnWidthContext.Provider>
  );
}, memoEqual);

export const TableRowR = function TableRowR({
  children,
}: {
  children?: ReactNode;
  theme: Theme;
}) {
  // `direction: 'ltr'` pins the flex main axis so RTL cell content can't
  // silently flip column order on iOS.
  return (
    <View style={{ flexDirection: 'row', direction: 'ltr' }}>
      {children}
    </View>
  );
};

export const TableCellR = memo(function TableCellR({
  node,
  children,
  theme,
}: {
  node: TableCellNode;
  children?: ReactNode;
  theme: Theme;
}) {
  const colWidth = useContext(TableColumnWidthContext);
  const sel = useTextSelection();
  const cellTextStyle = {
    color: theme.colors.text,
    fontWeight: (node.header ? '600' : '400') as '600' | '400',
  };
  return (
    <View
      style={{
        width: colWidth,
        borderWidth: 0.5,
        borderColor: theme.colors.border,
        padding: theme.spacing.sm,
        justifyContent: 'center',
      }}
    >
      {sel.enabled ? (
        allPlainText(node.children) ? (
          <TextInput
            value={flattenPlainText(node.children)}
            editable={false}
            multiline
            scrollEnabled={false}
            textAlignVertical="top"
            style={cellTextStyle}
          />
        ) : (
          <TextInput
            editable={false}
            multiline
            scrollEnabled={false}
            textAlignVertical="top"
            style={cellTextStyle}
          >
            {children}
          </TextInput>
        )
      ) : (
        <Text style={cellTextStyle}>{children}</Text>
      )}
    </View>
  );
}, memoEqual);

export const BreakR = memo(function BreakR() {
  return <Text>{'\n'}</Text>;
});

export const PressableLink = Pressable;
