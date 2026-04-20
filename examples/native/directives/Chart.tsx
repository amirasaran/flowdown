import { View, Text } from 'react-native';
import type { DirectiveComponentProps } from 'llm-markdown/native';
import { chartPayload } from '../../shared/demo-content';

export function Chart({ attributes, value, theme }: DirectiveComponentProps) {
  const data = chartPayload(value);
  const max = Math.max(1, ...data.map((d) => d.value));
  const title = typeof attributes.title === 'string' ? attributes.title : undefined;

  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radii.md,
        padding: theme.spacing.md,
        marginVertical: theme.spacing.sm,
      }}
    >
      {title ? (
        <Text
          style={{
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
          }}
        >
          {title}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          height: 140,
          gap: theme.spacing.sm,
        }}
      >
        {data.map((d) => (
          <View key={d.label} style={{ flex: 1, alignItems: 'center' }}>
            <View
              style={{
                width: '100%',
                height: `${(d.value / max) * 100}%`,
                backgroundColor: theme.colors.accent,
                borderRadius: theme.radii.sm,
              }}
            />
            <Text style={{ marginTop: 4, fontSize: 12, color: theme.colors.textMuted }}>
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
