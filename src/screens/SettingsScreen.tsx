import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Background } from '../components';
import { colors, typography, spacing } from '../theme';
import { useAuthStore, useUserStore } from '../store';
import { getUserProfile } from '../lib/auth';
import { updateUserSettings } from '../lib/firestore';
import { signOut } from '../lib/auth';
import type { UserSettings } from '../types';

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const { settings } = useUserStore();

  useEffect(() => {
    if (!user?.uid) return;
    getUserProfile(user.uid).then((p) => {
      setProfile(p ?? null);
      useUserStore.getState().setSettings(p?.settings ?? null);
    });
  }, [user?.uid, setProfile]);

  const updateSetting = async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const next = { ...settings, [key]: value } as UserSettings;
    useUserStore.getState().setSettings(next);
    if (user?.uid) await updateUserSettings(user.uid, { [key]: value });
    if (key === 'autoSpeakEnabled') {
      const { events: analytics } = await import('../lib/analytics');
      analytics.speakToggleEnabled(!!value);
    }
  };

  return (
    <Background>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.placeholder} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner}>
          <Text style={styles.sectionTitle}>Speaking</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Auto Speak</Text>
            <Switch
              value={settings?.autoSpeakEnabled ?? false}
              onValueChange={(v) => updateSetting('autoSpeakEnabled', v)}
              trackColor={{ false: colors.deepInk, true: colors.violetGlow }}
              thumbColor={colors.textPrimary}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Speak from</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => {
                const next = settings?.speakFrom === 'favoritesOnly' ? 'approvedOnly' : 'favoritesOnly';
                updateSetting('speakFrom', next);
              }}
            >
              <Text style={styles.pickerText}>{settings?.speakFrom === 'favoritesOnly' ? 'Favorites only' : 'Approved contacts'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Preface "Message from…"</Text>
            <Switch
              value={settings?.prefaceEnabled ?? true}
              onValueChange={(v) => updateSetting('prefaceEnabled', v)}
              trackColor={{ false: colors.deepInk, true: colors.violetGlow }}
              thumbColor={colors.textPrimary}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Voice speed</Text>
            <Text style={styles.value}>{((settings?.ttsRate ?? 1) * 100).toFixed(0)}%</Text>
          </View>

          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Enable</Text>
            <Switch
              value={settings?.quietHoursEnabled ?? false}
              onValueChange={(v) => updateSetting('quietHoursEnabled', v)}
              trackColor={{ false: colors.deepInk, true: colors.violetGlow }}
              thumbColor={colors.textPrimary}
            />
          </View>
          {settings?.quietHoursEnabled && (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Start</Text>
                <Text style={styles.value}>{settings.quietStart}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>End</Text>
                <Text style={styles.value}>{settings.quietEnd}</Text>
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Safety</Text>
          <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('BlockedUsers')}>
            <Text style={styles.menuText}>Blocked users</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow} onPress={() => {}}>
            <Text style={styles.menuText}>Report a problem</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.accountDetails}>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Name</Text>
              <Text style={styles.accountValue}>{profile?.displayName || profile?.username || '—'}</Text>
            </View>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Email</Text>
              <Text style={styles.accountValue}>{user?.email ?? '—'}</Text>
            </View>
          </View>
          <Button title="Log out" variant="secondary" onPress={() => signOut()} style={styles.logoutBtn} />
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.danger}>Delete account</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Background>
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
  scroll: { flex: 1 },
  scrollInner: { padding: spacing.lg, paddingBottom: 48 },
  sectionTitle: { ...typography.caption, color: colors.textMuted, marginTop: 24, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  label: { ...typography.body, color: colors.textPrimary },
  value: { ...typography.body, color: colors.textSecondary },
  picker: { paddingVertical: 4 },
  pickerText: { ...typography.body, color: colors.violetGlow },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  menuText: { ...typography.body, color: colors.textPrimary },
  chevron: { fontSize: 18, color: colors.textMuted },
  accountDetails: { marginBottom: 8 },
  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  accountLabel: { ...typography.caption, color: colors.textMuted },
  accountValue: { ...typography.body, color: colors.textPrimary },
  logoutBtn: { marginTop: 8 },
  danger: { ...typography.body, color: colors.warmRose, marginTop: 16 },
});
