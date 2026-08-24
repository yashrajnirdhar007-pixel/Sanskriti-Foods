import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Menu, X, Plus, Edit2, Trash2, Banknote, Eye, Search, Bell, ChevronDown, TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, ArrowUpRight, Filter, Settings, Leaf } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import { AdminProductModal } from '../components/AdminProductModal';
import { AdminUserDetailsModal } from '../components/AdminUserDetailsModal';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const ADMIN_EMAILS = ['yashrajnirdhar007@gmail.com', 'nirdhar007@gmail.com', 'nirdhar007@gamil.com', 'nirdhar007@gamilcom', 'admin@gmail.com'];

export const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    if (user && !ADMIN_EMAILS.includes(user.email)) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || !ADMIN_EMAILS.includes(user.email)) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#FAF7F0] text-[#242424] font-sans selection:bg-[#234B2A] selection:text-white">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-[#234B2A] text-white z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl flex flex-col`}>
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
             <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif tracking-wide leading-tight">Sanskriti Foods</h2>
            <p className="text-[10px] text-white/70 uppercase tracking-widest">Pickles</p>
          </div>
          <button className="md:hidden ml-auto text-white/70 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4 px-2">Menu</p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-white/10 text-white shadow-sm' 
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-white/70 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm h-16 flex items-center px-4 md:px-8 border-b border-[#E0E0E0] z-30 sticky top-0">
          <button className="md:hidden mr-4 text-[#242424]" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="hidden sm:block">
            <nav className="flex items-center text-sm font-medium text-gray-500">
              <span>Admin</span>
              <span className="mx-2">/</span>
              <span className="text-[#242424] capitalize">{location.pathname.split('/').pop() || 'Dashboard'}</span>
            </nav>
          </div>

          <div className="flex-1"></div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:flex items-center bg-[#FAF7F0] border border-gray-200 rounded-full px-4 py-1.5 focus-within:border-[#234B2A] focus-within:ring-1 focus-within:ring-[#234B2A] transition-all">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-48 text-[#242424] placeholder-gray-400" />
            </div>
            
            <button 
              onClick={() => alert('You have no new notifications.')}
              className="relative text-gray-400 hover:text-[#234B2A] transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#B65A3C] rounded-full"></span>
            </button>

            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            
            <div className="relative">
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <div className="w-8 h-8 bg-[#234B2A] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-[#242424] leading-none">{user.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block group-hover:text-[#242424] transition-colors" />
              </div>
              
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-bold text-[#242424] truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      navigate('/admin/settings');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <button 
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/users" element={<UsersList />} />
              <Route path="/settings" element={<div className="p-8 text-center text-gray-500">Settings Page Coming Soon</div>} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, users: 0, recentOrders: [], bestSellers: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const productsSnap = await getDocs(collection(db, 'products'));
        const usersSnap = await getDocs(collection(db, 'users'));
        
        let revenue = 0;
        const allOrders: any[] = [];
        ordersSnap.forEach(doc => {
          const data = doc.data();
          revenue += data.total || 0;
          allOrders.push({ ...data, id: doc.id });
        });
        
        // Sort orders by date descending
        allOrders.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());

        const products = productsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        setStats({
          orders: ordersSnap.size,
          revenue,
          products: productsSnap.size,
          users: usersSnap.size,
          recentOrders: allOrders.slice(0, 5),
          bestSellers: products.slice(0, 4) // Mocking best sellers for now
        });
      } catch (err) {
        console.warn('Firestore fetch failed in Admin Dashboard, falling back to local storage', err);
        const storedOrders = JSON.parse(localStorage.getItem('orders_db') || '[]');
        let revenue = 0;
        storedOrders.forEach((o: any) => revenue += (o.total || 0));
        
        setStats({
          orders: storedOrders.length, 
          revenue, 
          products: 0, 
          users: 0,
          recentOrders: storedOrders.reverse().slice(0, 5), 
          bestSellers: []
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Chart Data Mock
  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#234B2A]"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Orders', value: stats.orders, icon: ShoppingCart, change: '+12.5%', changeType: 'positive', color: 'bg-[#234B2A]' },
    { title: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: Banknote, change: '+8.2%', changeType: 'positive', color: 'bg-[#B65A3C]' },
    { title: 'Total Products', value: stats.products, icon: Package, change: '0%', changeType: 'neutral', color: 'bg-[#C69A3A]' },
    { title: 'Total Users', value: stats.users, icon: Users, change: '+24.1%', changeType: 'positive', color: 'bg-[#2F6338]' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#234B2A] mb-1">{getGreeting()}, Admin 👋</h1>
          <p className="text-[#616161]">Here's what's happening with Sanskriti Foods today, {today}.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/products')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-[#242424] rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm font-semibold">
            <Plus className="w-4 h-4" /> Add Product
          </button>
          <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-2 px-4 py-2 bg-[#234B2A] text-white rounded-lg shadow-sm hover:bg-[#2F6338] transition-colors text-sm font-semibold">
            View Orders <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                <Icon className="w-24 h-24" />
              </div>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {stat.changeType === 'positive' ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" /> {stat.change}
                  </span>
                ) : stat.changeType === 'negative' ? (
                   <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    <TrendingDown className="w-3 h-3" /> {stat.change}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-[#242424]">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#242424]">Sales Overview</h3>
              <p className="text-xs text-gray-500">Revenue over the last 7 days</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#234B2A]">
              <option>7 Days</option>
              <option>30 Days</option>
              <option>3 Months</option>
              <option>1 Year</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#234B2A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#234B2A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#242424' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#234B2A" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Analytics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-[#242424] mb-1">Order Status</h3>
          <p className="text-xs text-gray-500 mb-6">Current distribution of orders</p>
          
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-green-50/50 border border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="font-medium text-[#242424]">Completed</span>
              </div>
              <span className="font-bold text-green-700">{Math.floor(stats.orders * 0.6)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="font-medium text-[#242424]">Processing</span>
              </div>
              <span className="font-bold text-blue-700">{Math.floor(stats.orders * 0.2)}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FDF7E7] border border-[#C69A3A]/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C69A3A]/20 text-[#C69A3A] flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <span className="font-medium text-[#242424]">Pending</span>
              </div>
              <span className="font-bold text-[#C69A3A]">{Math.floor(stats.orders * 0.15)}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <span className="font-medium text-[#242424]">Cancelled</span>
              </div>
              <span className="font-bold text-red-700">{Math.floor(stats.orders * 0.05)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#242424]">Recent Orders</h3>
            <button onClick={() => navigate('/admin/orders')} className="text-sm font-semibold text-[#234B2A] hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stats.recentOrders.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400">No recent orders</td></tr>
                ) : (
                  stats.recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group">
                      <td className="py-3 font-medium text-[#242424]">#{order.id.slice(0,6)}</td>
                      <td className="py-3 text-gray-600">{order.userName || order.userEmail || 'Guest'}</td>
                      <td className="py-3 text-gray-500 text-xs">{new Date(order.date).toLocaleDateString()}</td>
                      <td className="py-3 font-semibold text-[#242424]">₹{order.total}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-[#FDF7E7] text-[#C69A3A]'
                        }`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#242424]">Best Sellers</h3>
            <button onClick={() => navigate('/admin/products')} className="text-sm font-semibold text-[#234B2A] hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {stats.bestSellers.length === 0 ? (
               <div className="py-8 text-center text-gray-400 text-sm">No products found</div>
            ) : (
              stats.bestSellers.map((prod: any, i) => (
                <div key={prod.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#242424] text-sm truncate">{prod.name}</p>
                    <p className="text-xs text-gray-500">{prod.category || 'Pickle'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-[#234B2A]">₹{typeof prod.price === 'object' ? Object.values(prod.price)[0] : prod.price}</p>
                    <p className="text-[10px] text-gray-400">{20 + (4-i)*12} sold</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (snap.empty) {
        const res = await fetch('/api/products');
        const mockProducts = await res.json();
        const savedProducts = [];
        for (const p of mockProducts) {
          const docRef = await addDoc(collection(db, 'products'), p);
          savedProducts.push({ ...p, id: docRef.id });
        }
        setProducts(savedProducts);
      } else {
        const prods = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setProducts(prods);
      }
    } catch (err) {
      try {
        const res = await fetch('/api/products');
        const mockProducts = await res.json();
        setProducts(mockProducts);
      } catch (e) {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error('Error deleting product', err);
      setDeletingId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#242424]">Products Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your catalog, pricing, and stock.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-[#234B2A] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#2F6338] shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#234B2A]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search products..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#234B2A] focus:ring-1 focus:ring-[#234B2A]" />
            </div>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-[#242424] flex items-center gap-2 hover:bg-gray-50">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Base Price</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-500">No products found.</td>
                  </tr>
                ) : (
                  products.map(prod => (
                    <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4 flex items-center gap-4">
                        <div>
                          <span className="font-bold text-[#242424] block">{prod.name}</span>
                          <span className="text-xs text-gray-500">ID: {prod.id.slice(0,8)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {prod.category}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-[#234B2A]">₹{typeof prod.price === 'object' ? (prod.price['250g'] || Object.values(prod.price)[0]) : prod.price}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setEditingProduct(prod);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-gray-500 hover:text-[#234B2A] hover:bg-[#234B2A]/10 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-1">
                            {deletingId === prod.id ? (
                              <div className="flex items-center bg-red-50 rounded-lg p-1 border border-red-100">
                                <button 
                                  onClick={() => confirmDelete(prod.id)} 
                                  className="px-2 py-1 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors text-xs font-bold"
                                >
                                  Yes
                                </button>
                                <button 
                                  onClick={() => setDeletingId(null)} 
                                  className="p-1 text-gray-500 hover:text-gray-700 rounded-md transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setDeletingId(prod.id)} 
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <AdminProductModal
          product={editingProduct}
          onClose={() => setIsModalOpen(false)}
          onSaved={(savedProduct) => {
            setIsModalOpen(false);
            if (editingProduct) {
              setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
            } else {
              setProducts([savedProduct, ...products]);
            }
          }}
        />
      )}
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const ords = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      // Sort desc
      ords.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
      setOrders(ords);
    } catch (err) {
      console.warn('Orders fetch from Firestore failed in Admin.tsx, falling back to local storage', err);
      const existingOrdersStr = localStorage.getItem('orders_db');
      if (existingOrdersStr) {
        const storedOrders = JSON.parse(existingOrdersStr);
        setOrders(storedOrders.reverse());
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status: newStatus });
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'Shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Packed': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-[#FDF7E7] text-[#C69A3A] border-[#C69A3A]/30'; // Placed/Pending
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#242424]">Order Management</h1>
          <p className="text-sm text-gray-500 mt-1">View, track, and update customer orders.</p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#234B2A]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by Order ID or Customer..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#234B2A] focus:ring-1 focus:ring-[#234B2A]" />
            </div>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-[#242424] flex items-center gap-2 hover:bg-gray-50">
              <Filter className="w-4 h-4" /> Filter Status
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Fulfillment</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-500">No orders found.</td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4 font-bold text-[#242424]">#{order.id.slice(0,8)}</td>
                      <td className="p-4">
                        <p className="font-semibold text-[#242424]">{order.userName || 'Guest'}</p>
                        <p className="text-xs text-gray-500">{order.userEmail}</p>
                      </td>
                      <td className="p-4 text-gray-600">
                        <p>{new Date(order.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </td>
                      <td className="p-4 font-bold text-[#234B2A]">₹{order.total}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${order.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <select 
                          value={order.status} 
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`border rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#234B2A]/20 text-xs font-bold transition-colors cursor-pointer appearance-none ${getStatusColor(order.status || 'Placed')}`}
                        >
                          <option value="Placed">Placed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-400 hover:text-[#234B2A] hover:bg-[#234B2A]/10 rounded-lg transition-colors inline-flex"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
};

const UsersList = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (!snap.empty) {
          setUsers(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        } else {
          const existingUsersStr = localStorage.getItem('users_db');
          if (existingUsersStr) {
             const existingUsers = JSON.parse(existingUsersStr);
             const uniqueUsersMap = new Map();
             Object.values(existingUsers).forEach((u: any) => {
               if (u.email) uniqueUsersMap.set(u.email, u);
               else if (u.mobile) uniqueUsersMap.set(u.mobile, u);
             });
             setUsers(Array.from(uniqueUsersMap.values()));
          }
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#242424]">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your registered users and administrators.</p>
        </div>
        <button className="bg-white border border-gray-200 text-[#242424] px-4 py-2 rounded-xl font-medium text-sm hover:bg-gray-50 shadow-sm transition-colors">
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#234B2A]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by name, email..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#234B2A] focus:ring-1 focus:ring-[#234B2A]" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500">No customers found.</td>
                  </tr>
                ) : (
                  users.map((u, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#242424] font-bold">
                            {(u.name || 'G').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-[#242424]">{u.name || 'Guest User'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-[#242424]">{u.email}</p>
                        <p className="text-xs text-gray-500">{u.mobile || 'No phone provided'}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold border ${ADMIN_EMAILS.includes(u.email) ? 'bg-[#234B2A]/10 text-[#234B2A] border-[#234B2A]/20' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {ADMIN_EMAILS.includes(u.email) ? 'Admin' : 'Customer'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => setSelectedUser(u)}
                          className="p-2 text-gray-400 hover:text-[#234B2A] hover:bg-[#234B2A]/10 rounded-lg transition-colors inline-flex"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedUser && (
        <AdminUserDetailsModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </div>
  );
};
