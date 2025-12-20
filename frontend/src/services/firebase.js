import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: 'gitam.in', // Restrict to gitam.in domain
  prompt: 'select_account'
});

// Validate email domain
const isValidEmailDomain = (email) => {
  const allowedDomains = ['student.gitam.edu', 'gitam.in'];
  const emailDomain = email.split('@')[1];
  return allowedDomains.includes(emailDomain);
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Validate email domain
    if (!isValidEmailDomain(user.email)) {
      await signOut(auth);
      throw new Error('Please use your GITAM university email (@student.gitam.edu or @gitam.in)');
    }
    
    // Get ID token for backend authentication
    const idToken = await user.getIdToken();
    
    return { user, idToken };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Get ID token
export const getIdToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

export { auth };
