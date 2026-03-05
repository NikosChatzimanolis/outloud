import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button, Input, Background, Avatar } from '../components';
import { colors, typography, spacing } from '../theme';
import { useAuthStore } from '../store';
import { ensureUserProfile } from '../lib/auth';

export function CreateProfileScreen({ onFinish }: { onFinish: () => void }) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const setProfile = useAuthStore((s) => s.setProfile);

  const checkUsername = async (name: string): Promise<boolean> => {
    if (!name || name.length < 2) return false;
    const q = query(
      collection(db, 'users'),
      where('username', '==', name.toLowerCase().trim())
    );
    const snap = await getDocs(q);
    return snap.empty;
  };

  const handleFinish = async () => {
    const u = username.trim().toLowerCase();
    const d = displayName.trim();
    if (!u || u.length < 2) {
      setError('Username must be at least 2 characters.');
      return;
    }
    if (!d) {
      setError('Display name is required.');
      return;
    }
    const available = await checkUsername(u);
    if (!available) {
      setError('Username is already taken.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (!user) return;
      await ensureUserProfile(user.uid, { username: u, displayName: d });
      const profile = await import('../lib/auth').then((m) => m.getUserProfile(user.uid));
      setProfile(profile ?? null);
      onFinish();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={60}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Create profile</Text>
          <Text style={styles.subtitle}>Choose a username and display name.</Text>
          <View style={styles.avatarWrap}>
            <Avatar displayName={displayName || '?'} size={80} />
          </View>
          <Input
            placeholder="Username (unique)"
            value={username}
            onChangeText={(t) => setUsername(t.replace(/\s/g, '').toLowerCase())}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            placeholder="Display name"
            value={displayName}
            onChangeText={setDisplayName}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Finish" onPress={handleFinish} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  error: {
    ...typography.caption,
    color: colors.warmRose,
    marginBottom: spacing.sm,
  },
});
