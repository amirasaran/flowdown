import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { Settings, ChatMessage } from '../types';
import { pick } from '../theme';
import { resolveResponse } from '../../shared/slash-commands';
import { MessageBubble } from './MessageBubble';
import { Composer } from './Composer';

let messageCounter = 0;
const nextId = () => `m${Date.now().toString(36)}-${(++messageCounter).toString(36)}`;

const greeting: ChatMessage = {
  id: 'greet',
  role: 'assistant',
  text:
    `# Welcome 👋\n\n` +
    `I'm a mock assistant that demos the **llm-markdown** library.\n\n` +
    `- Type anything and I'll reply with the full feature tour.\n` +
    `- Or use a slash command — tap the \`/\` button to see examples.\n` +
    `- User messages render through \`llm-markdown\` too, so feel free to send \`**bold**\`, tables, or \`:::callout\` blocks yourself.`,
  streaming: false,
  sentAt: Date.now(),
};

export function Chat({
  settings,
  onOpenSidebar,
  onBack,
}: {
  settings: Settings;
  onOpenSidebar: () => void;
  onBack: () => void;
}) {
  const c = pick(settings.dark);
  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const listRef = useRef<ScrollView>(null);
  const streamAbortRef = useRef<(() => void) | null>(null);
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, [messages]);

  const beginAssistantReply = useCallback((userText: string) => {
    streamAbortRef.current?.();

    const reply: ChatMessage = {
      id: nextId(),
      role: 'assistant',
      text: '',
      streaming: true,
      sentAt: Date.now(),
    };
    setMessages((prev) => [...prev, reply]);

    const full = resolveResponse(userText);
    let i = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const { charsPerTick, tickMs } = settingsRef.current;
      i += charsPerTick;
      if (i >= full.length) {
        setMessages((prev) =>
          prev.map((m) => (m.id === reply.id ? { ...m, text: full, streaming: false } : m))
        );
        streamAbortRef.current = null;
        return;
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === reply.id ? { ...m, text: full.slice(0, i) } : m))
      );
      timer = setTimeout(tick, tickMs);
    };

    let timer = setTimeout(tick, settingsRef.current.tickMs);
    streamAbortRef.current = () => {
      cancelled = true;
      clearTimeout(timer);
      setMessages((prev) =>
        prev.map((m) => (m.id === reply.id ? { ...m, streaming: false } : m))
      );
    };
  }, []);

  useEffect(() => () => streamAbortRef.current?.(), []);

  const handleSend = useCallback(
    (text: string) => {
      const userMsg: ChatMessage = {
        id: nextId(),
        role: 'user',
        text,
        streaming: false,
        sentAt: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      beginAssistantReply(text);
    },
    [beginAssistantReply]
  );

  const isStreaming = messages.some((m) => m.streaming);

  return (
    <View style={{ flex: 1, backgroundColor: c.chatBg }}>
      <Header
        dark={settings.dark}
        streaming={isStreaming}
        onOpenSidebar={onOpenSidebar}
        onBack={onBack}
      />
      <ScrollView
        ref={listRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 12, gap: 2 }}
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} settings={settings} />
        ))}
      </ScrollView>
      <Composer dark={settings.dark} onSend={handleSend} />
    </View>
  );
}

function Header({
  dark,
  streaming,
  onOpenSidebar,
  onBack,
}: {
  dark: boolean;
  streaming: boolean;
  onOpenSidebar: () => void;
  onBack: () => void;
}) {
  const c = pick(dark);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
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
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: c.accent,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#ffffff', fontWeight: '700' }}>SM</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.text, fontWeight: '600' }}>llm-markdown · demo</Text>
        <Text style={{ color: c.textMuted, fontSize: 12 }}>
          {streaming ? 'typing…' : 'online'}
        </Text>
      </View>
      <Pressable
        onPress={onBack}
        accessibilityLabel="Back to playground"
        style={({ pressed }) => ({
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: c.headerBorder,
          backgroundColor: dark ? '#1F1F27' : '#ffffff',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ color: c.text, fontSize: 13, fontWeight: '500' }}>← Back</Text>
      </Pressable>
    </View>
  );
}
