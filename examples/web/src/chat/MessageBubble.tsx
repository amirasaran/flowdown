import { useMemo } from 'react';
import { LLMMarkdown, darkTheme } from 'llm-markdown/web';
import type { DirectiveRegistry } from 'llm-markdown/web';
import { Chart } from '../directives/Chart';
import { Callout } from '../directives/Callout';
import { FONT_STACK, MONO_STACK } from '../fonts';
import type { ChatMessage, ChatSettings } from './types';
import { pick } from './theme';

const directives: DirectiveRegistry = { chart: Chart, callout: Callout };

export function MessageBubble({
  message,
  settings,
}: {
  message: ChatMessage;
  settings: ChatSettings;
}) {
  const c = pick(settings.dark);
  const isUser = message.role === 'user';

  const theme = useMemo(() => {
    const base = settings.dark ? darkTheme : undefined;
    const typography = {
      fontFamily: FONT_STACK,
      monoFamily: MONO_STACK,
      sizeBase: 15,
      sizeSmall: 13,
      sizeH1: 22,
      sizeH2: 19,
      sizeH3: 17,
      sizeH4: 15,
      lineHeight: 1.55,
    };
    // Tighter block spacing for chat bubbles — looser spacing is fine for the
    // docs / playground card, but in a chat list every pixel counts.
    const spacing = { xs: 3, sm: 6, md: 10, lg: 12, xl: 18 };
    if (!isUser) {
      return {
        ...base,
        typography: { ...(base?.typography ?? {}), ...typography },
        spacing,
      };
    }
    return {
      ...base,
      typography: { ...(base?.typography ?? {}), ...typography },
      spacing,
      colors: {
        ...(base?.colors ?? {}),
        text: settings.dark ? '#E7FCEF' : '#0c3d1c',
        textMuted: settings.dark ? '#A7D7B8' : '#3d6b4a',
        link: settings.dark ? '#86EFAC' : '#047857',
        codeBackground: settings.dark ? '#064023' : '#bfeec0',
        codeText: settings.dark ? '#E7FCEF' : '#0c3d1c',
        blockquoteBar: settings.dark ? '#34D399' : '#059669',
        border: settings.dark ? '#0a7a51' : '#a9dfb1',
      },
    };
  }, [isUser, settings.dark]);

  const bubbleCard = useMemo(
    () => ({
      animation: settings.animation,
      layoutAnimation: settings.layoutAnimation,
      backgroundColor: isUser ? c.userBubble : c.assistantBubble,
      borderColor: isUser ? c.userBorder : c.assistantBorder,
      borderWidth: 1,
      radius: 12,
      padding: 12,
    }),
    [settings.animation, settings.layoutAnimation, isUser, c]
  );

  const timeLabel = useMemo(
    () =>
      new Date(message.sentAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    [message.sentAt]
  );

  const width = 'min(720px, 85%)';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        padding: '4px 12px',
      }}
    >
      <div style={{ maxWidth: width, width: 'fit-content', minWidth: 120 }}>
        <LLMMarkdown
          text={message.text}
          streaming={!isUser && message.streaming}
          directives={directives}
          direction={settings.direction}
          theme={theme}
          card={bubbleCard}
          header={
            settings.showHeader ? (
              <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 600 }}>
                {isUser ? 'You' : 'Assistant'}
              </div>
            ) : undefined
          }
          before={
            settings.showBefore ? (
              <div style={{ fontSize: 11, color: c.textMuted }}>
                {isUser ? 'Sent' : 'Reply'} · {message.streaming ? 'streaming' : 'complete'}
              </div>
            ) : undefined
          }
          after={
            settings.showAfter ? (
              <div style={{ fontSize: 11, color: c.textMuted, fontStyle: 'italic' }}>
                rendered by llm-markdown
              </div>
            ) : undefined
          }
          footer={
            settings.showFooter ? (
              <div style={{ fontSize: 11, color: c.textMuted }}>
                {timeLabel} · {isUser ? 'delivered' : message.streaming ? 'typing…' : 'seen'}
              </div>
            ) : undefined
          }
        />
        <div
          style={{
            marginTop: 2,
            fontSize: 10,
            color: c.textMuted,
            textAlign: isUser ? 'right' : 'left',
            paddingInline: 6,
          }}
        >
          {timeLabel}
          {isUser ? ' · ✓✓' : message.streaming ? ' · typing…' : ''}
        </div>
      </div>
    </div>
  );
}
