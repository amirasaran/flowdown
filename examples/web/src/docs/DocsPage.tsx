import { useMemo, useState, useEffect } from 'react';
import { LLMMarkdown, darkTheme } from 'llm-markdown/web';
import type { ComponentOverrides, DirectiveRegistry } from 'llm-markdown/web';
import { MOBILE_QUERY, useMediaQuery } from '../useMediaQuery';
import { Drawer } from '../components/Drawer';
import { AppNav } from '../components/AppNav';
import type { Route } from '../router';
import { Chart } from '../directives/Chart';
import { Callout } from '../directives/Callout';
import { FONT_STACK, MONO_STACK } from '../fonts';
import { DocsCodeBlock } from './CodeBlock';
import { DocsHeading } from './DocsHeading';
import { buildToc, TOC } from './TOC';
import { docsMarkdown } from './docs-content';

export function DocsPage({ onNavigate }: { onNavigate: (r: Route) => void }) {
  const [dark, setDark] = useState(false);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  const toc = useMemo(() => buildToc(docsMarkdown), []);

  const components: ComponentOverrides = useMemo(
    () => ({
      code: DocsCodeBlock,
      heading: DocsHeading,
    }),
    []
  );
  const directives: DirectiveRegistry = useMemo(
    () => ({ chart: Chart, callout: Callout }),
    []
  );

  const bg = dark ? '#0B0B0F' : '#FAFAFB';
  const surface = dark ? '#14141A' : '#FFFFFF';
  const border = dark ? '#2A2A33' : '#E5E7EB';
  const fg = dark ? '#F3F4F6' : '#111827';
  const muted = dark ? '#9CA3AF' : '#6B7280';

  return (
    <div style={{ minHeight: '100vh', background: bg, color: fg }}>
      {/* Top bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: surface,
          borderBottom: `1px solid ${border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: isMobile ? '10px 12px' : '12px 24px',
        }}
      >
        {isMobile ? (
          <button
            aria-label="Open table of contents"
            onClick={() => setDrawerOpen(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: `1px solid ${border}`,
              background: dark ? '#1F1F27' : '#ffffff',
              color: fg,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HamburgerIcon />
          </button>
        ) : null}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: muted, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            llm-markdown
          </div>
          <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 700 }}>Documentation</div>
        </div>
        <AppNav current="/docs" onNavigate={onNavigate} dark={dark} />
        <button
          onClick={() => setDark((v) => !v)}
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: `1px solid ${border}`,
            background: dark ? '#1F1F27' : '#ffffff',
            color: fg,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: isMobile ? 16 : 24,
          display: isMobile ? 'block' : 'grid',
          gridTemplateColumns: isMobile ? undefined : 'minmax(0, 240px) minmax(0, 1fr)',
          gap: 32,
          alignItems: 'start',
        }}
      >
        {/* Desktop TOC */}
        {isMobile ? null : (
          <aside
            style={{
              position: 'sticky',
              top: 80,
              maxHeight: 'calc(100vh - 96px)',
              overflow: 'auto',
              background: surface,
              border: `1px solid ${border}`,
              borderRadius: 12,
            }}
          >
            <TOC entries={toc} dark={dark} />
          </aside>
        )}

        {/* Main content */}
        <main
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 12,
            padding: isMobile ? 16 : 32,
            maxWidth: '100%',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          <LLMMarkdown
            text={docsMarkdown}
            streaming={false}
            components={components}
            directives={directives}
            theme={{
              ...(dark ? darkTheme : {}),
              typography: {
                fontFamily: FONT_STACK,
                monoFamily: MONO_STACK,
                sizeBase: 15,
                lineHeight: 1.65,
              },
            }}
            card={{
              animation: 'none',
              backgroundColor: 'transparent',
              borderWidth: 0,
              padding: 0,
              radius: 0,
            }}
          />
        </main>
      </div>

      {/* Mobile TOC drawer */}
      {isMobile ? (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} dark={dark}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: `1px solid ${border}`,
            }}
          >
            <div style={{ fontWeight: 700 }}>Contents</div>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: dark ? '#1F1F27' : '#ffffff',
                color: fg,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
          <div style={{ overflow: 'auto', flex: 1 }}>
            <TOC
              entries={toc}
              dark={dark}
              onPick={() => setDrawerOpen(false)}
            />
          </div>
        </Drawer>
      ) : null}
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
    </svg>
  );
}
