import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, IconButton, FAB, Background } from '../components';
import { colors, typography, spacing } from '../theme';
import { useAuthStore, useThreadsStore, useRelationshipsStore } from '../store';
import { subscribeThreads, subscribeRelationships } from '../lib/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { registerForPushNotifications } from '../lib/push';
import { useNotificationHandler } from '../hooks/useNotificationHandler';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const { threads, setThreads } = useThreadsStore();
  const { relationships, setRelationships } = useRelationshipsStore();
  useNotificationHandler(navigation, !!user?.uid);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeRelationships(user.uid, setRelationships);
    return unsub;
  }, [user?.uid, setRelationships]);

  // Only show threads where the relationship is approved (not pending/blocked)
  const approvedThreads = React.useMemo(() => {
    return threads.filter((t) => {
      const rel = relationships.find((r) => r.id === t.id);
      return rel?.status === 'approved';
    });
  }, [threads, relationships]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeThreads(user.uid, setThreads);
    return unsub;
  }, [user?.uid, setThreads]);

  useEffect(() => {
    if (user?.uid) registerForPushNotifications(user.uid).catch(() => {});
  }, [user?.uid]);

  const openSettings = () => navigation.navigate('Settings');
  const openAddContact = () => navigation.navigate('AddContact');
  const openNewOutLoud = () => navigation.navigate('AddContact');

  const getOtherParticipant = (participants: string[]) =>
    participants?.find((p) => p !== user?.uid) ?? '';

  const [threadList, setThreadList] = React.useState<Array<{ id: string; participants: string[]; lastMessagePreview?: string; displayName?: string; photoURL?: string }>>([]);

  useEffect(() => {
    const load = async () => {
      const withNames = await Promise.all(
        approvedThreads.map(async (t) => {
          const otherUid = getOtherParticipant(t.participants);
          const userRef = doc(db, 'users', otherUid);
          const userSnap = await getDoc(userRef);
          const displayName = userSnap.exists() ? (userSnap.data()?.displayName ?? 'Unknown') : 'Unknown';
          const photoURL = userSnap.exists() ? userSnap.data()?.photoURL : null;
          return { ...t, displayName, photoURL };
        })
      );
      setThreadList(withNames);
    };
    load();
  }, [approvedThreads, user?.uid]);

  return (
    <Background>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openSettings} style={styles.profileCircle}>
            <Avatar photoURL={profile?.photoURL} displayName={profile?.displayName} size={36} />
          </TouchableOpacity>
          <Text style={styles.title}>OutLoud</Text>
          <IconButton onPress={openAddContact} icon={<Text style={styles.plus}>+</Text>} />
        </View>

        {threadList.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyBody}>Add a contact to start sending OutLoud messages.</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openAddContact}>
              <Text style={styles.emptyButtonText}>Add contact</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={threadList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.threadRow}
                onPress={() => navigation.navigate('Thread', { threadId: item.id, otherUid: getOtherParticipant(item.participants) })}
                activeOpacity={0.7}
              >
                <Avatar photoURL={item.photoURL} displayName={item.displayName} size={48} />
                <View style={styles.threadInfo}>
                  <Text style={styles.threadName}>{item.displayName ?? 'Unknown'}</Text>
                  <Text style={styles.preview} numberOfLines={1}>
                    {item.lastMessagePreview || 'No messages yet'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        <View style={styles.fabContainer}>
          <FAB onPress={openNewOutLoud} icon={<Text style={styles.fabIcon}>+</Text>} />
        </View>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline + '40',
  },
  profileCircle: {},
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  plus: {
    fontSize: 24,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
  },
  threadInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  threadName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  preview: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.electricViolet,
    borderRadius: 14,
  },
  emptyButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.textPrimary,
    fontWeight: '300',
  },
});
