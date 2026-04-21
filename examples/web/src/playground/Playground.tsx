import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { LLMMarkdown, darkTheme } from 'llm-markdown/web';
import type {
  BlockSlots,
  CardAnimationPreset,
  DirectiveRegistry,
  Direction,
  TextSelectionConfig,
} from 'llm-markdown/web';
import { presets } from '../../../shared/demo-content';
import { Chart } from '../directives/Chart';
import { Callout } from '../directives/Callout';
import { MOBILE_QUERY, useMediaQuery } from '../useMediaQuery';
import { Drawer } from '../components/Drawer';
import { AppNav } from '../components/AppNav';
import { FONT_STACK, MONO_STACK } from '../fonts';
import type { Route } from '../router';

const ANIMATIONS: CardAnimationPreset[] = ['none', 'fade', 'fadeSlide', 'scale', 'typewriter'];

export function Playground({
  onNavigate,
}: {
  onNavigate: (r: Route) => void;
}) {
  const [presetId, setPresetId] = useState(presets[0]!.id);
  const preset = useMemo(() => presets.find((p) => p.id === presetId) ?? presets[0]!, [presetId]);

  const [customText, setCustomText] = useState<string | null>(null);
  const source = customText ?? preset.text;

  const [streaming, setStreaming] = useState(true);
  const [charsPerTick, setCharsPerTick] = useState(12);
  const [tickMs, setTickMs] = useState(20);
  const [dark, setDark] = useState(false);
  const [direction, setDirection] = useState<Direction | 'auto'>('auto');
  const [animation, setAnimation] = useState<CardAnimationPreset>('fadeSlide');
  const [layoutAnimation, setLayoutAnimation] = useState(true);
  const [showBefore, setShowBefore] = useState(true);
  const [showAfter, setShowAfter] = useState(true);
  const [showHeader, setShowHeader] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [tableColumnWidth, setTableColumnWidth] = useState(140);

  const [text, setText] = useState('');
  const progressRef = useRef(0);

  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (!streaming) {
      setText(source);
      return;
    }
    setText('');
    progressRef.current = 0;
    const id = setInterval(() => {
      progressRef.current += charsPerTick;
      if (progressRef.current >= source.length) {
        setText(source);
        clearInterval(id);
      } else {
        setText(source.slice(0, progressRef.current));
      }
    }, tickMs);
    return () => clearInterval(id);
  }, [source, streaming, charsPerTick, tickMs]);

  const directives: DirectiveRegistry = useMemo(
    () => ({ chart: Chart, callout: Callout }),
    []
  );

  // Demo wiring: selection gets a custom action bar on web (Copy + Ask AI).
  const textSelection: TextSelectionConfig = useMemo(
    () => ({
      enabled: true,
      actions: [
        {
          label: 'Copy',
          onPress: (t) => void navigator.clipboard.writeText(t),
        },
        {
          label: 'Ask AI',
          onPress: (t) => window.alert(`Ask AI about:\n\n${t.slice(0, 120)}${t.length > 120 ? '…' : ''}`),
        },
      ],
    }),
    []
  );

  // Demo wiring: per-block toolbars for code, table, image.
  const blockSlots: BlockSlots = useMemo(
    () => ({
      code: {
        actions: [
          {
            label: 'Copy',
            onPress: (node) => void navigator.clipboard.writeText(node.value),
          },
          {
            label: 'Run',
            onPress: (node) =>
              window.alert(`Would execute ${node.lang ?? 'code'}:\n\n${node.value}`),
          },
        ],
      },
      table: {
        actions: [
          {
            label: 'Copy as CSV',
            onPress: (node) => {
              const csv = node.children
                .map((row) =>
                  row.children
                    .map((cell) =>
                      cell.children
                        .map((c) => ('value' in c ? (c as { value: string }).value : ''))
                        .join('')
                    )
                    .join(',')
                )
                .join('\n');
              void navigator.clipboard.writeText(csv);
            },
          },
        ],
      },
      image: {
        actions: [
          {
            label: 'Open',
            onPress: (node) => window.open(node.url, '_blank'),
          },
        ],
      },
    }),
    []
  );

  const bg = dark ? '#0B0B0F' : '#f3f4f6';
  const fg = dark ? '#F3F4F6' : '#111827';
  const muted = dark ? '#9CA3AF' : '#6B7280';

  const progressPct =
    source.length === 0 ? 100 : Math.min(100, (text.length / source.length) * 100);

  const sidebar = (
    <div style={{ padding: 16, overflow: 'auto', flex: 1 }}>
      <Section title="Preset" dark={dark}>
        <select
          value={customText === null ? presetId : '__custom'}
          onChange={(e) => {
            if (e.target.value === '__custom') return;
            setPresetId(e.target.value);
            setCustomText(null);
          }}
          style={selectStyle(dark)}
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
          {customText !== null ? <option value="__custom">Custom</option> : null}
        </select>
      </Section>

      <Section title="Custom markdown" dark={dark}>
        <textarea
          value={customText ?? ''}
          placeholder="Paste your own markdown here…"
          onChange={(e) => setCustomText(e.target.value)}
          rows={6}
          style={{
            ...inputStyle(dark),
            fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
            fontSize: 12,
            resize: 'vertical',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setCustomText(preset.text)} style={btn(dark)}>
            Load preset into editor
          </button>
          <button onClick={() => setCustomText(null)} style={btn(dark)}>
            Clear custom
          </button>
        </div>
      </Section>

      <Section title="Streaming" dark={dark}>
        <Toggle
          label="Enable streaming"
          checked={streaming}
          onChange={setStreaming}
          dark={dark}
        />
        <Row label={`Chars per tick: ${charsPerTick}`} dark={dark}>
          <input
            type="range"
            min={1}
            max={200}
            value={charsPerTick}
            onChange={(e) => setCharsPerTick(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </Row>
        <Row label={`Tick interval: ${tickMs}ms`} dark={dark}>
          <input
            type="range"
            min={5}
            max={500}
            value={tickMs}
            onChange={(e) => setTickMs(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </Row>
        <Row label={`~ ${Math.round((charsPerTick * 1000) / tickMs)} chars/sec`} dark={dark} />
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              height: 6,
              background: dark ? '#1F1F27' : '#E5E7EB',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPct}%`,
                background: '#6366F1',
                transition: 'width 120ms linear',
              }}
            />
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: muted }}>
            {text.length} / {source.length} chars
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              progressRef.current = 0;
              setText('');
              setStreaming(false);
              setTimeout(() => setStreaming(true), 0);
            }}
            style={btn(dark)}
          >
            Restart
          </button>
          <button onClick={() => setText(source)} style={btn(dark)}>
            Skip to end
          </button>
        </div>
      </Section>

      <Section title="Appearance" dark={dark}>
        <Toggle label="Dark mode" checked={dark} onChange={setDark} dark={dark} />
        <Row label="Direction" dark={dark}>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as Direction | 'auto')}
            style={selectStyle(dark)}
          >
            <option value="auto">auto (per block)</option>
            <option value="ltr">ltr</option>
            <option value="rtl">rtl</option>
          </select>
        </Row>
      </Section>

      <Section title="Card" dark={dark}>
        <Row label="Animation" dark={dark}>
          <select
            value={animation}
            onChange={(e) => setAnimation(e.target.value as CardAnimationPreset)}
            style={selectStyle(dark)}
          >
            {ANIMATIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Row>
        <Toggle
          label="Layout animation"
          checked={layoutAnimation}
          onChange={setLayoutAnimation}
          dark={dark}
        />
      </Section>

      <Section title="Tables (native theme token)" dark={dark}>
        <Row label={`Column width: ${tableColumnWidth}px`} dark={dark}>
          <input
            type="range"
            min={80}
            max={260}
            step={10}
            value={tableColumnWidth}
            onChange={(e) => setTableColumnWidth(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </Row>
        <div style={{ fontSize: 11, color: muted, lineHeight: 1.4 }}>
          On native this sets <code>theme.layout.tableColumnWidth</code>. HTML
          tables on web size themselves, so this knob is visualized here as the{' '}
          <code>min-width</code> of each column.
        </div>
      </Section>

      <Section title="Slots" dark={dark}>
        <Toggle label="Header" checked={showHeader} onChange={setShowHeader} dark={dark} />
        <Toggle label="Before" checked={showBefore} onChange={setShowBefore} dark={dark} />
        <Toggle label="After" checked={showAfter} onChange={setShowAfter} dark={dark} />
        <Toggle label="Footer" checked={showFooter} onChange={setShowFooter} dark={dark} />
      </Section>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: bg, color: fg }}>
      {/* Mobile top bar */}
      {isMobile ? (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            background: dark ? '#14141A' : '#ffffff',
            borderBottom: `1px solid ${dark ? '#2A2A33' : '#E5E7EB'}`,
          }}
        >
          <button
            aria-label="Open settings"
            onClick={() => setDrawerOpen(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: `1px solid ${dark ? '#2A2A33' : '#E5E7EB'}`,
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
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: muted, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Playground
            </div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>llm-markdown</div>
          </div>
          <AppNav current="/" onNavigate={onNavigate} dark={dark} />
        </div>
      ) : null}

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: isMobile ? 16 : 24,
          display: isMobile ? 'block' : 'grid',
          gridTemplateColumns: isMobile ? undefined : 'minmax(0, 320px) minmax(0, 1fr)',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* Desktop sidebar */}
        {isMobile ? null : (
          <aside
            style={{
              ...panelStyle(dark),
              position: 'sticky',
              top: 24,
              maxHeight: 'calc(100vh - 48px)',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
            }}
          >
            {sidebar}
          </aside>
        )}

        <main>
          {!isMobile ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 0.6,
                    color: muted,
                    textTransform: 'uppercase',
                  }}
                >
                  Playground
                </div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  Try every feature with live controls
                </div>
              </div>
              <AppNav current="/" onNavigate={onNavigate} dark={dark} />
            </div>
          ) : null}

          <LLMMarkdown
            text={text}
            streaming={streaming}
            directives={directives}
            textSelection={textSelection}
            blockSlots={blockSlots}
            theme={{
              ...(dark ? darkTheme : {}),
              typography: { fontFamily: FONT_STACK, monoFamily: MONO_STACK },
              layout: { tableColumnWidth },
            }}
            direction={direction}
            card={{ animation, layoutAnimation }}
            header={
              showHeader ? (
                <div style={{ fontSize: 12, color: muted, fontWeight: 600 }}>
                  Thread · April 2026
                </div>
              ) : undefined
            }
            before={
              showBefore ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: muted,
                  }}
                >
                  <span>Assistant message</span>
                  <span>streaming {streaming ? 'on' : 'off'}</span>
                </div>
              ) : undefined
            }
            after={
              showAfter ? (
                <div style={{ fontSize: 12, color: muted, fontStyle: 'italic' }}>
                  Rendered by llm-markdown
                </div>
              ) : undefined
            }
            footer={
              showFooter ? (
                <div style={{ fontSize: 12, color: muted }}>3 citations · ⭐ · ⤵︎</div>
              ) : undefined
            }
          />
        </main>
      </div>

      {/* Mobile drawer */}
      {isMobile ? (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} dark={dark}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: `1px solid ${dark ? '#2A2A33' : '#E5E7EB'}`,
            }}
          >
            <div style={{ fontWeight: 700, color: fg }}>Settings</div>
            <button
              aria-label="Close"
              onClick={() => setDrawerOpen(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1px solid ${dark ? '#2A2A33' : '#E5E7EB'}`,
                background: dark ? '#1F1F27' : '#ffffff',
                color: fg,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
          {sidebar}
        </Drawer>
      ) : null}
    </div>
  );
}

/* ---------- tiny UI primitives ---------- */

function panelStyle(dark: boolean): CSSProperties {
  return {
    background: dark ? '#14141A' : '#ffffff',
    border: `1px solid ${dark ? '#2A2A33' : '#E5E7EB'}`,
    borderRadius: 12,
    padding: 16,
  };
}

function Section({
  title,
  children,
  dark,
}: {
  title: string;
  children: React.ReactNode;
  dark: boolean;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          color: dark ? '#9CA3AF' : '#6B7280',
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

function Row({
  label,
  children,
  dark,
}: {
  label: string;
  children?: React.ReactNode;
  dark: boolean;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
      <span style={{ color: dark ? '#D1D5DB' : '#374151' }}>{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  dark,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  dark: boolean;
}) {
  return (
    <label
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 13,
        color: dark ? '#D1D5DB' : '#374151',
        cursor: 'pointer',
      }}
    >
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: '#6366F1' }}
      />
    </label>
  );
}

function btn(dark: boolean): CSSProperties {
  return {
    padding: '6px 10px',
    borderRadius: 8,
    border: `1px solid ${dark ? '#2A2A33' : '#E5E7EB'}`,
    background: dark ? '#1F1F27' : '#fff',
    color: dark ? '#F3F4F6' : '#111827',
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: 'inherit',
  };
}

function selectStyle(dark: boolean): CSSProperties {
  return {
    width: '100%',
    padding: '6px 8px',
    borderRadius: 8,
    border: `1px solid ${dark ? '#2A2A33' : '#E5E7EB'}`,
    background: dark ? '#1F1F27' : '#fff',
    color: dark ? '#F3F4F6' : '#111827',
    fontSize: 13,
    fontFamily: 'inherit',
  };
}

function inputStyle(dark: boolean): CSSProperties {
  return {
    padding: 8,
    borderRadius: 8,
    border: `1px solid ${dark ? '#2A2A33' : '#E5E7EB'}`,
    background: dark ? '#1F1F27' : '#fff',
    color: dark ? '#F3F4F6' : '#111827',
  };
}

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
