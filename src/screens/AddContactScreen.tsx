import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Avatar, Card, Background } from '../components';
import { colors, typography, spacing } from '../theme';
import { useAuthStore, useRelationshipsStore, useUIStore } from '../store';
import {
  getUserByUsername,
  createRelationship,
  getRelationship,
  updateRelationshipStatus,
  subscribeRelationships,
} from '../lib/firestore';
import { events as analytics } from '../lib/analytics';

export function AddContactScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<'search' | 'requests'>('search');
  const [username, setUsername] = useState('');
  const [searchResult, setSearchResult] = useState<{ uid: string; username: string; displayName: string; photoURL?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { relationships, setRelationships } = useRelationshipsStore();
  const showToast = useUIStore((s) => s.showToast);

  React.useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeRelationships(user.uid, setRelationships);
    return unsub;
  }, [user?.uid, setRelationships]);

  const requests = relationships.filter(
    (r) => r.status === 'pending' && r.userB === user?.uid
  );

  const handleSearch = async () => {
    if (!user || !username.trim()) return;
    setError(null);
    setSearchResult(null);
    setLoading(true);
    try {
      const found = await getUserByUsername(username.trim());
      if (!found) {
        setError('User not found.');
        setLoading(false);
        return;
      }
      if (found.uid === user.uid) {
        setError("That's you!");
        setLoading(false);
        return;
      }
      const rel = await getRelationship(user.uid, found.uid);
      if (rel?.status === 'approved') {
        setError('Already connected.');
        setSearchResult(null);
      } else if (rel?.status === 'pending') {
        setError('Request already sent.');
        setSearchResult(null);
      } else {
        setSearchResult({
          uid: found.uid,
          username: found.username,
          displayName: found.displayName,
          photoURL: found.photoURL,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!user || !searchResult) return;
    setLoading(true);
    setError(null);
    try {
      await createRelationship(user.uid, searchResult.uid, user.uid);
      showToast('Request sent.', 'success');
      setSearchResult(null);
      setUsername('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (relationshipId: string) => {
    try {
      await updateRelationshipStatus(relationshipId, 'approved');
      showToast('Approved — can speak OutLoud now.', 'success');
      analytics.contactApproved();
    } catch {
      showToast('Failed to approve.', 'error');
    }
  };

  const handleDeny = async (relationshipId: string) => {
    try {
      await updateRelationshipStatus(relationshipId, 'blocked');
      showToast('Request denied.');
    } catch {
      showToast('Failed to deny.', 'error');
    }
  };

  return (
    <Background>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add contact</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'search' && styles.tabActive]}
            onPress={() => setTab('search')}
          >
            <Text style={[styles.tabText, tab === 'search' && styles.tabTextActive]}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'requests' && styles.tabActive]}
            onPress={() => setTab('requests')}
          >
            <Text style={[styles.tabText, tab === 'requests' && styles.tabTextActive]}>Requests</Text>
          </TouchableOpacity>
        </View>

        {tab === 'search' && (
          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={colors.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Button title="Search" onPress={handleSearch} loading={loading} style={styles.searchBtn} />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {searchResult && (
              <Card style={styles.resultCard}>
                <View style={styles.resultRow}>
                  <Avatar
                    photoURL={searchResult.photoURL}
                    displayName={searchResult.displayName}
                    size={48}
                  />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{searchResult.displayName}</Text>
                    <Text style={styles.resultUsername}>@{searchResult.username}</Text>
                  </View>
                  <Button title="Add" onPress={handleSendRequest} loading={loading} />
                </View>
              </Card>
            )}
          </ScrollView>
        )}

        {tab === 'requests' && (
          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
            <Text style={styles.hint}>Only approved people can speak out loud.</Text>
            {requests.length === 0 ? (
              <Text style={styles.empty}>No pending requests.</Text>
            ) : (
              requests.map((r) => {
                const otherUid = r.userA;
                return (
                  <RequestCard
                    key={r.id}
                    otherUid={otherUid}
                    onApprove={() => handleApprove(r.id)}
                    onDeny={() => handleDeny(r.id)}
                    loading={loading}
                  />
                );
              })
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </Background>
  );
}

function RequestCard({
  otherUid,
  onApprove,
  onDeny,
  loading,
}: {
  otherUid: string;
  onApprove: () => void;
  onDeny: () => void;
  loading: boolean;
}) {
  const [other, setOther] = React.useState<{ displayName: string; photoURL?: string } | null>(null);
  React.useEffect(() => {
    const load = async () => {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      const snap = await getDoc(doc(db, 'users', otherUid));
      if (snap.exists()) {
        const d = snap.data();
        setOther({ displayName: d.displayName ?? 'Unknown', photoURL: d.photoURL });
      }
    };
    load();
  }, [otherUid]);
  if (!other) return null;
  return (
    <Card style={styles.requestCard}>
      <Avatar photoURL={other.photoURL} displayName={other.displayName} size={48} />
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>{other.displayName}</Text>
        <View style={styles.requestActions}>
          <Button title="Approve" onPress={onApprove} loading={loading} style={styles.approveBtn} />
          <Button title="Deny" variant="secondary" onPress={onDeny} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  back: { ...typography.body, color: colors.violetGlow },
  title: { ...typography.h2, color: colors.textPrimary },
  placeholder: { width: 60 },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  tab: { paddingVertical: 8, paddingHorizontal: 16, marginRight: 8 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.electricViolet },
  tabText: { ...typography.body, color: colors.textMuted },
  tabTextActive: { color: colors.textPrimary },
  content: { flex: 1 },
  contentInner: { padding: spacing.lg, paddingBottom: 40 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  input: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.deepInk,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    ...typography.body,
    marginRight: 12,
  },
  searchBtn: { minWidth: 100 },
  error: { ...typography.caption, color: colors.warmRose, marginBottom: 12 },
  resultCard: { marginTop: 12 },
  resultRow: { flexDirection: 'row', alignItems: 'center' },
  resultInfo: { flex: 1, marginLeft: 12 },
  resultName: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  resultUsername: { ...typography.caption, color: colors.textMuted },
  hint: { ...typography.caption, color: colors.textMuted, marginBottom: 16 },
  empty: { ...typography.body, color: colors.textMuted },
  requestCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  requestInfo: { flex: 1, marginLeft: 12 },
  requestName: { ...typography.body, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  requestActions: { flexDirection: 'row', gap: 8 },
  approveBtn: { marginRight: 8 },
});
