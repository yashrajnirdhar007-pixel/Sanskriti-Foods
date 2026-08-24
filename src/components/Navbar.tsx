import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Globe, Menu, X, Search, Heart, User, ShieldCheck, Leaf, HeartHandshake, Phone, LogOut, LayoutDashboard } from 'lucide-react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface NavbarProps {
  onCartClick: () => void;
  onWishlistClick: () => void;
}

const ADMIN_EMAILS = ['yashrajnirdhar007@gmail.com', 'nirdhar007@gmail.com', 'nirdhar007@gamil.com', 'nirdhar007@gamilcom', 'admin@gmail.com'];

export const Navbar = ({ onCartClick, onWishlistClick }: NavbarProps) => {
  const { t, i18n } = useTranslation();
  const { cart, wishlistCount } = useCart();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="w-full flex flex-col z-40 bg-white">
      {/* Top Bar */}
      <div className="bg-primary text-white text-xs py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> 100% Authentic & Homemade</span>
            <span className="flex items-center gap-1.5"><Leaf className="w-4 h-4" /> No Preservatives</span>
            <span className="flex items-center gap-1.5"><img src="https://cdn-icons-png.flaticon.com/128/3449/3449914.png" alt="" className="w-4 h-4 invert" /> Traditional Taste</span>
            <span className="flex items-center gap-1.5"><HeartHandshake className="w-4 h-4" /> Made with Love</span>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4" />
            <button onClick={() => changeLanguage('mr')} className={`hover:text-green-300 ${i18n.language === 'mr' ? 'font-bold underline' : ''}`}>मराठी</button>
            <span className="text-gray-400">|</span>
            <button onClick={() => changeLanguage('hi')} className={`hover:text-green-300 ${i18n.language === 'hi' ? 'font-bold underline' : ''}`}>हिंदी</button>
            <span className="text-gray-400">|</span>
            <button onClick={() => changeLanguage('en')} className={`hover:text-green-300 ${i18n.language === 'en' ? 'font-bold underline' : ''}`}>English</button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-[#FFF8E1] border-b border-[#E0E0E0] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 md:gap-8">
          
          {/* Mobile menu button (Left) */}
          <div className="md:hidden flex items-center shrink-0">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-stone-700 p-1.5 rounded-lg hover:bg-stone-200/50 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo and Brand Name (Center / Left-Center) */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 md:flex-initial">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center bg-primary text-white shadow-sm border border-primary/20 shrink-0">
               <Leaf className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col min-w-0 justify-center">
              <h1 className="text-base xs:text-lg sm:text-2xl font-serif font-bold text-primary leading-tight truncate">
                Sanskriti Foods
              </h1>
              <span className="text-[10px] sm:text-xs text-stone-600 font-medium leading-none truncate hidden xs:block">
                Traditional Homemade Foods
              </span>
            </div>
          </Link>

          {/* Search bar (Desktop) */}
          <div className="flex-1 max-w-2xl hidden md:flex items-center bg-white border border-stone-300 rounded-lg overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <input 
              type="text" 
              placeholder="Search for pickles, papad and more..." 
              className="w-full px-4 py-2 outline-none text-sm text-stone-800"
            />
            <button className="px-4 text-stone-500 hover:text-primary">
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 xs:gap-3 sm:gap-6 shrink-0">
            <button 
              onClick={onWishlistClick} 
              className="hidden sm:flex items-center gap-2 text-stone-700 hover:text-primary p-1.5 rounded-lg hover:bg-stone-200/40 transition-colors"
              title={t('wishlist')}
            >
              <div className="relative">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-0.5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              </div>
              <span className="text-sm font-medium hidden lg:block">{t('wishlist')}</span>
            </button>
            <button 
              onClick={onCartClick} 
              className="flex items-center gap-1.5 text-stone-700 hover:text-primary p-1.5 xs:p-2 rounded-lg hover:bg-stone-200/40 transition-colors"
              title={t('cart')}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
                  {cartItemCount}
                </span>
              </div>
              <span className="text-sm font-medium hidden lg:block">{t('cart')}</span>
            </button>
            <div className="hidden sm:flex items-center gap-2">
              {user && ADMIN_EMAILS.includes(user.email) && (
                <Link 
                  to="/admin" 
                  className="mr-2 px-3.5 py-2 bg-stone-900 text-white hover:bg-stone-800 transition-colors flex items-center gap-2 rounded-md font-bold text-xs sm:text-sm shadow-sm"
                  title="Admin Panel"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
              {user ? (
                <div className="flex items-center gap-3 border-l border-stone-200 pl-3 ml-1">
                  <div className="flex items-center gap-2 text-stone-700">
                    <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-1.5 text-stone-500 hover:text-red-500 transition-colors rounded hover:bg-red-50"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 rounded-md border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors text-xs sm:text-sm font-bold">
                    {t('login')}
                  </Link>
                  <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-md border-2 border-primary hover:bg-secondary hover:border-secondary transition-colors text-xs sm:text-sm font-bold">
                    {t('register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:block bg-[#FFF8E1] border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className={`py-3 text-sm font-medium flex items-center gap-2 ${isActive('/') ? 'text-primary font-bold' : 'text-text-primary hover:text-primary'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              {t('home')}
            </Link>
            <Link to="/shop" className={`py-3 text-sm font-medium ${isActive('/shop') ? 'text-primary font-bold' : 'text-text-primary hover:text-primary'}`}>{t('shop')}</Link>
            <Link to="/about" className={`py-3 text-sm font-medium ${isActive('/about') ? 'text-primary font-bold' : 'text-text-primary hover:text-primary'}`}>{t('about')}</Link>
            <Link to="/contact" className={`py-3 text-sm font-medium ${isActive('/contact') ? 'text-primary font-bold' : 'text-text-primary hover:text-primary'}`}>{t('contact')}</Link>
            <Link to="/orders" className={`py-3 text-sm font-medium ${isActive('/orders') ? 'text-primary font-bold' : 'text-text-primary hover:text-primary'}`}>{t('my_orders')}</Link>
          </div>
          
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-200 px-4 pt-2 pb-4 space-y-1 shadow-lg absolute w-full top-full left-0 z-50">
          <div className="mb-4">
             <div className="flex bg-stone-100 border border-stone-200 rounded-md overflow-hidden">
              <input type="text" placeholder="Search..." className="w-full px-3 py-2 outline-none bg-transparent text-sm" />
              <button className="px-3 text-stone-500"><Search className="w-4 h-4" /></button>
            </div>
          </div>
          <Link to="/" className={`block px-3 py-2 text-base font-medium rounded-md ${isActive('/') ? 'text-primary font-bold bg-primary/10' : 'text-stone-700 hover:bg-bg-light'}`} onClick={() => setIsMenuOpen(false)}>{t('home')}</Link>
          <Link to="/shop" className={`block px-3 py-2 text-base font-medium rounded-md ${isActive('/shop') ? 'text-primary font-bold bg-primary/10' : 'text-stone-700 hover:bg-bg-light'}`} onClick={() => setIsMenuOpen(false)}>{t('shop')}</Link>
          <Link to="/about" className={`block px-3 py-2 text-base font-medium rounded-md ${isActive('/about') ? 'text-primary font-bold bg-primary/10' : 'text-stone-700 hover:bg-bg-light'}`} onClick={() => setIsMenuOpen(false)}>{t('about')}</Link>
          <Link to="/contact" className={`block px-3 py-2 text-base font-medium rounded-md ${isActive('/contact') ? 'text-primary font-bold bg-primary/10' : 'text-stone-700 hover:bg-bg-light'}`} onClick={() => setIsMenuOpen(false)}>{t('contact')}</Link>
          <Link to="/orders" className={`block px-3 py-2 text-base font-medium rounded-md ${isActive('/orders') ? 'text-primary font-bold bg-primary/10' : 'text-stone-700 hover:bg-bg-light'}`} onClick={() => setIsMenuOpen(false)}>{t('my_orders')}</Link>
          <button 
            onClick={() => { onWishlistClick(); setIsMenuOpen(false); }} 
            className="w-full text-left px-3 py-2 text-base font-medium text-stone-700 hover:bg-bg-light rounded-md flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              {t('wishlist')}
            </span>
            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
              {wishlistCount}
            </span>
          </button>
          {user && ADMIN_EMAILS.includes(user.email) && (
            <Link to="/admin" className="block px-3 py-2 text-base font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-md" onClick={() => setIsMenuOpen(false)}>
              Admin Panel
            </Link>
          )}
          {user ? (
            <div className="px-3 py-4 border-b border-stone-200 mb-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-stone-800">{user.name}</p>
                </div>
                <button 
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="p-2 text-stone-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 px-3 py-2">
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center py-2 rounded-md border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors">
                {t('login')}
              </Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center py-2 bg-primary text-white rounded-md border-2 border-primary font-bold hover:bg-secondary hover:border-secondary transition-colors">
                {t('register')}
              </Link>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-stone-200">
            <label className="text-sm text-stone-500 mb-1 block">Language</label>
            <div className="flex gap-2">
              <button onClick={() => { changeLanguage('mr'); setIsMenuOpen(false); }} className={`px-3 py-1 text-sm border rounded ${i18n.language === 'mr' ? 'bg-primary text-white border-primary' : 'border-stone-300'}`}>मराठी</button>
              <button onClick={() => { changeLanguage('hi'); setIsMenuOpen(false); }} className={`px-3 py-1 text-sm border rounded ${i18n.language === 'hi' ? 'bg-primary text-white border-primary' : 'border-stone-300'}`}>हिंदी</button>
              <button onClick={() => { changeLanguage('en'); setIsMenuOpen(false); }} className={`px-3 py-1 text-sm border rounded ${i18n.language === 'en' ? 'bg-primary text-white border-primary' : 'border-stone-300'}`}>English</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
