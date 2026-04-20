import type { CSSProperties, ReactNode } from 'react';
import type { CardAnimationPreset, Direction } from 'llm-markdown/web';
import type { ChatSettings } from './types';
import { pick } from './theme';

const ANIMATIONS: CardAnimationPreset[] = ['none', 'fade', 'fadeSlide', 'scale', 'typewriter'];
const DIRECTIONS: Array<Direction | 'auto'> = ['auto', 'ltr', 'rtl'];

export function SettingsPanel({
  settings,
  onChange,
  chrome = true,
}: {
  settings: ChatSettings;
  onChange: (patch: Partial<ChatSettings>) => void;
  /** When true (desktop), renders its own width + border. When false, fills its container. */
  chrome?: boolean;
}) {
  const c = pick(settings.dark);
  return (
    <aside
      style={
        chrome
          ? {
              width: 300,
              flex: '0 0 300px',
              background: c.sidebarBg,
              borderRight: `1px solid ${c.sidebarBorder}`,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }
          : {
              width: '100%',
              background: c.sidebarBg,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }
      }
    >
      <div
        style={{
          padding: '14px 16px',
          borderBottom: `1px solid ${c.sidebarBorder}`,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: 0.6 }}>
          LLM-MARKDOWN
        </div>
        <div style={{ color: c.text, fontWeight: 600, marginTop: 2 }}>Settings</div>
      </div>

      <div style={{ padding: 16, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Section title="Appearance" dark={settings.dark}>
          <Toggle
            label="Dark mode"
            value={settings.dark}
            onChange={(v) => onChange({ dark: v })}
            dark={settings.dark}
          />
          <Row label="Direction" dark={settings.dark}>
            <select
              value={settings.direction}
              onChange={(e) => onChange({ direction: e.target.value as Direction | 'auto' })}
              style={selectStyle(settings.dark)}
            >
              {DIRECTIONS.map((d) => (
                <option key={d} value={d}>
                  {d === 'auto' ? 'auto (per block)' : d}
                </option>
              ))}
            </select>
          </Row>
        </Section>

        <Section title="Streaming" dark={settings.dark}>
          <Row label={`Chars per tick: ${settings.charsPerTick}`} dark={settings.dark}>
            <input
              type="range"
              min={1}
              max={200}
              value={settings.charsPerTick}
              onChange={(e) => onChange({ charsPerTick: Number(e.target.value) })}
              style={{ width: '100%' }}
            />
          </Row>
          <Row label={`Tick interval: ${settings.tickMs}ms`} dark={settings.dark}>
            <input
              type="range"
              min={5}
              max={500}
              value={settings.tickMs}
              onChange={(e) => onChange({ tickMs: Number(e.target.value) })}
              style={{ width: '100%' }}
            />
          </Row>
          <Hint dark={settings.dark}>
            ~ {Math.round((settings.charsPerTick * 1000) / settings.tickMs)} chars/sec
          </Hint>
        </Section>

        <Section title="Card" dark={settings.dark}>
          <Row label="Animation" dark={settings.dark}>
            <select
              value={settings.animation}
              onChange={(e) => onChange({ animation: e.target.value as CardAnimationPreset })}
              style={selectStyle(settings.dark)}
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
            value={settings.layoutAnimation}
            onChange={(v) => onChange({ layoutAnimation: v })}
            dark={settings.dark}
          />
        </Section>

        <Section title="Bubble slots" dark={settings.dark}>
          <Toggle
            label="Header"
            value={settings.showHeader}
            onChange={(v) => onChange({ showHeader: v })}
            dark={settings.dark}
          />
          <Toggle
            label="Before"
            value={settings.showBefore}
            onChange={(v) => onChange({ showBefore: v })}
            dark={settings.dark}
          />
          <Toggle
            label="After"
            value={settings.showAfter}
            onChange={(v) => onChange({ showAfter: v })}
            dark={settings.dark}
          />
          <Toggle
            label="Footer"
            value={settings.showFooter}
            onChange={(v) => onChange({ showFooter: v })}
            dark={settings.dark}
          />
        </Section>

        <Section title="Tips" dark={settings.dark}>
          <Hint dark={settings.dark}>
            Type <kbd style={kbdStyle(settings.dark)}>/</kbd> in the composer or click the{' '}
            <kbd style={kbdStyle(settings.dark)}>/</kbd> icon to pick an example.
          </Hint>
          <Hint dark={settings.dark}>
            Send plain text for the full feature tour. User messages render markdown too.
          </Hint>
        </Section>
      </div>
    </aside>
  );
}

function Section({
  title,
  children,
  dark,
}: {
  title: string;
  children: ReactNode;
  dark: boolean;
}) {
  const c = pick(dark);
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          color: c.textMuted,
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

function Row({ label, children, dark }: { label: string; children?: ReactNode; dark: boolean }) {
  const c = pick(dark);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: c.text }}>
      <span style={{ color: c.text }}>{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
  dark,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  dark: boolean;
}) {
  const c = pick(dark);
  return (
    <label
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 13,
        color: c.text,
        cursor: 'pointer',
      }}
    >
      {label}
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: c.accent }}
      />
    </label>
  );
}

function Hint({ children, dark }: { children: ReactNode; dark: boolean }) {
  const c = pick(dark);
  return <div style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.4 }}>{children}</div>;
}

function selectStyle(dark: boolean): CSSProperties {
  const c = pick(dark);
  return {
    width: '100%',
    padding: '6px 8px',
    borderRadius: 8,
    border: `1px solid ${c.sidebarBorder}`,
    background: dark ? '#1F1F27' : '#fff',
    color: c.text,
    fontSize: 13,
  };
}

function kbdStyle(dark: boolean): CSSProperties {
  const c = pick(dark);
  return {
    padding: '1px 6px',
    borderRadius: 4,
    border: `1px solid ${c.sidebarBorder}`,
    background: dark ? '#1F1F27' : '#fff',
    color: c.text,
    fontSize: 11,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  };
}
