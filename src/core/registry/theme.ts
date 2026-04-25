import type { Theme, DeepPartial } from '../../shared/types';

export const defaultTheme: Theme = {
  colors: {
    text: '#111827',
    textMuted: '#6B7280',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    link: '#2563EB',
    codeBackground: '#F3F4F6',
    codeText: '#111827',
    accent: '#6366F1',
    blockquoteBar: '#D1D5DB',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  radii: { sm: 4, md: 8, lg: 12 },
  typography: {
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    monoFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    sizeBase: 16,
    sizeSmall: 14,
    sizeH1: 28,
    sizeH2: 24,
    sizeH3: 20,
    sizeH4: 18,
    lineHeight: 1.6,
  },
  motion: {
    enterDuration: 200,
    layoutDuration: 200,
  },
  layout: {
    tableColumnWidth: 140,
  },
};

export const darkTheme: Theme = {
  ...defaultTheme,
  colors: {
    text: '#F3F4F6',
    textMuted: '#9CA3AF',
    background: '#0B0B0F',
    surface: '#14141A',
    border: '#2A2A33',
    link: '#93C5FD',
    codeBackground: '#1F1F27',
    codeText: '#E5E7EB',
    accent: '#A5B4FC',
    blockquoteBar: '#374151',
  },
};

export function mergeTheme(base: Theme, override?: DeepPartial<Theme>): Theme {
  if (!override) return base;
  return {
    colors: { ...base.colors, ...(override.colors as object) } as Theme['colors'],
    spacing: { ...base.spacing, ...(override.spacing as object) } as Theme['spacing'],
    radii: { ...base.radii, ...(override.radii as object) } as Theme['radii'],
    typography: { ...base.typography, ...(override.typography as object) } as Theme['typography'],
    motion: { ...base.motion, ...(override.motion as object) } as Theme['motion'],
    layout: { ...base.layout, ...(override.layout as object) } as Theme['layout'],
  };
}
