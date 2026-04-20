import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { Composer } from './Composer';
import { resolveResponse } from './commands';
import type { ChatMessage, ChatSettings } from './types';
import { pick } from './theme';
import { AppNav } from '../components/AppNav';

let messageCounter = 0;
const nextId = () => `m${Date.now().toString(36)}-${(++messageCounter).toString(36)}`;

const greeting: ChatMessage = {
  id: 'greet',
  role: 'assistant',
  text:
    `# Welcome \u{1F44B}\n\n` +
    `I'm a mock assistant that demos the **llm-markdown** library.\n\n` +
    `- Type anything and I'll reply with the full feature tour.\n` +
    `- Or use a slash command — click the \`/\` button to see what's available.\n` +
    `- User messages render through \`llm-markdown\` too, so feel free to send \`**bold**\`, tables, or \`:::callout\` blocks yourself.`,
  streaming: false,
  sentAt: Date.now(),
};

export interface ChatProps {
  settings: ChatSettings;
  onOpenSidebar?: () => void;
  onBack?: () => void;
  showHamburger?: boolean;
  onNavigate?: (r: import('../router').Route) => void;
}

export function Chat({ settings, onOpenSidebar, onBack, showHamburger, onNavigate }: ChatProps) {
  const c = pick(settings.dark);
  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const listRef = useRef<HTMLDivElement>(null);
  const streamAbortRef = useRef<(() => void) | null>(null);
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Auto-scroll to the bottom when messages grow (including during streaming)
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const beginAssistantReply = useCallback((userText: string) => {
    // Cancel any in-flight stream first so a rapid second send doesn't interleave
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
      // Flush whatever was pending as complete so we don't leave zombies
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
        background: c.chatBg,
      }}
    >
      <ChatHeader
        dark={settings.dark}
        streaming={isStreaming}
        onOpenSidebar={showHamburger ? onOpenSidebar : undefined}
        onBack={onBack}
        onNavigate={onNavigate}
      />
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflow: 'auto',
          paddingBlock: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} settings={settings} />
        ))}
      </div>
      <Composer dark={settings.dark} onSend={handleSend} />
    </div>
  );
}

function ChatHeader({
  dark,
  streaming,
  onOpenSidebar,
  onBack,
  onNavigate,
}: {
  dark: boolean;
  streaming: boolean;
  onOpenSidebar?: () => void;
  onBack?: () => void;
  onNavigate?: (r: import('../router').Route) => void;
}) {
  const c = pick(dark);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        background: c.headerBg,
        borderBottom: `1px solid ${c.headerBorder}`,
      }}
    >
      {onOpenSidebar ? (
        <button
          onClick={onOpenSidebar}
          aria-label="Open settings"
          title="Settings"
          style={iconButton(dark)}
        >
          <HamburgerIcon />
        </button>
      ) : null}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          background: c.accent,
          color: '#ffffff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          flex: '0 0 auto',
        }}
      >
        SM
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <span style={{ color: c.text, fontWeight: 600 }}>llm-markdown · demo</span>
        <span style={{ color: c.textMuted, fontSize: 12 }}>
          {streaming ? 'typing…' : 'online'}
        </span>
      </div>
      {onNavigate ? (
        <AppNav current="/chat" onNavigate={onNavigate} dark={dark} />
      ) : onBack ? (
        <button
          onClick={onBack}
          aria-label="Back to playground"
          title="Back to playground"
          style={backButton(dark)}
        >
          ← Playground
        </button>
      ) : null}
    </div>
  );
}

function iconButton(dark: boolean) {
  const c = pick(dark);
  return {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: `1px solid ${c.headerBorder}`,
    background: dark ? '#1F1F27' : '#ffffff',
    color: c.text,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
  } as const;
}

function backButton(dark: boolean) {
  const c = pick(dark);
  return {
    padding: '6px 12px',
    borderRadius: 999,
    border: `1px solid ${c.headerBorder}`,
    background: dark ? '#1F1F27' : '#ffffff',
    color: c.text,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'inherit',
    flex: '0 0 auto',
  } as const;
}

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
