import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Background } from '../components';
import { colors, typography } from '../theme';

export function SplashScreen({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    const t = setTimeout(onReady, 1500);
    return () => clearTimeout(t);
  }, [onReady]);

  return (
    <Background>
      <View style={styles.center}>
        <Text style={styles.logo}>OutLoud</Text>
        <Text style={styles.tagline}>Messages that speak</Text>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
