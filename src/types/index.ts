/**
 * Firestore / app types matching product brief data model
 */

export type RelationshipStatus = 'pending' | 'approved' | 'blocked';
export type DeliveryStatus = 'sent' | 'delivered' | 'played';
export type SpeakFrom = 'favoritesOnly' | 'approvedOnly';

export interface UserSettings {
  autoSpeakEnabled: boolean;
  speakFrom: SpeakFrom;
  quietHoursEnabled: boolean;
  quietStart: string; // "22:00"
  quietEnd: string;   // "08:00"
  prefaceEnabled: boolean;
  ttsRate: number;    // 0.8 - 1.2
  ttsPitch: number;   // 0.8 - 1.2
}

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  photoURL?: string;
  createdAt: { seconds: number };
  lastSeen?: { seconds: number };
  deviceTokens?: string[];
  settings?: UserSettings;
}

export interface Relationship {
  id: string;
  userA: string;
  userB: string;
  status: RelationshipStatus;
  requestedBy: string;
  createdAt: { seconds: number };
  favoriteForA: boolean;
  favoriteForB: boolean;
}

export interface Thread {
  id: string;
  participants: string[];
  lastMessageAt?: { seconds: number };
  lastMessagePreview?: string;
}

export interface Message {
  id: string;
  fromUid: string;
  toUid: string;
  text: string;
  createdAt: { seconds: number };
  deliveryStatus: DeliveryStatus;
  priority: boolean;
  playedAt?: { seconds: number };
}

export const DEFAULT_SETTINGS: UserSettings = {
  autoSpeakEnabled: false,
  speakFrom: 'approvedOnly',
  quietHoursEnabled: false,
  quietStart: '22:00',
  quietEnd: '08:00',
  prefaceEnabled: true,
  ttsRate: 1,
  ttsPitch: 1,
};
