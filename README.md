# OutLoud (working name)

A private messaging app where texts from approved contacts are spoken out loud on the receiver’s phone.

## Stack

- **Mobile:** React Native (Expo) + TypeScript
- **State:** Zustand
- **Navigation:** React Navigation (native stack)
- **Backend:** Firebase (Auth, Firestore, Cloud Functions, Storage)
- **TTS:** expo-speech
- **Push:** expo-notifications (Expo push token stored in Firestore; for FCM use a dev build and native modules)

## Setup

1. **Clone and install**
   ```bash
   cd outloud
   npm install
   ```

2. **Firebase**
   - Create a project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password for MVP)
   - Create Firestore database
   - Enable Storage
   - Copy `.env.example` to `.env` and set:
     - `EXPO_PUBLIC_FIREBASE_API_KEY`
     - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
     - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `EXPO_PUBLIC_FIREBASE_APP_ID`
   - Deploy rules and indexes:
     ```bash
     firebase deploy --only firestore
     ```

3. **Cloud Functions**
   - Install and build:
     ```bash
     cd functions && npm install && npm run build && cd ..
     ```
   - Deploy (requires Firebase CLI and project selected):
     ```bash
     firebase deploy --only functions
     ```

4. **Run the app**
   ```bash
   npx expo start
   ```
   Then open in iOS Simulator, Android emulator, or Expo Go.

## Project structure

- `App.tsx` – Entry, `GestureHandlerRootView`, `RootNavigator`
- `src/theme` – Colors, typography, spacing, shadows
- `src/components` – Buttons, Input, Card, Avatar, MessageBubble, Background, Toast
- `src/screens` – Splash, Onboarding, Auth, CreateProfile, Home, AddContact, Thread, Playback, Settings, ThreadSettings, BlockedUsers
- `src/store` – Zustand: auth, user, relationships, threads, playback, ui
- `src/lib` – firebase, auth, firestore, tts, push
- `src/navigation` – RootNavigator (conditional stacks: onboarding → auth → create profile → main)
- `functions/` – Cloud Functions (onMessageCreated: validate relationship, rate limit, send FCM)

## Test plan

See [docs/test-plan.md](docs/test-plan.md) for 30 core QA scenarios.

## Notes

- **Push:** The app stores an Expo push token in `users/{uid}.deviceTokens`. The Cloud Function is written for FCM; for Expo push you’d need to call Expo’s push API from the function when the token is an `ExponentPushToken[...]`, or use a dev build with `@react-native-firebase/messaging` to store FCM tokens.
- **Phone auth:** MVP uses email/password. Phone OTP can be added with Firebase Phone Auth and (on native) RecaptchaVerifier or a custom backend.
