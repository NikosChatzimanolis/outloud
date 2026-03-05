import { Platform } from 'react-native';

/**
 * Typography scale – Inter or system default
 * H1: 28 / SemiBold / -0.2, H2: 20 / SemiBold, Body: 16 / Regular, Caption: 13, Button: 16 / SemiBold
 */
const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 34,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  fontFamily,
} as const;

export type Typography = typeof typography;
