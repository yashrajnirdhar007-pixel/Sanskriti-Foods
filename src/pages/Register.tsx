import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const validatePassword = (password: string) => {
    return {
      length: password.length >= 8,
      number: /\d/.test(password)
    };
  };

  const passValidation = validatePassword(formData.password);
  const isPasswordValid = passValidation.length && passValidation.number;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Please accept the Terms & Conditions');
      return;
    }

    setIsLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: formData.name
      });
      
      // Save user to Firestore
      const userId = formData.email.toLowerCase().trim();
      await setDoc(doc(db, 'users', userId), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        createdAt: new Date().toISOString()
      }, { merge: true });

      showToast('Successfully registered! Welcome to Sanskriti Foods.');
      navigate('/');
    } catch (err: any) {
      console.error("Error registering user in database:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please log in.');
      } else if (err.code === 'auth/configuration-not-found') {
        setError('Email/Password registration is not enabled in Firebase. Please use Google Sign-In.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-stone-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">Create Account</h2>
          <p className="text-stone-500">Join us for authentic homemade delicacies</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Full Name *</label>
            <div className="relative">
              <User className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-shadow"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-shadow"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Mobile Number *</label>
            <div className="relative">
              <Phone className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit mobile number"
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-shadow"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password *</label>
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
            {formData.password && (
              <div className="mt-2 space-y-1 text-xs">
                <p className={`flex items-center gap-1 ${passValidation.length ? 'text-green-600' : 'text-stone-500'}`}>
                  {passValidation.length ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3" />} At least 8 characters
                </p>
                <p className={`flex items-center gap-1 ${passValidation.number ? 'text-green-600' : 'text-stone-500'}`}>
                  {passValidation.number ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3" />} Contains a number
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Confirm Password *</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg outline-none focus:ring-1 text-sm transition-shadow ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-stone-300 focus:border-primary focus:ring-primary'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={formData.acceptTerms}
              onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
              className="mt-1 w-4 h-4 text-primary bg-stone-100 border-stone-300 rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="terms" className="text-sm text-stone-600 leading-snug">
              I accept the <a href="#" className="text-primary hover:underline font-medium">Terms & Conditions</a> and <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || (formData.password.length > 0 && !isPasswordValid) || (formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword) || !formData.acceptTerms}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-secondary transition-colors shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                Register Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-stone-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};
