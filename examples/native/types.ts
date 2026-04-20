import type { CardAnimationPreset, Direction } from 'llm-markdown/native';

export type Route = 'playground' | 'chat';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  streaming: boolean;
  sentAt: number;
}

export interface Settings {
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

export const DEFAULT_SETTINGS: Settings = {
  dark: false,
  direction: 'auto',
  animation: 'fadeSlide',
  layoutAnimation: true,
  charsPerTick: 14,
  tickMs: 25,
  showHeader: false,
  showBefore: false,
  showAfter: false,
  showFooter: false,
};
