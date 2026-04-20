import { View, Text } from 'react-native';
import type { DirectiveComponentProps } from 'llm-markdown/native';

interface ToneColors { bg: string; bar: string; fg: string; }

const lightTones: Record<string, ToneColors> = {
  info:    { bg: '#eff6ff', bar: '#3b82f6', fg: '#1e3a8a' },
  success: { bg: '#ecfdf5', bar: '#10b981', fg: '#065f46' },
  warn:    { bg: '#fffbeb', bar: '#f59e0b', fg: '#78350f' },
  danger:  { bg: '#fef2f2', bar: '#ef4444', fg: '#7f1d1d' },
};

const darkTones: Record<string, ToneColors> = {
  info:    { bg: '#1E293B', bar: '#60A5FA', fg: '#DBEAFE' },
  success: { bg: '#064E3B', bar: '#34D399', fg: '#A7F3D0' },
  warn:    { bg: '#422006', bar: '#FBBF24', fg: '#FDE68A' },
  danger:  { bg: '#450A0A', bar: '#F87171', fg: '#FECACA' },
};

function isDarkBackground(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length !== 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false;
  const l = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  return l < 0.5;
}

export function Callout({ attributes, children, theme }: DirectiveComponentProps) {
  const tone = typeof attributes.tone === 'string' ? attributes.tone : 'info';
  const darkMode = isDarkBackground(theme.colors.background);
  const palette = darkMode
    ? darkTones[tone] ?? darkTones.info!
    : lightTones[tone] ?? lightTones.info!;
  const title = typeof attributes.title === 'string' ? attributes.title : undefined;

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: palette.bg,
        borderRadius: theme.radii.md,
        padding: theme.spacing.md,
        marginVertical: theme.spacing.sm,
      }}
    >
      <View
        style={{
          width: 4,
          backgroundColor: palette.bar,
          borderRadius: 2,
          marginRight: theme.spacing.md,
        }}
      />
      <View style={{ flex: 1 }}>
        {title ? (
          <Text style={{ fontWeight: '700', color: palette.fg, marginBottom: 4 }}>
            {title}
          </Text>
        ) : null}
        <View>{children}</View>
      </View>
    </View>
  );
}
