import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store';
import { getUserProfile } from '../lib/auth';
import {
  SplashScreen,
  OnboardingScreen,
  AuthScreen,
  CreateProfileScreen,
  HomeScreen,
  AddContactScreen,
  ThreadScreen,
  PlaybackScreen,
  SettingsScreen,
  ThreadSettingsScreen,
  BlockedUsersScreen,
} from '../screens';

const ONBOARDING_KEY = '@outloud/onboarding_done';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const [initializing, setInitializing] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => setOnboardingDone(v === 'true'));
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setUser(user ?? null);
      if (user) {
        let profile = await getUserProfile(user.uid);
        if (!profile && user.uid) {
          await new Promise((r) => setTimeout(r, 400));
          profile = await getUserProfile(user.uid);
        }
        setProfile(profile ?? null);
      } else {
        setProfile(null);
      }
      setInitializing(false);
    });
    return unsub;
  }, [setUser, setProfile]);

  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  if (initializing || onboardingDone === null) {
    return <SplashScreen onReady={() => {}} />;
  }

  const needsOnboarding = !onboardingDone;
  const needsAuth = !user;
  const needsProfile = user && (!profile || !profile.username);

  const initialRoute = needsOnboarding
    ? 'Onboarding'
    : needsAuth
      ? 'Auth'
      : needsProfile
        ? 'CreateProfile'
        : 'Home';

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0B1020' },
        }}
      >
        {needsOnboarding ? (
          <Stack.Screen name="Onboarding">
            {() => <OnboardingScreen onComplete={() => setOnboardingDone(true)} />}
          </Stack.Screen>
        ) : needsAuth ? (
          <Stack.Screen name="Auth">
            {() => <AuthScreen onSuccess={() => {}} />}
          </Stack.Screen>
        ) : needsProfile ? (
          <Stack.Screen name="CreateProfile">
            {() => <CreateProfileScreen onFinish={() => {}} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="AddContact" component={AddContactScreen} />
            <Stack.Screen name="Thread" component={ThreadScreen} />
            <Stack.Screen name="Playback" component={PlaybackScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="ThreadSettings" component={ThreadSettingsScreen} />
            <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
