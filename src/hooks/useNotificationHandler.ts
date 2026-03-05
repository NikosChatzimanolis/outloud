import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Playback: { threadId: string; messageId: string; senderName?: string; text?: string };
  Thread: { threadId: string; otherUid: string };
};

export function useNotificationHandler(
  navigation: NativeStackNavigationProp<RootStackParamList> | null,
  isReady: boolean
) {
  const navRef = useRef(navigation);
  navRef.current = navigation;

  useEffect(() => {
    if (!isReady || !navRef.current) return;

    const handleResponse = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as Record<string, string>;
      const threadId = data?.threadId;
      const messageId = data?.messageId;
      const senderName = data?.senderName;
      const text = data?.text;
      if (threadId && messageId) {
        navRef.current?.navigate('Playback', {
          threadId,
          messageId,
          senderName,
          text,
        });
      }
    };

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleResponse(response);
    });

    const sub = Notifications.addNotificationResponseReceivedListener(handleResponse);
    return () => sub.remove();
  }, [isReady]);
}
