import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { LLMMarkdown, darkTheme } from 'llm-markdown/native';
import type { DirectiveRegistry } from 'llm-markdown/native';
import { Chart } from '../directives/Chart';
import { Callout } from '../directives/Callout';
import type { ChatMessage, Settings } from '../types';
import { pick } from '../theme';

const directives: DirectiveRegistry = { chart: Chart, callout: Callout };

export function MessageBubble({
  message,
  settings,
}: {
  message: ChatMessage;
  settings: Settings;
}) {
  const c = pick(settings.dark);
  const isUser = message.role === 'user';

  const theme = useMemo(() => {
    const base = settings.dark ? darkTheme : undefined;
    if (!isUser) return base;
    return {
      ...base,
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

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
      }}
    >
      {/* Assistant bubbles take a definite 88% of the row so the card inside
          has a real width to wrap content against; user bubbles stay
          content-sized with just a maxWidth cap so short messages hug. */}
      <View
        style={
          isUser
            ? { maxWidth: '88%' }
            : { width: '88%', maxWidth: '88%' }
        }
      >
        <LLMMarkdown
          text={message.text}
          streaming={!isUser && message.streaming}
          directives={directives}
          direction={settings.direction}
          theme={theme}
          textSelection
          card={bubbleCard}
          header={
            settings.showHeader ? (
              <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>
                {isUser ? 'You' : 'Assistant'}
              </Text>
            ) : undefined
          }
          before={
            settings.showBefore ? (
              <Text style={{ fontSize: 11, color: c.textMuted }}>
                {isUser ? 'Sent' : 'Reply'} · {message.streaming ? 'streaming' : 'complete'}
              </Text>
            ) : undefined
          }
          after={
            settings.showAfter ? (
              <Text style={{ fontSize: 11, color: c.textMuted, fontStyle: 'italic' }}>
                rendered by llm-markdown
              </Text>
            ) : undefined
          }
          footer={
            settings.showFooter ? (
              <Text style={{ fontSize: 11, color: c.textMuted }}>
                {timeLabel} · {isUser ? 'delivered' : message.streaming ? 'typing…' : 'seen'}
              </Text>
            ) : undefined
          }
        />
        <Text
          style={{
            marginTop: 2,
            fontSize: 10,
            color: c.textMuted,
            textAlign: isUser ? 'right' : 'left',
            paddingHorizontal: 6,
          }}
        >
          {timeLabel}
          {isUser ? ' · ✓✓' : message.streaming ? ' · typing…' : ''}
        </Text>
      </View>
    </View>
  );
}
