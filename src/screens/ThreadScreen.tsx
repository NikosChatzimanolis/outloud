import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Avatar, IconButton, MessageBubble, Background } from '../components';
import { colors, typography, spacing } from '../theme';
import { useAuthStore, useThreadsStore } from '../store';
import {
  subscribeMessages,
  sendMessage,
  getRelationship,
  updateRelationshipStatus,
  setFavorite,
} from '../lib/firestore';
import type { Message } from '../types';
import { events as analytics } from '../lib/analytics';

type ThreadParams = { threadId: string; otherUid: string };

export function ThreadScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { threadId, otherUid } = (route.params as ThreadParams) ?? { threadId: '', otherUid: '' };
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState(false);
  const [other, setOther] = useState<{ displayName: string; photoURL?: string } | null>(null);
  const [relationship, setRelationship] = useState<{ id: string; userA: string; userB: string; favoriteForA: boolean; favoriteForB: boolean } | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!otherUid) return;
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', otherUid));
      if (snap.exists()) {
        const d = snap.data();
        setOther({ displayName: d.displayName ?? 'Unknown', photoURL: d.photoURL });
      }
    };
    load();
  }, [otherUid]);

  useEffect(() => {
    if (!user?.uid) return;
    getRelationship(user.uid, otherUid).then((rel) => {
      if (rel) setRelationship({ id: rel.id, userA: rel.userA, userB: rel.userB, favoriteForA: rel.favoriteForA, favoriteForB: rel.favoriteForB });
    });
  }, [user?.uid, otherUid]);

  useEffect(() => {
    if (!threadId) return;
    const unsub = subscribeMessages(threadId, setMessages);
    return unsub;
  }, [threadId]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !user || !otherUid || sending) return;
    if (relationship?.id) {
      const rel = await getRelationship(user.uid, otherUid);
      if (rel?.status !== 'approved') {
        return;
      }
    }
    setSending(true);
    setInput('');
    try {
      await sendMessage(threadId, user.uid, otherUid, text, priority);
      useThreadsStore.getState().updateThreadPreview(threadId, text, new Date());
      analytics.messageSent();
    } catch (e) {
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const isUserA = relationship ? relationship.userA === user?.uid : false;
  const isFavorite = relationship ? (isUserA ? relationship.favoriteForA : relationship.favoriteForB) : false;
  const toggleFavorite = async () => {
    if (!relationship?.id || !user) return;
    await setFavorite(relationship.id, isUserA, !isFavorite);
    setRelationship((r) =>
      r ? { ...r, favoriteForA: isUserA ? !r.favoriteForA : r.favoriteForA, favoriteForB: !isUserA ? !r.favoriteForB : r.favoriteForB } : null
    );
  };

  const openThreadSettings = () => {
    navigation.navigate('ThreadSettings', { threadId, otherUid });
  };

  const handleMessagePress = (msg: Message) => {
    if (msg.toUid === user?.uid && msg.deliveryStatus !== 'played') {
      navigation.navigate('Playback', { threadId, messageId: msg.id, senderName: other?.displayName, text: msg.text });
    }
  };

  return (
    <Background>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Avatar photoURL={other?.photoURL} displayName={other?.displayName} size={36} />
            <Text style={styles.headerName}>{other?.displayName ?? '…'}</Text>
          </View>
          <View style={styles.headerRight}>
            <IconButton
              onPress={toggleFavorite}
              icon={<Text style={styles.star}>{isFavorite ? '★' : '☆'}</Text>}
            />
            <IconButton onPress={openThreadSettings} icon={<Text style={styles.dots}>⋮</Text>} />
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <MessageBubble
                text={item.text}
                isOutgoing={item.fromUid === user?.uid}
                isOutLoud
                isPriority={item.priority}
                onPress={() => handleMessagePress(item)}
              />
            )}
          />
          <View style={styles.composer}>
            {priority && (
              <TouchableOpacity onPress={() => setPriority(false)} style={styles.priorityPill}>
                <Text style={styles.priorityPillText}>Priority</Text>
              </TouchableOpacity>
            )}
            <TextInput
              style={styles.input}
              placeholder="Message (max 200 chars)"
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={(t) => setInput(t.slice(0, 200))}
              maxLength={200}
              multiline
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || sending}
            >
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setPriority(!priority)} style={styles.priorityToggle}>
            <Text style={styles.priorityToggleText}>{priority ? 'Priority on' : 'Priority'}</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline + '40',
  },
  back: { ...typography.body, color: colors.violetGlow, marginRight: 8 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerName: { ...typography.body, fontWeight: '600', color: colors.textPrimary, marginLeft: 8 },
  headerRight: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 18, color: colors.amber },
  dots: { fontSize: 18, color: colors.textSecondary },
  list: { padding: spacing.lg, paddingBottom: 16 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.hairline + '40',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 22,
    backgroundColor: colors.deepInk,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.textPrimary,
    ...typography.body,
    marginRight: 8,
  },
  sendBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.electricViolet,
    borderRadius: 22,
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { ...typography.button, color: colors.textPrimary },
  priorityPill: {
    position: 'absolute',
    bottom: 56,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.amber + '30',
    borderRadius: 10,
  },
  priorityPillText: { ...typography.caption, color: colors.amber },
  priorityToggle: { paddingHorizontal: 16, paddingBottom: 8 },
  priorityToggleText: { ...typography.caption, color: colors.violetGlow },
});
