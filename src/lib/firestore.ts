import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Relationship, Thread, Message, UserProfile } from '../types';

export function getRelationshipId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('_');
}

export async function getRelationship(uidA: string, uidB: string): Promise<Relationship | null> {
  const id = getRelationshipId(uidA, uidB);
  const ref = doc(db, 'relationships', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id,
    userA: d.userA,
    userB: d.userB,
    status: d.status ?? 'pending',
    requestedBy: d.requestedBy ?? '',
    createdAt: d.createdAt,
    favoriteForA: d.favoriteForA ?? false,
    favoriteForB: d.favoriteForB ?? false,
  };
}

export async function createRelationship(
  uidA: string,
  uidB: string,
  requestedBy: string
): Promise<string> {
  const id = getRelationshipId(uidA, uidB);
  const ref = doc(db, 'relationships', id);
  const snap = await getDoc(ref);
  if (snap.exists()) return id;
  await setDoc(ref, {
    userA: uidA,
    userB: uidB,
    status: 'pending',
    requestedBy,
    createdAt: serverTimestamp(),
    favoriteForA: false,
    favoriteForB: false,
  });
  const threadRef = doc(db, 'threads', id);
  await setDoc(threadRef, {
    participants: [uidA, uidB],
    lastMessageAt: serverTimestamp(),
    lastMessagePreview: '',
  });
  return id;
}

export async function updateRelationshipStatus(
  relationshipId: string,
  status: 'approved' | 'blocked' | 'pending'
): Promise<void> {
  const ref = doc(db, 'relationships', relationshipId);
  await updateDoc(ref, { status });
}

export async function setFavorite(
  relationshipId: string,
  forUserA: boolean,
  value: boolean
): Promise<void> {
  const ref = doc(db, 'relationships', relationshipId);
  await updateDoc(ref, forUserA ? { favoriteForA: value } : { favoriteForB: value });
}

export function subscribeRelationships(
  uid: string,
  callback: (relationships: Relationship[]) => void
): () => void {
  const map = new Map<string, Relationship>();
  const emit = () => callback(Array.from(map.values()));

  const qA = query(collection(db, 'relationships'), where('userA', '==', uid));
  const unsubA = onSnapshot(qA, (snap) => {
    snap.docs.forEach((d) => {
      const data = d.data();
      map.set(d.id, {
        id: d.id,
        userA: data.userA,
        userB: data.userB,
        status: data.status,
        requestedBy: data.requestedBy ?? '',
        createdAt: data.createdAt,
        favoriteForA: data.favoriteForA ?? false,
        favoriteForB: data.favoriteForB ?? false,
      });
    });
    emit();
  });
  const qB = query(collection(db, 'relationships'), where('userB', '==', uid));
  const unsubB = onSnapshot(qB, (snap) => {
    snap.docs.forEach((d) => {
      const data = d.data();
      map.set(d.id, {
        id: d.id,
        userA: data.userA,
        userB: data.userB,
        status: data.status,
        requestedBy: data.requestedBy ?? '',
        createdAt: data.createdAt,
        favoriteForA: data.favoriteForA ?? false,
        favoriteForB: data.favoriteForB ?? false,
      });
    });
    emit();
  });
  return () => {
    unsubA();
    unsubB();
  };
}

export async function getThread(threadId: string): Promise<Thread | null> {
  const ref = doc(db, 'threads', threadId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id,
    participants: d.participants ?? [],
    lastMessageAt: d.lastMessageAt,
    lastMessagePreview: d.lastMessagePreview,
  };
}

export async function getThreadsForUser(uid: string): Promise<Thread[]> {
  const q = query(
    collection(db, 'threads'),
    where('participants', 'array-contains', uid),
    limit(50)
  );
  const snap = await getDocs(q);
  const threads = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      participants: data.participants ?? [],
      lastMessageAt: data.lastMessageAt,
      lastMessagePreview: data.lastMessagePreview,
    };
  });
  threads.sort((a, b) => {
    const ta = a.lastMessageAt?.seconds ?? 0;
    const tb = b.lastMessageAt?.seconds ?? 0;
    return tb - ta;
  });
  return threads;
}

export function subscribeThreads(uid: string, callback: (threads: Thread[]) => void): () => void {
  // Query without orderBy to avoid requiring a composite index (participants + lastMessageAt).
  // Sort in memory so the app works before the index is built or without deploying indexes.
  const q = query(
    collection(db, 'threads'),
    where('participants', 'array-contains', uid),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    const threads = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        participants: data.participants ?? [],
        lastMessageAt: data.lastMessageAt,
        lastMessagePreview: data.lastMessagePreview,
      };
    });
    // Newest first (null/undefined lastMessageAt at end)
    threads.sort((a, b) => {
      const ta = a.lastMessageAt?.seconds ?? 0;
      const tb = b.lastMessageAt?.seconds ?? 0;
      return tb - ta;
    });
    callback(threads);
  });
}

export function subscribeMessages(
  threadId: string,
  callback: (messages: Message[]) => void
): () => void {
  const q = query(
    collection(db, 'threads', threadId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        fromUid: data.fromUid,
        toUid: data.toUid,
        text: data.text,
        createdAt: data.createdAt,
        deliveryStatus: data.deliveryStatus ?? 'sent',
        priority: data.priority ?? false,
        playedAt: data.playedAt,
      };
    });
    callback(messages);
  });
}

export async function sendMessage(
  threadId: string,
  fromUid: string,
  toUid: string,
  text: string,
  priority: boolean
): Promise<string> {
  const messagesRef = collection(db, 'threads', threadId, 'messages');
  const docRef = await addDoc(messagesRef, {
    fromUid,
    toUid,
    text: text.trim().slice(0, 200),
    createdAt: serverTimestamp(),
    deliveryStatus: 'sent',
    priority: !!priority,
    playedAt: null,
  });
  const threadRef = doc(db, 'threads', threadId);
  await updateDoc(threadRef, {
    lastMessageAt: serverTimestamp(),
    lastMessagePreview: text.trim().slice(0, 80),
  });
  return docRef.id;
}

export async function getMessage(
  threadId: string,
  messageId: string
): Promise<Message | null> {
  const ref = doc(db, 'threads', threadId, 'messages', messageId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id,
    fromUid: d.fromUid,
    toUid: d.toUid,
    text: d.text,
    createdAt: d.createdAt,
    deliveryStatus: d.deliveryStatus ?? 'sent',
    priority: d.priority ?? false,
    playedAt: d.playedAt,
  };
}

export async function markMessagePlayed(
  threadId: string,
  messageId: string
): Promise<void> {
  const ref = doc(db, 'threads', threadId, 'messages', messageId);
  await updateDoc(ref, { deliveryStatus: 'played', playedAt: serverTimestamp() });
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  const q = query(
    collection(db, 'users'),
    where('username', '==', username.toLowerCase().trim())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0].data();
  const id = snap.docs[0].id;
  return {
    uid: id,
    username: d.username ?? '',
    displayName: d.displayName ?? '',
    photoURL: d.photoURL,
    createdAt: d.createdAt,
    lastSeen: d.lastSeen,
    deviceTokens: d.deviceTokens,
    settings: d.settings,
  };
}

export async function updateUserSettings(uid: string, partial: Partial<UserProfile['settings']>): Promise<void> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  const current = (snap.data()?.settings ?? {}) as UserProfile['settings'];
  const settings = { ...current, ...partial };
  await updateDoc(ref, { settings });
}

export async function addReport(fromUid: string, reportedUid: string, reason?: string): Promise<void> {
  const ref = doc(collection(db, 'reports'));
  await setDoc(ref, {
    fromUid,
    reportedUid,
    reason: reason ?? '',
    createdAt: serverTimestamp(),
  });
}
