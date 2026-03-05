import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

interface AvatarProps {
  photoURL?: string | null;
  displayName?: string;
  size?: number;
}

export function Avatar({
  photoURL,
  displayName,
  size = 40,
}: AvatarProps) {
  const initial = displayName
    ? displayName.charAt(0).toUpperCase()
    : '?';

  if (photoURL) {
    return (
      <Image
        source={{ uri: photoURL }}
        style={[styles.img, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text
        style={[
          styles.initial,
          { fontSize: size * 0.4 },
        ]}
      >
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  img: {
    backgroundColor: colors.deepInk,
  },
  placeholder: {
    backgroundColor: colors.electricViolet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
