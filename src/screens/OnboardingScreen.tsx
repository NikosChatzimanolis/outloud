import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../components';
import { Background } from '../components';
import { colors, typography, spacing } from '../theme';
import { useUIStore } from '../store';

const ONBOARDING_KEY = '@outloud/onboarding_done';
const { width } = Dimensions.get('window');

const SLIDES = [
  { title: 'Messages that are spoken out loud', body: 'Send short messages that your person hears instantly.' },
  { title: 'Only approved people can speak to you', body: 'You decide who can send OutLoud messages.' },
  { title: 'You control when it plays', body: 'Quiet Hours and Favorites let you stay in control.' },
];

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const setOnboardingCompleted = useUIStore((s) => s.setOnboardingCompleted);

  const handleContinue = () => {
    if (index < SLIDES.length - 1) {
      setIndex(index + 1);
    } else {
      AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setOnboardingCompleted(true);
      onComplete();
    }
  };

  const handleSkip = () => {
    AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setOnboardingCompleted(true);
    onComplete();
  };

  return (
    <Background>
      <View style={styles.container}>
        <FlatList
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          )}
        />
        <View style={styles.footer}>
          <Button title={index < SLIDES.length - 1 ? 'Continue' : 'Get started'} onPress={handleContinue} />
          <Button title="Skip" variant="secondary" onPress={handleSkip} style={styles.skipBtn} />
        </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  slide: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 48,
    gap: 12,
  },
  skipBtn: {
    marginTop: 8,
  },
});
