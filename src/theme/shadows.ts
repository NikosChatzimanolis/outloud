import { Platform } from 'react-native';

/**
 * Shadows – iOS soft shadow (opacity 0.08, blur 14, y 6); Android elevation 2–4
 */
export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
    },
    android: { elevation: 2 },
    default: {},
  }),
  sheet: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 18,
    },
    android: { elevation: 4 },
    default: {},
  }),
  fab: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
    },
    android: { elevation: 6 },
    default: {},
  }),
} as const;
