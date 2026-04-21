import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LLMMarkdown, darkTheme } from 'llm-markdown/native';
import type { DirectiveRegistry } from 'llm-markdown/native';
import { presets } from '../shared/demo-content';
import { Chart } from './directives/Chart';
import { Callout } from './directives/Callout';
import { DEFAULT_SETTINGS, type Settings } from './types';
import { pick } from './theme';
import { Drawer } from './Drawer';
import { SettingsPanel } from './SettingsPanel';

export function Playground({ onOpenChat }: { onOpenChat: () => void }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [presetId, setPresetId] = useState(presets[0]!.id);
  const preset = useMemo(() => presets.find((p) => p.id === presetId) ?? presets[0]!, [presetId]);
  const [customText, setCustomText] = useState<string | null>(null);
  const source = customText ?? preset.text;
  const [streaming, setStreaming] = useState(true);
  const [text, setText] = useState('');
  const [restartToken, setRestartToken] = useState(0);
  const progressRef = useRef(0);

  const c = pick(settings.dark);

  const patch = useCallback((p: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...p }));
  }, []);

  useEffect(() => {
    if (!streaming) {
      setText(source);
      return;
    }
    setText('');
    progressRef.current = 0;
    const id = setInterval(() => {
      progressRef.current += settings.charsPerTick;
      if (progressRef.current >= source.length) {
        setText(source);
        clearInterval(id);
      } else {
        setText(source.slice(0, progressRef.current));
      }
    }, settings.tickMs);
    return () => clearInterval(id);
  }, [source, streaming, settings.charsPerTick, settings.tickMs, restartToken]);

  const directives: DirectiveRegistry = useMemo(
    () => ({ chart: Chart, callout: Callout }),
    []
  );

  const progressPct =
    source.length === 0 ? 100 : Math.min(100, (text.length / source.length) * 100);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.page }}>
      <Header dark={settings.dark} onOpenSidebar={() => setDrawerOpen(true)} onOpenChat={onOpenChat} />
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={panelStyle(settings.dark)}>
          <SectionTitle dark={settings.dark}>Preset</SectionTitle>
          <Chips
            options={presets.map((p) => ({ id: p.id, label: p.label }))}
            value={customText === null ? presetId : null}
            onChange={(id) => {
              setPresetId(id);
              setCustomText(null);
            }}
            dark={settings.dark}
          />

          <SectionTitle dark={settings.dark}>Custom markdown</SectionTitle>
          <TextInput
            value={customText ?? ''}
            placeholder="Paste your own markdown here…"
            placeholderTextColor={c.textMuted}
            multiline
            onChangeText={setCustomText}
            style={{
              minHeight: 90,
              padding: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: c.sidebarBorder,
              color: c.text,
              fontFamily: 'Menlo',
              fontSize: 12,
              textAlignVertical: 'top',
            }}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Btn label="Load preset" onPress={() => setCustomText(preset.text)} dark={settings.dark} />
            <Btn label="Clear" onPress={() => setCustomText(null)} dark={settings.dark} />
          </View>

          <SectionTitle dark={settings.dark}>Streaming</SectionTitle>
          <ToggleRow
            label="Enable streaming"
            value={streaming}
            onChange={setStreaming}
            dark={settings.dark}
          />
          <Text style={{ color: c.textMuted, fontSize: 12 }}>
            Speed controls live in the Settings drawer (≡).
          </Text>
          <Text style={{ color: c.textMuted, fontSize: 12 }}>
            ~ {Math.round((settings.charsPerTick * 1000) / settings.tickMs)} chars/sec
          </Text>
          <View
            style={{
              height: 6,
              backgroundColor: settings.dark ? '#1F1F27' : '#E5E7EB',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <View style={{ width: `${progressPct}%`, height: '100%', backgroundColor: c.accent }} />
          </View>
          <Text style={{ color: c.textMuted, fontSize: 12 }}>
            {text.length} / {source.length} chars
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Btn
              label="Restart"
              onPress={() => {
                progressRef.current = 0;
                setText('');
                setRestartToken((n) => n + 1);
              }}
              dark={settings.dark}
            />
            <Btn label="Skip to end" onPress={() => setText(source)} dark={settings.dark} />
          </View>
        </View>

        <LLMMarkdown
          text={text}
          streaming={streaming}
          directives={directives}
          theme={settings.dark ? darkTheme : undefined}
          direction={settings.direction}
          textSelection
          card={{ animation: settings.animation, layoutAnimation: settings.layoutAnimation }}
          header={
            settings.showHeader ? (
              <Text style={{ fontSize: 12, color: c.textMuted, fontWeight: '600' }}>
                Thread · April 2026
              </Text>
            ) : undefined
          }
          before={
            settings.showBefore ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: c.textMuted }}>Assistant message</Text>
                <Text style={{ fontSize: 12, color: c.textMuted }}>
                  streaming {streaming ? 'on' : 'off'}
                </Text>
              </View>
            ) : undefined
          }
          after={
            settings.showAfter ? (
              <Text style={{ fontSize: 12, color: c.textMuted, fontStyle: 'italic' }}>
                Rendered by llm-markdown
              </Text>
            ) : undefined
          }
          footer={
            settings.showFooter ? (
              <Text style={{ fontSize: 12, color: c.textMuted }}>3 citations · ⭐ · ⤵︎</Text>
            ) : undefined
          }
        />

        <Pressable
          onPress={onOpenChat}
          style={({ pressed }) => ({
            padding: 14,
            borderRadius: 999,
            backgroundColor: c.accent,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 6,
          })}
        >
          <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>
            Try it inside a chat conversation →
          </Text>
        </Pressable>
      </ScrollView>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Settings"
        dark={settings.dark}
      >
        <SettingsPanel settings={settings} onChange={patch} />
      </Drawer>
    </SafeAreaView>
  );
}

function Header({
  dark,
  onOpenSidebar,
  onOpenChat,
}: {
  dark: boolean;
  onOpenSidebar: () => void;
  onOpenChat: () => void;
}) {
  const c = pick(dark);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: c.headerBg,
        borderBottomColor: c.headerBorder,
        borderBottomWidth: 1,
      }}
    >
      <Pressable
        onPress={onOpenSidebar}
        accessibilityLabel="Open settings"
        style={({ pressed }) => ({
          width: 36,
          height: 36,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: c.headerBorder,
          backgroundColor: dark ? '#1F1F27' : '#ffffff',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ color: c.text, fontSize: 18, lineHeight: 20 }}>≡</Text>
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.6,
            color: c.textMuted,
            textTransform: 'uppercase',
          }}
        >
          Playground
        </Text>
        <Text style={{ color: c.text, fontSize: 16, fontWeight: '700' }}>llm-markdown</Text>
      </View>
      <Pressable
        onPress={onOpenChat}
        accessibilityLabel="Open chat demo"
        style={({ pressed }) => ({
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: c.accent,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '600' }}>Chat →</Text>
      </Pressable>
    </View>
  );
}

/* ---------- UI primitives ---------- */

function panelStyle(dark: boolean) {
  const c = pick(dark);
  return {
    backgroundColor: c.sidebarBg,
    borderColor: c.sidebarBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  };
}

function SectionTitle({ children, dark }: { children: React.ReactNode; dark: boolean }) {
  const c = pick(dark);
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        color: c.textMuted,
        marginTop: 4,
      }}
    >
      {children}
    </Text>
  );
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
    <Pressable
      onPress={() => onChange(!value)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text style={{ color: c.text, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: value ? c.accent : c.textMuted, fontWeight: '700' }}>
        {value ? 'ON' : 'OFF'}
      </Text>
    </Pressable>
  );
}

function Btn({ label, onPress, dark }: { label: string; onPress: () => void; dark: boolean }) {
  const c = pick(dark);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: c.sidebarBorder,
        backgroundColor: dark ? '#1F1F27' : '#ffffff',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ color: c.text, fontSize: 12 }}>{label}</Text>
    </Pressable>
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
