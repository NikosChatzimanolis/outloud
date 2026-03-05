/**
 * Spacing and radius system
 * Small chips: 10, Buttons: 14, Inputs: 16, Cards: 18, Bottom sheets: 24
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  small: 10,
  button: 14,
  input: 16,
  card: 18,
  bottomSheet: 24,
  round: 9999,
} as const;

export type Spacing = typeof spacing;
export type Radius = typeof radius;
