import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Background } from '../components';
import { colors, typography, spacing } from '../theme';
import { useAuthStore } from '../store';
import { getRelationship, updateRelationshipStatus } from '../lib/firestore';

type Params = { threadId: string; otherUid: string };

export function ThreadSettingsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { threadId, otherUid } = (route.params as Params) ?? {};
  const user = useAuthStore((s) => s.user);

  const handleBlock = async () => {
    if (!user?.uid || !otherUid) return;
    const rel = await getRelationship(user.uid, otherUid);
    if (rel) {
      await updateRelationshipStatus(rel.id, 'blocked');
      navigation.getParent()?.navigate('Home');
    }
  };

  return (
    <Background>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Thread settings</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <Button title="Block user" variant="destructive" onPress={handleBlock} />
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
  content: { padding: spacing.lg },
});
