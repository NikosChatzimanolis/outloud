import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Button, Avatar, Background } from '../components';
import { colors, typography, spacing } from '../theme';
import { useAuthStore, useUserStore, usePlaybackStore } from '../store';
import { speak, stop, pause, resume, isSpeaking } from '../lib/tts';
import { getMessage, markMessagePlayed } from '../lib/firestore';
import { events as analytics } from '../lib/analytics';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

type PlaybackParams = { threadId: string; messageId: string; senderName?: string; text?: string };

export function PlaybackScreen() {
  const route = useRoute();
  const params = (route.params ?? {}) as PlaybackParams;
  const navigation = useNavigation<any>();
  const { threadId, messageId, senderName: paramSenderName, text: paramText } = params;
  const user = useAuthStore((s) => s.user);
  const settings = useUserStore((s) => s.settings);
  const [playing, setPlaying] = useState(false);
  const [senderName, setSenderName] = useState(paramSenderName ?? '');
  const [text, setText] = useState(paramText ?? '');
  const [fromUid, setFromUid] = useState<string | null>(null);

  useEffect(() => {
    if (!threadId || !messageId) return;
    const load = async () => {
      const msg = await getMessage(threadId, messageId);
      if (msg) {
        setText(msg.text);
        setFromUid(msg.fromUid);
        const userSnap = await getDoc(doc(db, 'users', msg.fromUid));
        if (userSnap.exists()) setSenderName(userSnap.data()?.displayName ?? 'Unknown');
      }
    };
    load();
  }, [threadId, messageId]);

  const hasSpoken = React.useRef(false);
  useEffect(() => {
    if (!text || !threadId || !messageId) return;
    if (hasSpoken.current) return;
    hasSpoken.current = true;
    const rate = settings?.ttsRate ?? 1;
    const pitch = settings?.ttsPitch ?? 1;
    const preface = settings?.prefaceEnabled ? `Message from ${senderName}. ` : '';
    const full = preface + text;
    setPlaying(true);
    speak(full, { rate, pitch }).then(() => setPlaying(false));
    if (user?.uid && fromUid && fromUid !== user.uid) {
      markMessagePlayed(threadId, messageId).catch(() => {});
      analytics.messagePlayedAloud();
    }
    return () => stop();
  }, [text, senderName, settings?.prefaceEnabled, settings?.ttsRate, settings?.ttsPitch, threadId, messageId, fromUid, user?.uid]);

  const handlePauseResume = async () => {
    const speaking = await isSpeaking();
    if (speaking) {
      pause();
      setPlaying(false);
    } else {
      resume();
      setPlaying(true);
    }
  };

  const handleReplay = () => {
    stop();
    const rate = settings?.ttsRate ?? 1;
    const pitch = settings?.ttsPitch ?? 1;
    const preface = settings?.prefaceEnabled ? `Message from ${senderName}. ` : '';
    speak(preface + text, { rate, pitch }).then(() => setPlaying(false));
    setPlaying(true);
  };

  const handleReply = () => {
    navigation.goBack();
    navigation.navigate('Thread', { threadId, otherUid: fromUid });
  };

  const handleDismiss = () => {
    stop();
    navigation.goBack();
  };

  return (
    <Background>
      <View style={styles.container}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.label}>Speaking…</Text>
          <View style={styles.row}>
            <Avatar displayName={senderName} size={48} />
            <Text style={styles.senderName}>{senderName}</Text>
          </View>
          <Text style={styles.messageText}>{text}</Text>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlBtn} onPress={handlePauseResume}>
              <Text style={styles.controlBtnText}>{playing ? 'Pause' : 'Resume'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={handleReplay}>
              <Text style={styles.controlBtnText}>Replay</Text>
            </TouchableOpacity>
            <Button title="Reply" onPress={handleReply} style={styles.replyBtn} />
            <Button title="Dismiss" variant="secondary" onPress={handleDismiss} />
          </View>
        </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.deepInk,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xxl,
    paddingBottom: 48,
    minHeight: 320,
  },
  handle: {
    width: 44,
    height: 5,
    backgroundColor: colors.hairline + '99',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  senderName: { ...typography.h2, color: colors.textPrimary, marginLeft: 12 },
  messageText: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xxl },
  controls: { gap: 12 },
  controlBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.electricViolet,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  controlBtnText: { ...typography.button, color: colors.textPrimary },
  replyBtn: { marginTop: 8 },
});
