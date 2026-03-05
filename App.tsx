import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';

import { auth, db } from './src/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  useEffect(() => {
    const run = async () => {
      // Change this email each time if you want multiple test users
      const email = 'test1@outloud.com';
      const password = 'Password123!';

      let user;
      try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        user = res.user;
      } catch (e) {
        const res = await signInWithEmailAndPassword(auth, email, password);
        user = res.user;
      }

      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          email: user.email,
          deviceTokens: [],
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      console.log('Signed in + ensured user doc:', user.uid);
    };

    run();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <RootNavigator />
    </GestureHandlerRootView>
  );
}