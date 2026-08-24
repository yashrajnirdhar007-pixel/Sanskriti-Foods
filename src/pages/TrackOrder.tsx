import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, Package, Truck, MapPin, ArrowLeft, XCircle, Phone, RefreshCw, X } from 'lucide-react';
import { useCart } from '../CartContext';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

type OrderStatus = 'Placed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
const ORDER_STATUS_STEPS: OrderStatus[] = ['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

export const TrackOrder = () => {
  const { orderId } = useParams();
  const { showToast, addToCart } = useCart();
  const { user } = useAuth();
  
  const [statusIndex, setStatusIndex] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [firebaseId, setFirebaseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        let foundOrder = null;
        let foundDocId = null;

        if (user) {
          const q = query(
            collection(db, 'orders'),
            where('id', '==', orderId),
            where('userId', '==', user.uid)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            foundOrder = docSnap.data();
            foundDocId = docSnap.id;
          }
        }

        // Fallback to local storage if not found in Firebase (for older guest orders)
        if (!foundOrder) {
          const storedOrders = JSON.parse(localStorage.getItem('orders_db') || '[]');
          foundOrder = storedOrders.find((o: any) => o.id === orderId);
        }

        if (foundOrder) {
          setOrder(foundOrder);
          setFirebaseId(foundDocId);
          setIsCancelled(foundOrder.status === 'Cancelled' || foundOrder.paymentStatus === 'Failed');
          
          const stepIndex = ORDER_STATUS_STEPS.indexOf(foundOrder.status || 'Placed');
          if (stepIndex !== -1) {
            setStatusIndex(stepIndex);
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold text-stone-800">Loading Order Details...</h2>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] flex flex-col items-center justify-center p-4">
        <Package className="w-16 h-16 text-stone-300 mb-4" />
        <h2 className="text-xl font-bold text-stone-800 mb-2">Order Not Found</h2>
        <p className="text-stone-500 mb-6 text-center max-w-sm">We couldn't find the order you're looking for. Please check your order ID or go back to your orders.</p>
        <Link to="/orders" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-secondary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Go to My Orders
        </Link>
      </div>
    );
  }

  const orderDetails = {
    id: order.id,
    date: order.date || order.createdAt || 'Unknown Date',
    customerName: order.userName || order.userEmail || 'Customer',
    address: order.address || 'Address not provided',
    paymentMethod: order.paymentMethod || 'Unknown',
    totalAmount: order.total || order.totalAmount || 0,
    items: order.items || []
  };

  const currentStatus = isCancelled ? 'Cancelled' : ORDER_STATUS_STEPS[statusIndex];

  const handleCancelOrder = async () => {
    setIsCancelled(true);
    setStatusIndex(-1); // Set to an invalid index to visually clear progress
    
    try {
      if (firebaseId) {
        await updateDoc(doc(db, 'orders', firebaseId), { status: 'Cancelled' });
      } else {
        // Also update in localStorage
        const storedOrders = JSON.parse(localStorage.getItem('orders_db') || '[]');
        const newStoredOrders = storedOrders.map((o: any) => o.id === orderDetails.id ? { ...o, status: 'Cancelled' } : o);
        localStorage.setItem('orders_db', JSON.stringify(newStoredOrders));
      }
      showToast(`Order ${orderDetails.id} has been cancelled.`);
    } catch (e) {
      console.error("Error cancelling order:", e);
      showToast(`Failed to cancel order.`);
      setIsCancelled(false);
    }
  };

  const handleOrderAgain = () => {
    orderDetails.items.forEach(item => {
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
      for (let i = 0; i < item.quantity; i++) {
        addToCart(product, item.variant);
      }
    });
    showToast(`Items from ${orderDetails.id} added to cart!`);
  };

  const getStatusColor = (s: string) => {
    if (s === 'Cancelled') return 'text-red-600 bg-red-100 border-red-200';
    if (s === 'Delivered') return 'text-green-700 bg-green-100 border-green-200';
    return 'text-orange-700 bg-orange-100 border-orange-200';
  };

  return (
    <div className="bg-[#fcfaf7] min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/orders" className="inline-flex items-center gap-2 text-stone-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Tracking Column */}
          <div className="flex-1 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-stone-100">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-stone-900 mb-1">Order {orderDetails.id}</h1>
                  <p className="text-stone-500 text-sm">Placed on {orderDetails.date}</p>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border ${getStatusColor(currentStatus)}`}>
                  {currentStatus === 'Cancelled' ? <XCircle className="w-4 h-4" /> : <RefreshCw className={`w-4 h-4 ${currentStatus !== 'Delivered' ? 'animate-spin' : ''}`} />}
                  {currentStatus}
                </div>
              </div>
              
              {!isCancelled && (
                <div className="flex items-center justify-between bg-stone-50 p-4 rounded-lg border border-stone-100 mb-6">
                  <div>
                    <p className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1">Expected Delivery</p>
                    <p className="font-bold text-stone-900">August 10, 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1">Delivery Partner</p>
                    <p className="font-bold text-stone-900">BlueDart Express</p>
                    <p className="text-xs text-primary font-medium mt-0.5">Tracking: BD123456789IN</p>
                  </div>
                </div>
              )}

              {/* Horizontal Progress Bar */}
              {!isCancelled && (
                <div className="mb-8 hidden sm:block">
                  <div className="relative pt-6">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-100 -translate-y-1/2 rounded-full"></div>
                    <div 
                      className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(statusIndex / (ORDER_STATUS_STEPS.length - 1)) * 100}%` }}
                    ></div>
                    <div className="relative flex justify-between">
                      {ORDER_STATUS_STEPS.map((step, index) => {
                        const isCompleted = index <= statusIndex;
                        const isCurrent = index === statusIndex;
                        return (
                          <div key={step} className="flex flex-col items-center gap-2 relative z-10 w-16">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                              isCompleted ? 'bg-primary border-primary text-white' : 'bg-white border-stone-300 text-stone-300'
                            } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-stone-300"></div>}
                            </div>
                            <span className={`text-[10px] font-medium text-center uppercase tracking-wider ${
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

              {/* Vertical Timeline */}
              {isCancelled ? (
                <div className="text-center py-8 bg-red-50 rounded-lg border border-red-100">
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-red-700">Order Cancelled</h3>
                  <p className="text-red-600/80 text-sm mt-1 max-w-sm mx-auto">This order has been cancelled and will not be delivered.</p>
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-8 py-4">
                  <div className="absolute top-4 bottom-4 left-6 sm:left-8 w-0.5 bg-stone-100"></div>
                  <div 
                    className="absolute top-4 left-6 sm:left-8 w-0.5 bg-primary transition-all duration-1000"
                    style={{ height: `${(statusIndex / (ORDER_STATUS_STEPS.length - 1)) * 100}%` }}
                  ></div>

                  <div className="space-y-6">
                    {ORDER_STATUS_STEPS.map((step, index) => {
                      const isCompleted = index <= statusIndex;
                      const isCurrent = index === statusIndex;

                      const getIcon = () => {
                        switch(step) {
                          case 'Placed': return <Clock className="w-4 h-4" />;
                          case 'Packed': return <Package className="w-4 h-4" />;
                          case 'Shipped': return <Truck className="w-4 h-4" />;
                          case 'Out for Delivery': return <MapPin className="w-4 h-4" />;
                          case 'Delivered': return <CheckCircle2 className="w-4 h-4" />;
                          default: return <CheckCircle2 className="w-4 h-4" />;
                        }
                      };

                      return (
                        <div key={step} className={`relative flex items-start gap-4 sm:gap-6 transition-all duration-500 ${!isCompleted ? 'opacity-40' : 'opacity-100'}`}>
                          <div className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center border-2 bg-white transition-colors duration-500 ${
                            isCompleted ? 'border-primary text-primary' : 'border-stone-200 text-stone-300'
                          } ${isCurrent ? 'ring-4 ring-primary/20 bg-primary text-white' : ''} ${isCompleted && !isCurrent ? 'bg-primary/10' : ''}`}>
                            {getIcon()}
                          </div>
                          
                          <div className="pt-1.5">
                            <h3 className={`text-sm sm:text-base font-bold ${isCompleted ? 'text-stone-900' : 'text-stone-400'}`}>{step}</h3>
                            {isCompleted && (
                              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                                {step === 'Placed' && 'Your order was successfully placed.'}
                                {step === 'Packed' && 'Items securely packed and ready for dispatch.'}
                                {step === 'Shipped' && 'Handed over to delivery partner.'}
                                {step === 'Out for Delivery' && 'Out for delivery. Arriving today.'}
                                {step === 'Delivered' && 'Order delivered successfully. Enjoy!'}
                              </p>
                            )}
                            {isCurrent && step === 'Shipped' && (
                              <div className="mt-3 text-xs text-stone-500 bg-stone-50 p-3 rounded-lg border border-stone-100 flex flex-col gap-1.5">
                                <p>• 09:40 AM - Arrived at destination sorting facility (Mumbai).</p>
                                <p>• 08:15 PM - Departed from origin facility (Pune).</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Products List */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
              <h3 className="font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">Items in this Order</h3>
              <div className="space-y-4">
                {orderDetails.items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-stone-100" />
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-bold text-stone-800 text-sm sm:text-base">{item.name}</h4>
                      <p className="text-xs text-stone-500 mb-1">Variant: {item.variant}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs sm:text-sm text-stone-600 font-medium">Qty: {item.quantity}</span>
                        <span className="font-bold text-stone-900 text-sm sm:text-base">₹{(typeof item.price === 'object' ? Number(Object.values(item.price)[0]) || 0 : Number(item.price) || 0) * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar Info */}
          <div className="w-full md:w-80 flex flex-col gap-6">
            
            {/* Action Buttons */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-lg text-sm font-bold transition-colors shadow-sm">
                <Phone className="w-4 h-4" /> Contact Support
              </button>
              
              {!isCancelled && currentStatus !== 'Delivered' && (
                <button onClick={handleCancelOrder} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors shadow-sm">
                  <X className="w-4 h-4" /> Cancel Order
                </button>
              )}
              
              <button onClick={handleOrderAgain} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white hover:bg-secondary rounded-lg text-sm font-bold transition-colors shadow-sm">
                <RefreshCw className="w-4 h-4" /> Order Again
              </button>
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
              <h3 className="font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">Order Information</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <span className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Customer</span>
                  <p className="font-medium text-stone-800">{orderDetails.customerName}</p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Delivery Address</span>
                  <p className="text-stone-700 leading-relaxed">{orderDetails.address}</p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Payment Method</span>
                  <p className="font-medium text-stone-800">{orderDetails.paymentMethod}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 space-y-2 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-800">₹{orderDetails.items.reduce((acc, item) => acc + (typeof item.price === 'object' ? Number(Object.values(item.price)[0]) || 0 : Number(item.price) || 0) * item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-stone-800">₹{orderDetails.totalAmount - orderDetails.items.reduce((acc, item) => acc + (typeof item.price === 'object' ? Number(Object.values(item.price)[0]) || 0 : Number(item.price) || 0) * item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-stone-200 mt-2">
                  <span className="font-bold text-stone-900 text-base">Total Amount</span>
                  <span className="font-bold text-primary text-lg">₹{orderDetails.totalAmount}</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};
