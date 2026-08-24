import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, XCircle, Search, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';

type OrderStatus = 'Placed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  variant: string;
}

interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  userEmail?: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  address: string;
  paymentMethod: string;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-10928',
    date: 'August 5, 2026',
    status: 'Delivered',
    items: [
      {
        id: '1',
        name: 'Homemade Mango Pickle',
        image: 'https://images.unsplash.com/photo-1627464016663-71862142279f?w=400&auto=format&fit=crop&q=60',
        quantity: 2,
        price: 250,
        variant: '500g',
      },
      {
        id: '2',
        name: 'Urad Dal Papad',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=60',
        quantity: 1,
        price: 150,
        variant: 'Pack of 50',
      }
    ],
    subtotal: 650,
    delivery: 50,
    total: 700,
    address: '123 Main St, Apartment 4B, Mumbai, Maharashtra 400001',
    paymentMethod: 'UPI / WhatsApp Pay',
  },
  {
    id: 'ORD-10935',
    date: 'August 7, 2026',
    status: 'Shipped',
    items: [
      {
        id: '3',
        name: 'Spicy Lemon Pickle',
        image: 'https://images.unsplash.com/photo-1589115682855-89f41b212f48?w=400&auto=format&fit=crop&q=60',
        quantity: 1,
        price: 220,
        variant: '500g',
      }
    ],
    subtotal: 220,
    delivery: 50,
    total: 270,
    address: '45 Park Avenue, Bangalore, Karnataka 560001',
    paymentMethod: 'Cash on Delivery',
  },
  {
    id: 'ORD-10890',
    date: 'July 25, 2026',
    status: 'Cancelled',
    items: [
      {
        id: '4',
        name: 'Rice Kurdai',
        image: 'https://images.unsplash.com/photo-1592394533824-9440e5d68530?w=400&auto=format&fit=crop&q=60',
        quantity: 3,
        price: 180,
        variant: 'Pack of 30',
      }
    ],
    subtotal: 540,
    delivery: 0,
    total: 540,
    address: 'Flat 12, Sunrise View, Pune, Maharashtra 411001',
    paymentMethod: 'UPI / WhatsApp Pay',
  }
];

const ORDER_STATUS_STEPS = ['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

export const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Delivered' | 'Pending' | 'Cancelled'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, showToast } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        try {
          const q = query(
            collection(db, 'orders'), 
            where('userId', '==', user.uid)
          );
          const querySnapshot = await getDocs(q);
          const userOrders = querySnapshot.docs.map(doc => ({ firebaseId: doc.id, ...doc.data() } as any));
          
          userOrders.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
            return dateB - dateA;
          });
          
          setOrders(userOrders);
        } catch (error) {
          console.error("Error fetching orders:", error);
          showToast('Unable to load your orders. Please try again.');
        }
      };
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  const handleCancelOrder = async (orderId: string, firebaseId?: string) => {
    const updatedOrders = orders.map(order => order.id === orderId ? { ...order, status: 'Cancelled' as OrderStatus } : order);
    setOrders(updatedOrders);
    
    if (firebaseId) {
      try {
        await updateDoc(doc(db, 'orders', firebaseId), { status: 'Cancelled' });
        showToast(`Order ${orderId} has been cancelled.`);
      } catch (e) {
        showToast(`Order ${orderId} has been cancelled locally.`);
      }
    }
  };

  const handleTrackOrder = (orderId: string) => {
    navigate(`/track/${orderId}`);
  };

  const handleOrderAgain = (order: Order) => {
    order.items.forEach(item => {
      const product = {
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        description: '',
        category: '',
        variants: [item.variant],
        stock: 100,
        rating: 5,
        reviews: 0
      };
      // Add each item multiple times depending on quantity if possible, or just call it multiple times, but let's assume we just add to cart and user can change quantity later
      for (let i = 0; i < item.quantity; i++) {
        addToCart(product, item.variant);
      }
    });
    showToast(`Items from ${order.id} added to cart!`);
  };

  const filteredOrders = orders.filter(order => {
    // Filter by tab
    if (activeTab === 'Delivered' && order.status !== 'Delivered') return false;
    if (activeTab === 'Cancelled' && order.status !== 'Cancelled') return false;
    if (activeTab === 'Pending' && ['Delivered', 'Cancelled'].includes(order.status)) return false;
    
    // Filter by search
    if (searchQuery && !order.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return <CheckCircle2 className="w-4 h-4" />;
      case 'Cancelled': return <XCircle className="w-4 h-4" />;
      case 'Placed': return <Clock className="w-4 h-4" />;
      case 'Packed': return <Package className="w-4 h-4" />;
      default: return <Truck className="w-4 h-4" />;
    }
  };

  const getProgressPercentage = (status: OrderStatus) => {
    if (status === 'Cancelled') return 0;
    const currentIndex = ORDER_STATUS_STEPS.indexOf(status);
    if (currentIndex === -1) return 0;
    return (currentIndex / (ORDER_STATUS_STEPS.length - 1)) * 100;
  };

  return (
    <div className="bg-[#fcfaf7] min-h-screen pt-8 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">My Orders</h1>
            <p className="text-stone-500">Track and manage your recent orders.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Search by Order ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm bg-white shadow-sm"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 hide-scrollbar">
          {['All', 'Pending', 'Delivered', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {tab} Orders
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="space-y-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl border border-stone-200 shadow-[0_4px_10px_rgba(0,0,0,0.03)] overflow-hidden">
                
                {/* Order Header */}
                <div className="bg-stone-50/50 border-b border-stone-100 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    <div>
                      <p className="text-xs text-stone-500 font-medium uppercase tracking-wider mb-0.5">Order Placed</p>
                      <p className="text-sm font-semibold text-stone-800">{order.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 font-medium uppercase tracking-wider mb-0.5">Total Amount</p>
                      <p className="text-sm font-semibold text-stone-800">₹{order.total}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 font-medium uppercase tracking-wider mb-0.5">Order ID</p>
                      <p className="text-sm font-semibold text-stone-800">{order.id}</p>
                    </div>
                  </div>
                  
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                </div>

                {/* Progress Bar (if not cancelled) */}
                {order.status !== 'Cancelled' && (
                  <div className="px-4 sm:px-6 pt-6 pb-2">
                    <div className="relative">
                      {/* Background Bar */}
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-100 -translate-y-1/2 rounded-full"></div>
                      
                      {/* Active Progress */}
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${getProgressPercentage(order.status)}%` }}
                      ></div>
                      
                      {/* Steps */}
                      <div className="relative flex justify-between">
                        {ORDER_STATUS_STEPS.map((step, index) => {
                          const currentStepIndex = ORDER_STATUS_STEPS.indexOf(order.status);
                          const isCompleted = index <= currentStepIndex;
                          const isCurrent = index === currentStepIndex;
                          
                          return (
                            <div key={step} className="flex flex-col items-center gap-2 relative z-10 w-12 sm:w-20">
                              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                                isCompleted ? 'bg-primary border-primary text-white' : 'bg-white border-stone-300 text-stone-300'
                              } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                                {isCompleted ? <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-stone-300"></div>}
                              </div>
                              <span className={`text-[9px] sm:text-[10px] font-medium text-center uppercase tracking-wider ${
                                isCompleted ? 'text-stone-800' : 'text-stone-400'
                              }`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items & Summary */}
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Items List */}
                  <div className="md:col-span-2 space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-stone-100"
                        />
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="font-bold text-stone-800 text-base mb-1">{item.name}</h4>
                          <div className="text-sm text-stone-500 mb-2">Variant: <span className="font-medium text-stone-700">{item.variant}</span></div>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-sm font-medium text-stone-600">Qty: {item.quantity}</span>
                            <span className="font-bold text-stone-900">₹{(typeof item.price === 'object' ? Number(Object.values(item.price)[0]) || 0 : Number(item.price) || 0) * item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Details */}
                  <div className="bg-stone-50 rounded-xl p-5 border border-stone-100 h-fit">
                    <h4 className="font-bold text-stone-800 mb-4 border-b border-stone-200 pb-2">Order Summary</h4>
                    
                    <div className="space-y-2 text-sm text-stone-600 mb-4 border-b border-stone-200 pb-4">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-medium text-stone-800">₹{order.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span className="font-medium text-stone-800">₹{order.delivery}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200 mt-2">
                        <span>Total</span>
                        <span className="text-primary">₹{order.total}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Delivery Address</span>
                        <p className="text-sm text-stone-700 leading-relaxed">{order.address}</p>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Payment Method</span>
                        <p className="text-sm text-stone-700">{order.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-stone-100 p-4 sm:px-6 bg-stone-50/50 flex flex-wrap items-center justify-end gap-3">
                  {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                    <button onClick={() => handleCancelOrder(order.id, (order as any).firebaseId)} className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors">
                      Cancel Order
                    </button>
                  )}
                  {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                     <button onClick={() => handleTrackOrder(order.id)} className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-white rounded-lg text-sm font-bold transition-colors shadow-sm bg-white">
                      Track Order
                     </button>
                  )}
                  <button onClick={() => handleOrderAgain(order)} className="px-4 py-2 bg-primary text-white hover:bg-secondary rounded-lg text-sm font-bold transition-colors shadow-sm">
                    Order Again
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-stone-200 shadow-sm">
              <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-stone-800 mb-2">No orders found</h3>
              <p className="text-stone-500 max-w-sm mx-auto mb-6">You haven't placed any orders matching your criteria yet.</p>
              <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-md font-bold hover:bg-secondary transition-colors">
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
