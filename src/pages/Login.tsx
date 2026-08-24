import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useCart();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emailOrMobile: '',
    password: ''
  });

  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const emailOrMobile = formData.emailOrMobile.trim().toLowerCase();
      const password = formData.password;
      
      // Admin Check
      const isAdmin1 = emailOrMobile === 'yashrajnirdhar007@gmail.com' && password === 'yash1122';
      const isAdmin2 = ['nirdhar007@gmail.com', 'nirdhar007@gamil.com', 'nirdhar007@gamilcom'].includes(emailOrMobile) && password === 'raya007';
      const isDefaultAdmin = emailOrMobile === 'admin@gmail.com' && password === 'admin123';
      const isAdmin = isAdmin1 || isAdmin2 || isDefaultAdmin;

      // If it's a known admin account, but wrong password
      if (['yashrajnirdhar007@gmail.com', 'nirdhar007@gmail.com', 'nirdhar007@gamil.com', 'nirdhar007@gamilcom', 'admin@gmail.com'].includes(emailOrMobile)) {
         if (!isAdmin) {
             showToast('Invalid admin credentials!');
             setIsLoading(false);
             return;
         }
      }

      let fetchedEmail = emailOrMobile.includes('@') ? emailOrMobile : undefined;
      const existingUsersStr = localStorage.getItem('users_db');
      if (existingUsersStr) {
        const existingUsers = JSON.parse(existingUsersStr);
        if (existingUsers[emailOrMobile] && existingUsers[emailOrMobile].email) {
          fetchedEmail = existingUsers[emailOrMobile].email;
        }
      }

      const userEmail = fetchedEmail || (emailOrMobile.includes('@') ? emailOrMobile : `${emailOrMobile}@placeholder.com`);

      if (!isAdmin) {
        try {
          await signInWithEmailAndPassword(auth, userEmail, password);
        } catch (err: any) {
           if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
               try {
                   // Attempt to auto-register them if they don't exist (legacy migration)
                   await createUserWithEmailAndPassword(auth, userEmail, password);
                   
                   // After creation, update their profile name if we have it
                   const user = auth.currentUser;
                   if (user) {
                       let legacyName = userEmail.split('@')[0];
                       if (existingUsersStr) {
                         const existingUsers = JSON.parse(existingUsersStr);
                         if (existingUsers[userEmail] && existingUsers[userEmail].name) {
                            legacyName = existingUsers[userEmail].name;
                         }
                       }
                       await updateProfile(user, { displayName: legacyName });
                       // Update user uid in firestore
                       await setDoc(doc(db, 'users', userEmail), {
                           uid: user.uid,
                           name: legacyName,
                           email: userEmail,
                           lastLogin: new Date().toISOString()
                       }, { merge: true });
                   }
               } catch (createErr: any) {
                   if (createErr.code === 'auth/email-already-in-use') {
                       // They DO exist, so the password was actually just wrong
                       console.error('Login error:', err);
                       showToast('Invalid credentials!');
                   } else if (createErr.code === 'auth/configuration-not-found') {
                       showToast('Email/Password auth is not enabled in Firebase.');
                   } else {
                       console.error('Migration creation error:', createErr);
                       showToast('Invalid credentials!');
                   }
                   setIsLoading(false);
                   return;
               }
           } else if (err.code === 'auth/configuration-not-found') {
               console.error('Firebase Auth configuration error:', err);
               showToast('Email/Password auth is not enabled. Please use Google Sign-In or enable it in Firebase Console.');
               setIsLoading(false);
               return;
           } else {
               console.error('Login error:', err);
               showToast('Invalid credentials!');
               setIsLoading(false);
               return;
           }
        }
      } else {
        // Admin login bypasses Firebase Auth to avoid configuration-not-found for typo emails
        // Update local auth context manually
        login({
          uid: 'admin-local-session',
          name: 'Admin',
          email: userEmail
        });
      }

      // Update last login in Firestore (might fail for local admin if rules are strict, but that's expected)
      try {
        await setDoc(doc(db, 'users', userEmail), {
          email: userEmail,
          lastLogin: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        // Ignore permission errors for local admin
      }

      showToast('Successfully logged in!');
      
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error(err);
      showToast('Error logging in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (window !== window.top) {
      alert('Google Sign-In requires opening this app in a new tab. Please click the "Open in new tab" icon at the top right of the preview pane.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (user.email) {
        await setDoc(doc(db, 'users', user.email.toLowerCase().trim()), {
          name: user.displayName || 'Google User',
          email: user.email,
          photoURL: user.photoURL || null,
          lastLogin: new Date().toISOString()
        }, { merge: true });
      }
      
      showToast('Successfully logged in with Google!');
      if (user.email && ['yashrajnirdhar007@gmail.com', 'nirdhar007@gmail.com', 'nirdhar007@gamil.com', 'nirdhar007@gamilcom', 'admin@gmail.com'].includes(user.email)) {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      showToast('Error logging in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-stone-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">Welcome Back</h2>
          <p className="text-stone-500">Log in to access your orders and wishlist</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email or Mobile Number</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.emailOrMobile}
                onChange={(e) => setFormData({...formData, emailOrMobile: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-shadow"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-10 pr-10 py-2.5 border border-stone-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button type="button" className="text-sm text-primary font-bold hover:underline focus:outline-none">
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-secondary transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                Login
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-stone-500">Or continue with</span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
            className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors font-medium text-stone-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Login with Google
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-stone-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
