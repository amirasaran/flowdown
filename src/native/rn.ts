/**
 * Thin indirection over `react-native` so the package can typecheck without
 * having react-native installed at build time. Consumers who actually import
 * `./native` must have react-native available (it's a peer dep).
 */
import type { ComponentType, ReactNode } from 'react';

type ViewLike = ComponentType<{
  children?: ReactNode;
  style?: unknown;
  accessibilityRole?: string;
  accessibilityLabel?: string;
  onLayout?: (e: { nativeEvent: { layout: { width: number; height: number } } }) => void;
}>;
type TextLike = ComponentType<{
  children?: ReactNode;
  style?: unknown;
  selectable?: boolean;
  accessibilityRole?: string;
  onPress?: () => void;
}>;
type ScrollViewLike = ComponentType<{
  children?: ReactNode;
  style?: unknown;
  contentContainerStyle?: unknown;
  horizontal?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  showsVerticalScrollIndicator?: boolean;
}>;
type ImageLike = ComponentType<{
  source: { uri: string };
  style?: unknown;
  accessibilityLabel?: string;
  onLoad?: (e: unknown) => void;
  onError?: (e: unknown) => void;
}>;
type PressableLike = ComponentType<{
  children?: ReactNode;
  onPress?: () => void;
  style?: unknown;
}>;
type TextInputLike = ComponentType<{
  children?: ReactNode;
  value?: string;
  editable?: boolean;
  multiline?: boolean;
  scrollEnabled?: boolean;
  style?: unknown;
  selectTextOnFocus?: boolean;
  textAlignVertical?: 'top' | 'center' | 'bottom';
  onChangeText?: (t: string) => void;
}>;

interface RNModule {
  View: ViewLike;
  Text: TextLike;
  TextInput: TextInputLike;
  ScrollView: ScrollViewLike;
  Image: ImageLike;
  Pressable: PressableLike;
  Linking: { openURL: (url: string) => void };
  StyleSheet: {
    create: <T>(s: T) => T;
    flatten: (s: unknown) => Record<string, unknown>;
  };
  Platform: { OS: string };
}

// @ts-ignore - peer dep resolved at consumer install time
import * as RN_ from 'react-native';
const RN = RN_ as unknown as RNModule;

export const View = RN.View;
export const Text = RN.Text;
export const TextInput = RN.TextInput;
export const ScrollView = RN.ScrollView;
export const Image = RN.Image;
export const Pressable = RN.Pressable;
export const Linking = RN.Linking;
export const StyleSheet = RN.StyleSheet;
export const Platform = RN.Platform;

let _ra: unknown = null;
try {
  // @ts-ignore - optional peer dep
  _ra = require('react-native-reanimated');
} catch {
  _ra = null;
}
export const Reanimated = _ra as {
  default?: { View: ViewLike; createAnimatedComponent: <T>(c: T) => T };
  FadeIn?: unknown;
  FadeInUp?: unknown;
  LinearTransition?: unknown;
} | null;
