/**
 * OutLoud color palette – exact hex from product brief
 */
export const colors = {
  // Primary
  midnightNavy: '#0B1020',
  deepInk: '#111A33',
  electricViolet: '#7C3AED',
  violetGlow: '#A78BFA',

  // Secondary
  tealMint: '#2EE9A6',
  warmRose: '#FB7185',
  amber: '#FBBF24',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#B6C2E2',
  textMuted: '#7A86A8',

  // Borders
  hairline: '#243055',

  // Semantic
  success: '#2EE9A6',
  error: '#FB7185',
  warning: '#FBBF24',
} as const;

export type Colors = typeof colors;
