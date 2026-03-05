import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  PhoneAuthProvider,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, DEFAULT_SETTINGS } from '../types';

/** MVP: Email sign up. Enable Email/Password in Firebase Console. */
export async function signUpWithEmail(email: string, password: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

/** MVP: Email sign in. */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/** Phone OTP: verify code (use with Firebase Phone Auth + RecaptchaVerifier in native). */
export async function signInWithPhoneCode(verificationId: string, code: string): Promise<User> {
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const result = await signInWithCredential(auth, credential);
  return result.user;
}

export async function ensureUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      username: data.username ?? '',
      displayName: data.displayName ?? '',
      photoURL: data.photoURL ?? null,
      createdAt: new Date(),
      deviceTokens: [],
      settings: DEFAULT_SETTINGS,
      ...data,
    });
  } else {
    const updates: Record<string, unknown> = {};
    if (data.username !== undefined) updates.username = data.username;
    if (data.displayName !== undefined) updates.displayName = data.displayName;
    if (data.photoURL !== undefined) updates.photoURL = data.photoURL;
    if (Object.keys(updates).length > 0) {
      await setDoc(ref, updates, { merge: true });
    }
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid: snap.id,
    username: d.username ?? '',
    displayName: d.displayName ?? '',
    photoURL: d.photoURL,
    createdAt: d.createdAt,
    lastSeen: d.lastSeen,
    deviceTokens: d.deviceTokens,
    settings: d.settings ?? DEFAULT_SETTINGS,
  };
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function signOut(): Promise<void> {
  await auth.signOut();
}
