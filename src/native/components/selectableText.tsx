import { useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { RendererContext } from '../../core/registry/componentRegistry';
import { Text, TextInput } from '../rn';

/** Returns the `selectable` flag derived from `textSelection.enabled` in context.
 *  Also hands back the actions/onSelect config so call sites can opt into the
 *  `react-native-selectable-text` integration where it fits (plain-text blocks). */
export function useTextSelection() {
  const { textSelection } = useContext(RendererContext);
  return textSelection;
}

let warnedRichParagraph = false;
export function warnRichParagraphOnce() {
  if (warnedRichParagraph) return;
  warnedRichParagraph = true;
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.warn(
      '[llm-markdown] textSelection.actions are not applied to rich paragraphs (ones with formatting like **bold**, links, or inline code). The system menu is still available. Custom menu items currently work only on plain-text code blocks.'
    );
  }
}

/** Attempt to load the optional peer `react-native-selectable-text`. Returns
 *  the component if installed, else null. Safe to call from render. */
export function loadSelectableText(): SelectableTextComponent | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-selectable-text');
    return (mod.default ?? mod.SelectableText ?? null) as SelectableTextComponent | null;
  } catch {
    return null;
  }
}

type SelectableTextComponent = (props: {
  value: string;
  menuItems?: string[];
  style?: unknown;
  selectable?: boolean;
  onSelection?: (e: { nativeEvent: { content: string; eventType: string | number } }) => void;
}) => ReactNode;

let warnedMissingPeer = false;
export function warnMissingPeerOnce() {
  if (warnedMissingPeer) return;
  warnedMissingPeer = true;
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.warn(
      '[llm-markdown] textSelection.actions is set but `react-native-selectable-text` is not installed. Falling back to the system default selection menu. Run: pnpm add react-native-selectable-text'
    );
  }
}

/** Renders a string with text selection + optional custom menu items.
 *  Used for plain-text blocks (code blocks, table cells with string content). */
export function SelectableStringText({
  value,
  style,
}: {
  value: string;
  style?: unknown;
}) {
  const sel = useTextSelection();
  const SelectableTextImpl = useMemo(() => {
    if (!sel.enabled || !sel.actions || sel.actions.length === 0) return null;
    const impl = loadSelectableText();
    if (!impl) {
      warnMissingPeerOnce();
      return null;
    }
    return impl;
  }, [sel.enabled, sel.actions]);

  if (SelectableTextImpl && sel.actions && sel.actions.length > 0) {
    const actions = sel.actions;
    const labels = actions.map((a) => a.label);
    return (
      <SelectableTextImpl
        value={value}
        menuItems={labels}
        selectable
        style={style}
        onSelection={(e: { nativeEvent: { content: string; eventType: string | number } }) => {
          const idx =
            typeof e.nativeEvent.eventType === 'number'
              ? e.nativeEvent.eventType
              : parseInt(String(e.nativeEvent.eventType), 10);
          const action = actions[idx];
          if (action) action.onPress(e.nativeEvent.content);
          if (sel.onSelect) sel.onSelect(e.nativeEvent.content);
        }}
      />
    );
  }

  // `<Text selectable>` has a well-known RN Fabric bug on iOS where the
  // context menu appears but the blue selection highlight + handles do not
  // render. `<TextInput editable={false} multiline>` renders selection
  // correctly on both architectures, so we use it whenever selection is
  // enabled. Only works for plain-string content; rich inline formatting
  // has no TextInput equivalent.
  if (sel.enabled) {
    return (
      <TextInput
        value={value}
        editable={false}
        multiline
        scrollEnabled={false}
        textAlignVertical="top"
        style={style}
      />
    );
  }

  return <Text style={style}>{value}</Text>;
}
