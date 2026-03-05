import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';

interface MessageBubbleProps {
  text: string;
  isOutgoing: boolean;
  isOutLoud?: boolean;
  isPriority?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function MessageBubble({
  text,
  isOutgoing,
  isOutLoud,
  isPriority,
  onPress,
  onLongPress,
}: MessageBubbleProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.9}
      style={[styles.bubble, isOutgoing ? styles.outgoing : styles.incoming]}
    >
      {(isOutLoud || isPriority) && (
        <View style={styles.badges}>
          {isOutLoud && (
            <View style={styles.outLoudBadge}>
              <Text style={styles.badgeText}>OutLoud</Text>
            </View>
          )}
          {isPriority && (
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityBadgeText}>Priority</Text>
            </View>
          )}
        </View>
      )}
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginVertical: 4,
  },
  outgoing: {
    alignSelf: 'flex-end',
    backgroundColor: colors.electricViolet,
  },
  incoming: {
    alignSelf: 'flex-start',
    backgroundColor: colors.deepInk,
    borderWidth: 1,
    borderColor: colors.hairline + '59',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  outLoudBadge: {
    height: 18,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: colors.violetGlow + '2E',
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.caption,
    color: colors.violetGlow,
  },
  priorityBadge: {
    height: 18,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: colors.amber + '2E',
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  priorityBadgeText: {
    ...typography.caption,
    color: colors.amber,
  },
  text: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
