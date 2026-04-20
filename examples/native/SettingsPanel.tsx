import type { ReactNode } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import type { CardAnimationPreset, Direction } from 'llm-markdown/native';
import type { Settings } from './types';
import { pick } from './theme';

const ANIMATIONS: CardAnimationPreset[] = ['none', 'fade', 'fadeSlide', 'scale', 'typewriter'];
const DIRECTIONS: Array<Direction | 'auto'> = ['auto', 'ltr', 'rtl'];

export function SettingsPanel({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (p: Partial<Settings>) => void;
}) {
  const c = pick(settings.dark);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.sidebarBg }}
      contentContainerStyle={{ padding: 16, gap: 18 }}
      keyboardShouldPersistTaps="handled"
    >
      <Section title="Appearance" dark={settings.dark}>
        <ToggleRow
          label="Dark mode"
          value={settings.dark}
          onChange={(v) => onChange({ dark: v })}
          dark={settings.dark}
        />
        <Label dark={settings.dark}>Direction</Label>
        <Chips
          options={DIRECTIONS.map((d) => ({ id: d, label: d }))}
          value={settings.direction}
          onChange={(v) => onChange({ direction: v as Direction | 'auto' })}
          dark={settings.dark}
        />
      </Section>

      <Section title="Streaming" dark={settings.dark}>
        <Slider
          label={`Chars per tick: ${settings.charsPerTick}`}
          value={settings.charsPerTick}
          min={1}
          max={200}
          step={1}
          onChange={(v) => onChange({ charsPerTick: v })}
          dark={settings.dark}
        />
        <Slider
          label={`Tick interval: ${settings.tickMs}ms`}
          value={settings.tickMs}
          min={5}
          max={500}
          step={5}
          onChange={(v) => onChange({ tickMs: v })}
          dark={settings.dark}
        />
        <Text style={{ color: c.textMuted, fontSize: 12 }}>
          ~ {Math.round((settings.charsPerTick * 1000) / settings.tickMs)} chars/sec
        </Text>
      </Section>

      <Section title="Card" dark={settings.dark}>
        <Label dark={settings.dark}>Animation</Label>
        <Chips
          options={ANIMATIONS.map((a) => ({ id: a, label: a }))}
          value={settings.animation}
          onChange={(v) => onChange({ animation: v as CardAnimationPreset })}
          dark={settings.dark}
        />
        <ToggleRow
          label="Layout animation"
          value={settings.layoutAnimation}
          onChange={(v) => onChange({ layoutAnimation: v })}
          dark={settings.dark}
        />
      </Section>

      <Section title="Bubble slots" dark={settings.dark}>
        <ToggleRow
          label="Header"
          value={settings.showHeader}
          onChange={(v) => onChange({ showHeader: v })}
          dark={settings.dark}
        />
        <ToggleRow
          label="Before"
          value={settings.showBefore}
          onChange={(v) => onChange({ showBefore: v })}
          dark={settings.dark}
        />
        <ToggleRow
          label="After"
          value={settings.showAfter}
          onChange={(v) => onChange({ showAfter: v })}
          dark={settings.dark}
        />
        <ToggleRow
          label="Footer"
          value={settings.showFooter}
          onChange={(v) => onChange({ showFooter: v })}
          dark={settings.dark}
        />
      </Section>
    </ScrollView>
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
    <View style={{ gap: 8 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          color: c.textMuted,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Label({ children, dark }: { children: ReactNode; dark: boolean }) {
  const c = pick(dark);
  return <Text style={{ color: c.text, fontSize: 13 }}>{children}</Text>;
}

function ToggleRow({
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
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ color: c.text, fontSize: 13 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

function Chips<T extends string>({
  options,
  value,
  onChange,
  dark,
}: {
  options: Array<{ id: T; label: string }>;
  value: T | null;
  onChange: (v: T) => void;
  dark: boolean;
}) {
  const c = pick(dark);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onChange(opt.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? c.accent : c.sidebarBorder,
                backgroundColor: active ? c.accent : dark ? '#1F1F27' : '#ffffff',
              }}
            >
              <Text
                style={{
                  color: active ? '#ffffff' : c.text,
                  fontSize: 12,
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  dark,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  dark: boolean;
}) {
  const c = pick(dark);
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: c.text, fontSize: 13 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - step))}
          style={sliderBtn(dark)}
        >
          <Text style={{ color: c.text, fontWeight: '700' }}>−</Text>
        </Pressable>
        <View
          style={{
            flex: 1,
            height: 8,
            backgroundColor: dark ? '#1F1F27' : '#E5E7EB',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <View style={{ width: `${pct}%`, height: '100%', backgroundColor: c.accent }} />
        </View>
        <Pressable
          onPress={() => onChange(Math.min(max, value + step))}
          style={sliderBtn(dark)}
        >
          <Text style={{ color: c.text, fontWeight: '700' }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function sliderBtn(dark: boolean) {
  const c = pick(dark);
  return {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: c.sidebarBorder,
    backgroundColor: dark ? '#1F1F27' : '#ffffff',
  };
}
