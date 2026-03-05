import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Input, Background } from '../components';
import { colors, typography, spacing } from '../theme';
import { useAuthStore } from '../store';
import { signUpWithEmail, signInWithEmail, ensureUserProfile, getUserProfile } from '../lib/auth';

export function AuthScreen({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Please enter email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const user = isSignUp
        ? await signUpWithEmail(email.trim(), password)
        : await signInWithEmail(email.trim(), password);
      setUser(user);
      await ensureUserProfile(user.uid, { displayName: email.split('@')[0] });
      const profile = await getUserProfile(user.uid);
      setProfile(profile ?? null);
      onSuccess();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.content}>
          <Text style={styles.title}>OutLoud</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Create an account' : 'Sign in'}
          </Text>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Input
            placeholder="Password (min 6 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={isSignUp ? 'password-new' : 'password'}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            title={isSignUp ? 'Sign up' : 'Sign in'}
            onPress={handleSubmit}
            loading={useAuthStore.getState().loading}
          />
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.switch}>
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </Text>
          </TouchableOpacity>
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
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  error: {
    ...typography.caption,
    color: colors.warmRose,
    marginBottom: spacing.sm,
  },
  switch: {
    marginTop: spacing.lg,
    alignSelf: 'center',
  },
  switchText: {
    ...typography.caption,
    color: colors.violetGlow,
  },
});
