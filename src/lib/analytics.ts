import { Platform } from 'react-native';
import { getAnalytics, logEvent as firebaseLogEvent, isSupported, Analytics } from 'firebase/analytics';
import app from './firebase';

let analytics: Analytics | null = null;

// Firebase Analytics uses cookies/IndexedDB and is not supported in React Native.
// Only initialize on web; otherwise leave null so events no-op.
if (Platform.OS === 'web') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch {
        // ignore
      }
    }
  });
}

export function logEvent(name: string, params?: Record<string, unknown>): void {
  if (analytics) {
    try {
      firebaseLogEvent(analytics, name, params);
    } catch {
      // ignore
    }
  }
}

export const events = {
  messageSent: () => logEvent('message_sent'),
  messagePlayedAloud: () => logEvent('message_played_aloud'),
  speakToggleEnabled: (enabled: boolean) => logEvent('speak_toggle_enabled', { enabled }),
  contactApproved: () => logEvent('contact_approved'),
  screenView: (screenName: string) => logEvent('screen_view', { screen_name: screenName }),
} as const;
