import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface User {
  uid: string;
  name: string;
  email: string;
  mobile?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: (user: User) => void;
  registerUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let name = firebaseUser.displayName || 'User';
        let mobile = '';
        
        if (firebaseUser.email) {
          try {
             const docRef = doc(db, 'users', firebaseUser.email.toLowerCase().trim());
             const docSnap = await getDoc(docRef);
             if (docSnap.exists()) {
               const data = docSnap.data();
               if (data.name) name = data.name;
               if (data.mobile) mobile = data.mobile;
             }
          } catch (e) {
             console.error('Error fetching user data', e);
          }
        }
        
        setUser({
          uid: firebaseUser.uid,
          name: name,
          email: firebaseUser.email || '',
          mobile: mobile,
          photoURL: firebaseUser.photoURL || undefined
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Error logging out', e);
    }
    setUser(null);
  };

  const registerUser = (userData: User) => {
    // Legacy support
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registerUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
