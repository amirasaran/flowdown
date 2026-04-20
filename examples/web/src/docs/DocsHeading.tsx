import React from 'react';
import type { NodeRendererProps, HeadingNode } from 'llm-markdown/web';

/** Produce a URL-safe id from heading text so we can anchor-scroll to it. */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s\-\u0600-\u06FF\u0590-\u05FF]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function collectText(node: unknown): string {
  const n = node as { value?: string; children?: unknown[] };
  if (typeof n.value === 'string') return n.value;
  if (Array.isArray(n.children)) return n.children.map(collectText).join('');
  return '';
}

/**
 * Custom heading renderer — adds a stable anchor id derived from the
 * heading text so the TOC can scroll to it, and provides a self-link icon
 * on hover.
 */
export const DocsHeading = React.memo(
  function DocsHeading({ node, children, theme }: NodeRendererProps) {
    const h = node as HeadingNode;
    const plain = collectText(h);
    const id = slugify(plain);
    const sizeMap: Record<number, number> = {
      1: 32,
      2: 24,
      3: 19,
      4: 16,
      5: 14,
      6: 13,
    };
    const Tag = (`h${h.depth}` as unknown) as 'h1';
    return (
      <Tag
        id={id}
        dir={h.dir}
        style={{
          fontSize: sizeMap[h.depth],
          fontWeight: h.depth <= 2 ? 800 : 700,
          marginTop: h.depth === 1 ? 8 : h.depth === 2 ? 32 : 20,
          marginBottom: 8,
          color: theme.colors.text,
          scrollMarginTop: 80,
          letterSpacing: h.depth <= 2 ? -0.4 : 0,
        }}
      >
        {children}
      </Tag>
    );
  },
  (a, b) => a.node.id === b.node.id && a.theme === b.theme
);

export { slugify, collectText };
