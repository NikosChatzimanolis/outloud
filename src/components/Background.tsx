import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

interface BackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Background({ children, style }: BackgroundProps) {
  return (
    <LinearGradient
      colors={[colors.midnightNavy, colors.deepInk]}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
