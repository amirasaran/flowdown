import type { DirectiveComponentProps } from 'llm-markdown/web';
import { chartPayload } from '../../../shared/demo-content';

const BAR_AREA_HEIGHT = 140;

export function Chart({ attributes, value, theme }: DirectiveComponentProps) {
  const data = chartPayload(value);
  const max = Math.max(1, ...data.map((d) => d.value));
  const title = typeof attributes.title === 'string' ? attributes.title : undefined;

  return (
    <div
      style={{
        backgroundColor: theme.colors.background,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radii.md,
        padding: theme.spacing.md,
        margin: `${theme.spacing.sm}px 0`,
      }}
    >
      {title ? (
        <div
          style={{
            fontWeight: 600,
            marginBottom: theme.spacing.sm,
            color: theme.colors.text,
          }}
        >
          {title}
        </div>
      ) : null}

      {/* Bars: fixed-height flex row, each bar is a flex:1 item whose height
          is a % of BAR_AREA_HEIGHT. Avoids the CSS Grid cascade issue. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: theme.spacing.sm,
          height: BAR_AREA_HEIGHT,
        }}
      >
        {data.length === 0 ? (
          <div style={{ color: theme.colors.textMuted, fontSize: 12 }}>
            (no data)
          </div>
        ) : (
          data.map((d) => (
            <div
              key={d.label}
              title={`${d.label}: ${d.value}`}
              style={{
                flex: 1,
                height: `${(d.value / max) * 100}%`,
                minHeight: 2,
                backgroundColor: theme.colors.accent,
                borderRadius: theme.radii.sm,
                transition: 'height 300ms ease-out',
              }}
            />
          ))
        )}
      </div>

      {/* Labels: separate row under the bars, same flex layout so they
          stay visually aligned with each bar above. */}
      {data.length > 0 ? (
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.sm,
            marginTop: 4,
          }}
        >
          {data.map((d) => (
            <div
              key={d.label}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 12,
                color: theme.colors.textMuted,
              }}
            >
              {d.label}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
