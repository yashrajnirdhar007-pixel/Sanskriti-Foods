import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, Package, Calendar } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface AdminUserDetailsModalProps {
  user: any;
  onClose: () => void;
}

export const AdminUserDetailsModal = ({ user, onClose }: AdminUserDetailsModalProps) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      setLoading(true);
      try {
        if (!user.email) {
            setLoading(false);
            return;
        }
        
        // Fetch from firestore
        let fetchedOrders: any[] = [];
        try {
            const q = query(collection(db, 'orders'), where("userEmail", "==", user.email));
            const snap = await getDocs(q);
            fetchedOrders = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        } catch (e) {
            // fallback to local storage
            const existingOrdersStr = localStorage.getItem('orders_db');
            if (existingOrdersStr) {
                const allOrders = JSON.parse(existingOrdersStr);
                fetchedOrders = allOrders.filter((o: any) => o.userEmail === user.email);
            }
        }
        
        setOrders(fetchedOrders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
        fetchUserOrders();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100 bg-stone-50/50">
          <div>
            <h2 className="text-xl font-bold text-stone-800">User Details</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* User Info Card */}
          <div className="bg-stone-50 rounded-xl p-6 border border-stone-200 mb-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
             <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
                 {user.name?.charAt(0)?.toUpperCase() || 'U'}
             </div>
             <div className="flex-1">
                 <h3 className="text-xl font-bold text-stone-900">{user.name}</h3>
                 <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-2 text-sm text-stone-600">
                     {user.email && (
                         <div className="flex items-center gap-2">
                             <Mail className="w-4 h-4" />
                             {user.email}
                         </div>
                     )}
                     {user.mobile && (
                         <div className="flex items-center gap-2">
                             <Phone className="w-4 h-4" />
                             {user.mobile}
                         </div>
                     )}
                 </div>
             </div>
             <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold whitespace-nowrap">
                Customer
             </div>
          </div>

          {/* User Orders */}
          <div>
            <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Order History
            </h3>
            
            {loading ? (
                <div className="text-center p-6 text-stone-500">Loading orders...</div>
            ) : orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-colors">
                            <div>
                                <div className="font-bold text-stone-900">{order.id}</div>
                                <div className="text-sm text-stone-500 flex items-center gap-1 mt-1">
                                    <Calendar className="w-3 h-3" />
                                    {order.date}
                                </div>
                            </div>
                            <div className="text-sm">
                                <span className="text-stone-500">Items: </span>
                                <span className="font-medium text-stone-800">{order.items?.length || 0}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-stone-500">Total: </span>
                                <span className="font-bold text-stone-900">₹{order.total}</span>
                            </div>
                            <div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="border border-stone-200 rounded-xl p-8 text-center bg-stone-50">
                    <p className="text-stone-500 font-medium">No orders found for this user.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
