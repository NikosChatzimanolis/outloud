import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '../components';
import { colors, typography, spacing } from '../theme';

export function BlockedUsersScreen() {
  const navigation = useNavigation<any>();

  return (
    <Background>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Blocked users</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <Text style={styles.empty}>No blocked users.</Text>
        </View>
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
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  empty: { ...typography.body, color: colors.textMuted },
});
