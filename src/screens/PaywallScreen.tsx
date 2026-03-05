import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Button, Background } from '../components';
import { colors, typography, spacing } from '../theme';

interface PaywallScreenProps {
  visible: boolean;
  onClose: () => void;
  onPurchase?: () => void;
}

export function PaywallScreen({ visible, onClose, onPurchase }: PaywallScreenProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>Not now</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Priority messages</Text>
          <Text style={styles.subtitle}>Send messages that get noticed</Text>
          <View style={styles.bullets}>
            <Text style={styles.bullet}>• Louder delivery when allowed by your device</Text>
            <Text style={styles.bullet}>• Free quota per day, then unlock more</Text>
            <Text style={styles.bullet}>• Support development of OutLoud</Text>
          </View>
          <Button title="Subscribe (coming soon)" onPress={onPurchase ?? onClose} style={styles.cta} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  modal: {
    backgroundColor: colors.deepInk,
    borderRadius: 24,
    padding: spacing.xxl,
    width: '100%',
    maxWidth: 360,
  },
  close: { position: 'absolute', top: 16, right: 16, zIndex: 1 },
  closeText: { ...typography.body, color: colors.textMuted },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: 8 },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  bullets: { marginBottom: spacing.xxl },
  bullet: { ...typography.body, color: colors.textPrimary, marginBottom: 8 },
  cta: { marginTop: 8 },
});
