import type {
  CardAnimationPreset,
  Direction,
} from 'llm-markdown/web';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  /** Assistant messages are streaming while true; flips to false when the reply is complete. */
  streaming: boolean;
  /** Fresh timestamp used for display only. */
  sentAt: number;
}

export interface ChatSettings {
  dark: boolean;
  direction: Direction | 'auto';
  animation: CardAnimationPreset;
  layoutAnimation: boolean;
  charsPerTick: number;
  tickMs: number;
  showHeader: boolean;
  showBefore: boolean;
  showAfter: boolean;
  showFooter: boolean;
}

export const DEFAULT_SETTINGS: ChatSettings = {
  dark: false,
  direction: 'auto',
  animation: 'fadeSlide',
  layoutAnimation: true,
  charsPerTick: 12,
  tickMs: 20,
  showHeader: false,
  showBefore: false,
  showAfter: false,
  showFooter: false,
};
