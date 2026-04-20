import React, { useState } from 'react';
import type { NodeRendererProps, CodeNode } from 'llm-markdown/web';

/**
 * Custom code-block renderer used on the Docs page. Demonstrates the
 * component-override contract: we receive the parsed node and theme, and
 * return whatever JSX we want.
 *
 * Features: language badge, copy button, horizontal scroll for long lines,
 * theme-aware colors.
 */
export const DocsCodeBlock = React.memo(
  function DocsCodeBlock({ node, theme }: NodeRendererProps) {
    const c = node as CodeNode;
    const [copied, setCopied] = useState(false);

    return (
      <figure
        style={{
          margin: `${theme.spacing.md}px 0`,
          borderRadius: theme.radii.md,
          background: theme.colors.codeBackground,
          overflow: 'hidden',
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 12px',
            background: 'rgba(127,127,127,0.08)',
            fontSize: 12,
            color: theme.colors.textMuted,
            fontFamily: theme.typography.monoFamily,
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <span style={{ textTransform: 'lowercase' }}>{c.lang ?? 'text'}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(c.value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            style={{
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
              color: 'inherit',
              fontFamily: 'inherit',
              fontSize: 12,
              padding: '2px 6px',
              borderRadius: 6,
            }}
          >
            {copied ? 'copied ✓' : 'copy'}
          </button>
        </header>
        <pre
          style={{
            margin: 0,
            padding: 12,
            overflowX: 'auto',
            fontFamily: theme.typography.monoFamily,
            fontSize: 13,
            lineHeight: 1.55,
            color: theme.colors.codeText,
          }}
        >
          <code>{c.value}</code>
          {c.streaming ? <span style={{ opacity: 0.6 }}>▍</span> : null}
        </pre>
      </figure>
    );
  },
  (a, b) => a.node.id === b.node.id && a.theme === b.theme
);
