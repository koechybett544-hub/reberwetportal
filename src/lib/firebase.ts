import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  setLogLevel,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Suppress benign connection retry / offline warnings from cluttering console
try {
  setLogLevel('silent');
} catch {
  // Ignore if setLogLevel is already configured
}

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);

// Configure Google Provider with Gmail & Profile scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://mail.google.com/');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.compose');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory access token cache (mandatory per security rules - do NOT store in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Test Firestore connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  if (!auth.currentUser) {
    return false;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch {
    return false;
  }
}

// Error handling conforming to Firebase Integration specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Auth State Listener
export const initAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign In With Google Popup
export const signInWithGoogle = async (): Promise<{
  user: FirebaseUser;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || '';

    cachedAccessToken = token;
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Firestore Helpers for persistent school state
export const saveTeacherToFirestore = async (teacher: any): Promise<void> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }
  if (!auth.currentUser) {
    return;
  }
  try {
    const teacherDoc = doc(db, 'teachers', teacher.id);
    await setDoc(teacherDoc, teacher, { merge: true });
  } catch (error) {
    console.warn('Could not persist teacher to Firestore (using local storage):', error);
  }
};

export const fetchTeachersFromFirestore = async (): Promise<any[]> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return [];
  }
  if (!auth.currentUser) {
    return [];
  }
  try {
    const teachersCol = collection(db, 'teachers');
    const snapshot = await getDocs(teachersCol);
    return snapshot.docs.map((d) => d.data());
  } catch (error) {
    console.warn('Could not fetch teachers from Firestore (using local storage):', error);
    return [];
  }
};

export const saveMarksToFirestore = async (marks: any[]): Promise<void> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }
  if (!auth.currentUser) {
    return;
  }
  try {
    const marksDoc = doc(db, 'assessments', 'current_term_marks');
    await setDoc(marksDoc, { marks, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.warn('Could not persist marks to Firestore (using local storage):', error);
  }
};

