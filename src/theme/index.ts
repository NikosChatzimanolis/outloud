export { colors } from './colors';
export { typography } from './typography';
export { spacing, radius } from './spacing';
export { shadows } from './shadows';

import { colors } from './colors';
import { typography } from './typography';
import { spacing, radius } from './spacing';
import { shadows } from './shadows';

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} as const;
