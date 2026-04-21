import { useEffect, useState, type CSSProperties, type RefObject } from 'react';
import type { TextSelectionConfig, Theme } from '../shared/types';

interface Position {
  top: number;
  left: number;
}

/** Floating action bar anchored just above the user's current text selection.
 *  Only renders when a selection exists inside `rootRef` and the config has
 *  `actions` — otherwise the browser's default context menu is the UX. */
export function SelectionActionBar({
  config,
  rootRef,
  theme,
}: {
  config: TextSelectionConfig;
  rootRef: RefObject<HTMLDivElement | null>;
  theme: Theme;
}) {
  const [position, setPosition] = useState<Position | null>(null);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    if (!config.enabled) return;
    // Recompute anchor + emit onSelect whenever the page selection changes.
    // We listen on document because `selectionchange` doesn't bubble to
    // arbitrary nodes; we then gate on "is the selection inside this card?"
    const handler = () => {
      const sel = typeof window !== 'undefined' ? window.getSelection() : null;
      const rootEl = rootRef.current;
      if (!sel || sel.isCollapsed || !rootEl) {
        setPosition(null);
        setSelectedText('');
        if (config.onSelect) config.onSelect('');
        return;
      }
      const anchor = sel.anchorNode;
      const focus = sel.focusNode;
      if (!anchor || !focus || !rootEl.contains(anchor) || !rootEl.contains(focus)) {
        setPosition(null);
        setSelectedText('');
        return;
      }
      const text = sel.toString();
      if (!text) {
        setPosition(null);
        setSelectedText('');
        return;
      }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const rootRect = rootEl.getBoundingClientRect();
      setPosition({
        top: rect.top - rootRect.top - 44,
        left: rect.left - rootRect.left + rect.width / 2,
      });
      setSelectedText(text);
      if (config.onSelect) config.onSelect(text);
    };
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, [config, rootRef]);

  const actions = config.actions;
  if (!position || !actions || actions.length === 0 || !selectedText) return null;

  const barStyle: CSSProperties = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 2,
    padding: 4,
    background: theme.colors.text,
    color: theme.colors.background,
    borderRadius: theme.radii.md,
    boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
    zIndex: 50,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.sizeSmall,
    pointerEvents: 'auto',
    // onMouseDown below preventDefault's to stop the browser from collapsing
    // the selection before the click handler runs.
    userSelect: 'none',
  };

  const btnStyle: CSSProperties = {
    background: 'transparent',
    color: 'inherit',
    border: 0,
    padding: '6px 10px',
    borderRadius: theme.radii.sm,
    cursor: 'pointer',
    font: 'inherit',
    whiteSpace: 'nowrap',
  };

  return (
    <div
      style={barStyle}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    >
      {actions.map((action, i) => (
        <button
          key={i}
          type="button"
          style={btnStyle}
          onClick={() => {
            action.onPress(selectedText);
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
