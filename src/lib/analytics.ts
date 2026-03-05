import { getAnalytics, logEvent as firebaseLogEvent, Analytics } from 'firebase/analytics';
import app from './firebase';

let analytics: Analytics | null = null;
try {
  analytics = getAnalytics(app);
} catch {
  // Analytics may not be available in dev or web
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
