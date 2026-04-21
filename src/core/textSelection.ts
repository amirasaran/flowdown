import type { TextSelection, TextSelectionConfig } from '../shared/types';

export const DISABLED_TEXT_SELECTION: TextSelectionConfig = { enabled: false };

export function normalizeTextSelection(t: TextSelection | undefined): TextSelectionConfig {
  if (t === true) return { enabled: true };
  if (!t) return DISABLED_TEXT_SELECTION;
  return t;
}
