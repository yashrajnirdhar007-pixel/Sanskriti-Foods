import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { CreditCard, Wallet, Smartphone, Banknote, ShieldCheck, ChevronRight, CheckCircle2, Loader2, ArrowLeft, MapPin, Plus, Edit2 } from 'lucide-react';
import { getPriceForVariant } from '../utils/price';
import { db } from '../firebase';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';
type CheckoutStep = 1 | 2 | 3;

interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

const MOCK_ADDRESSES: Address[] = [];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const Checkout = () => {
  const { cart, cartTotal, clearCart, showToast } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  // Address states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(true);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({});

  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-stone-800 mb-2">Your cart is empty</h2>
        <p className="text-stone-500 mb-6 text-center max-w-sm">Add some items to your cart to proceed with checkout.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-secondary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Go to Shop
        </Link>
      </div>
    );
  }

  const deliveryFee = cartTotal > 999 ? 0 : 50;
  const totalAmount = cartTotal + deliveryFee;

  const handleSaveNewAddress = () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      showToast('Please fill all address fields');
      return;
    }
    const address: Address = {
      id: `addr_${Date.now()}`,
      name: newAddress.name,
      phone: newAddress.phone,
      street: newAddress.street,
      city: newAddress.city,
      state: newAddress.state,
      pincode: newAddress.pincode
    };
    setAddresses([...addresses, address]);
    setSelectedAddressId(address.id);
    setIsAddingNewAddress(false);
    setNewAddress({});
  };

  const handleProceedToPayment = () => {
    if (!selectedAddressId) {
      showToast('Please select a delivery address');
      return;
    }
    setCurrentStep(2);
  };

  const handleProceedToReview = () => {
    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      showToast('Please login to place an order');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    const selectedAddr = addresses.find(a => a.id === selectedAddressId);
    const fullAddress = `${selectedAddr?.street}, ${selectedAddr?.city}, ${selectedAddr?.state} ${selectedAddr?.pincode}`;

    const saveOrderToDB = async (orderId: string, paymentStatus: string = 'Paid', razorpayOrderId?: string, razorpayPaymentId?: string) => {
      const newOrder: any = {
        id: orderId,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Placed',
        userEmail: user.email,
        userId: user.uid, // Using actual Firebase UID
        userName: user.name,
        items: cart.map(item => ({
          id: item.product.id,
          name: item.product.name,
          image: item.product.image,
          quantity: item.quantity,
          price: getPriceForVariant(item.product.price, item.variant),
          variant: item.variant
        })),
        subtotal: cartTotal,
        delivery: deliveryFee,
        total: totalAmount,
        address: fullAddress,
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)',
        paymentStatus: paymentStatus,
        orderStatus: 'Placed'
      };

      if (razorpayOrderId) newOrder.razorpayOrderId = razorpayOrderId;
      if (razorpayPaymentId) newOrder.razorpayPaymentId = razorpayPaymentId;

      try {
        await setDoc(doc(db, 'orders', orderId), newOrder);
        console.log('Order successfully written to Firestore');
        setIsSuccess(true);
        setCreatedOrderId(orderId);
        clearCart();
      } catch (e) {
        console.error("Error saving order:", e);
        showToast('Error saving order to cloud. Please try again.');
        setIsProcessing(false);
      }
    };

    if (paymentMethod === 'cod') {
      const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      await saveOrderToDB(orderId, 'Pending');
      setIsProcessing(false);
      return;
    }

    // Online Payment via Razorpay
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        showToast('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      // Create Order
      const result = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount })
      });
      const data = await result.json();

      if (!data.success) {
        showToast(data.error || data.message || 'Unable to create payment order. Please try again.');
        setIsProcessing(false);
        return;
      }

      if (!data.key_id) {
        showToast('Razorpay Authentication failed. Please check the server-side Razorpay Test API credentials.');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: data.key_id,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Sanskriti Foods",
        description: "Order Payment",
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
              await saveOrderToDB(orderId, 'Paid', response.razorpay_order_id, response.razorpay_payment_id);
            } else {
              showToast('Payment verification failed. Your order has not been confirmed.');
            }
          } catch (err) {
            showToast('Error verifying payment');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user.name || 'Customer',
          email: user.email || 'customer@example.com',
          contact: selectedAddr?.phone || '9999999999'
        },
        theme: {
          color: "#166534"
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        showToast(response.error.description || 'Payment Failed');
        setIsProcessing(false);
      });
      paymentObject.open();

    } catch (err) {
      showToast('Something went wrong during payment');
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] bg-[#fcfaf7] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-stone-500 mb-6">Thank you for shopping with us.</p>
          <div className="bg-stone-50 p-4 rounded-lg mb-8 inline-block w-full">
            <p className="text-sm text-stone-500 mb-1">Order ID</p>
            <p className="font-bold text-stone-800 text-lg">{createdOrderId}</p>
          </div>
          <Link to="/orders" className="w-full inline-flex justify-center items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary transition-colors shadow-sm">
            View My Orders <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  return (
    <div className="bg-[#fcfaf7] min-h-screen pt-8 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Accordion Steps */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Step 1: Delivery Address */}
            <div className={`bg-white rounded-2xl border ${currentStep === 1 ? 'border-primary shadow-md' : 'border-stone-200 shadow-sm'} overflow-hidden transition-all`}>
              <div 
                className={`px-6 py-4 flex items-center justify-between cursor-pointer ${currentStep === 1 ? 'bg-primary/5' : ''}`}
                onClick={() => setCurrentStep(1)}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 1 ? 'bg-primary text-white' : currentStep > 1 ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                    {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                  </span>
                  <h2 className={`text-lg font-bold ${currentStep === 1 ? 'text-primary' : 'text-stone-800'}`}>Delivery Address</h2>
                </div>
                {currentStep > 1 && selectedAddress && (
                  <span className="text-sm text-stone-500 line-clamp-1 max-w-[200px]">{selectedAddress.name}, {selectedAddress.city}</span>
                )}
              </div>
              
              {currentStep === 1 && (
                <div className="p-6 border-t border-stone-100 animate-in slide-in-from-top-2">
                  <div className="space-y-4 mb-6">
                    {addresses.map(addr => (
                      <label key={addr.id} className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-stone-200 hover:border-stone-300'}`}>
                        <input 
                          type="radio" 
                          name="address" 
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 w-4 h-4 text-primary focus:ring-primary border-stone-300"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-stone-900">{addr.name}</span>
                            <span className="text-sm text-stone-500">{addr.phone}</span>
                          </div>
                          <p className="text-sm text-stone-600 leading-relaxed">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {!isAddingNewAddress ? (
                    <button 
                      onClick={() => setIsAddingNewAddress(true)}
                      className="flex items-center gap-2 text-primary font-bold text-sm hover:text-secondary transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add a new address
                    </button>
                  ) : (
                    <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 space-y-4">
                      <h4 className="font-bold text-stone-800 text-sm">Add New Address</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                          type="text" placeholder="Full Name" value={newAddress.name || ''}
                          onChange={e => setNewAddress({...newAddress, name: e.target.value})}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-primary outline-none"
                        />
                        <input 
                          type="tel" placeholder="Mobile Number" value={newAddress.phone || ''}
                          onChange={e => setNewAddress({...newAddress, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-primary outline-none"
                        />
                      </div>
                      <input 
                        type="text" placeholder="Flat, House no., Building, Company, Apartment" value={newAddress.street || ''}
                        onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-primary outline-none"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input 
                          type="text" placeholder="City" value={newAddress.city || ''}
                          onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-primary outline-none"
                        />
                        <input 
                          type="text" placeholder="State" value={newAddress.state || ''}
                          onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-primary outline-none"
                        />
                        <input 
                          type="text" placeholder="Pincode" value={newAddress.pincode || ''}
                          onChange={e => setNewAddress({...newAddress, pincode: e.target.value})}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <button onClick={handleSaveNewAddress} className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-bold">Save Address</button>
                        <button onClick={() => setIsAddingNewAddress(false)} className="text-stone-500 px-4 py-2 text-sm font-bold">Cancel</button>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
                    <button 
                      onClick={handleProceedToPayment}
                      className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-secondary transition-colors"
                    >
                      Use this address
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className={`bg-white rounded-2xl border ${currentStep === 2 ? 'border-primary shadow-md' : 'border-stone-200 shadow-sm'} overflow-hidden transition-all`}>
              <div 
                className={`px-6 py-4 flex items-center justify-between cursor-pointer ${currentStep === 2 ? 'bg-primary/5' : ''} ${currentStep < 2 ? 'opacity-60 pointer-events-none' : ''}`}
                onClick={() => { if(currentStep > 2) setCurrentStep(2); }}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 2 ? 'bg-primary text-white' : currentStep > 2 ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                    {currentStep > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                  </span>
                  <h2 className={`text-lg font-bold ${currentStep === 2 ? 'text-primary' : 'text-stone-800'}`}>Payment Method</h2>
                </div>
                {currentStep > 2 && (
                  <span className="text-sm text-stone-500 uppercase">{paymentMethod}</span>
                )}
              </div>

              {currentStep === 2 && (
                <div className="p-6 border-t border-stone-100 animate-in slide-in-from-top-2">
                  <div className="space-y-4 mb-6">
                    {/* UPI */}
                    <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-stone-200 hover:border-stone-300'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <input 
                          type="radio" 
                          name="payment_method" 
                          value="upi" 
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')}
                          className="w-4 h-4 text-primary focus:ring-primary border-stone-300"
                        />
                        <Smartphone className={`w-5 h-5 ${paymentMethod === 'upi' ? 'text-primary' : 'text-stone-500'}`} />
                        <span className="font-bold text-stone-800">UPI (GPay, PhonePe, Paytm)</span>
                      </div>
                      {paymentMethod === 'upi' && (
                        <div className="ml-7 mt-2 text-sm text-stone-500 animate-in slide-in-from-top-2">
                          You will be redirected to securely pay via Razorpay.
                        </div>
                      )}
                    </label>

                    {/* Card */}
                    <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-stone-200 hover:border-stone-300'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <input 
                          type="radio" 
                          name="payment_method" 
                          value="card" 
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="w-4 h-4 text-primary focus:ring-primary border-stone-300"
                        />
                        <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-primary' : 'text-stone-500'}`} />
                        <span className="font-bold text-stone-800">Credit / Debit Card</span>
                      </div>
                      {paymentMethod === 'card' && (
                        <div className="ml-7 mt-2 text-sm text-stone-500 animate-in slide-in-from-top-2">
                          You will be redirected to securely pay via Razorpay.
                        </div>
                      )}
                    </label>

                    {/* Net Banking */}
                    <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'netbanking' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-stone-200 hover:border-stone-300'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <input 
                          type="radio" 
                          name="payment_method" 
                          value="netbanking" 
                          checked={paymentMethod === 'netbanking'}
                          onChange={() => setPaymentMethod('netbanking')}
                          className="w-4 h-4 text-primary focus:ring-primary border-stone-300"
                        />
                        <Wallet className={`w-5 h-5 ${paymentMethod === 'netbanking' ? 'text-primary' : 'text-stone-500'}`} />
                        <span className="font-bold text-stone-800">Net Banking</span>
                      </div>
                      {paymentMethod === 'netbanking' && (
                        <div className="ml-7 mt-2 text-sm text-stone-500 animate-in slide-in-from-top-2">
                          You will be redirected to securely pay via Razorpay.
                        </div>
                      )}
                    </label>

                    {/* COD */}
                    <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-stone-200 hover:border-stone-300'}`}>
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="payment_method" 
                          value="cod" 
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="w-4 h-4 text-primary focus:ring-primary border-stone-300"
                        />
                        <Banknote className={`w-5 h-5 ${paymentMethod === 'cod' ? 'text-primary' : 'text-stone-500'}`} />
                        <span className="font-bold text-stone-800">Cash on Delivery</span>
                      </div>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex justify-end">
                    <button 
                      onClick={handleProceedToReview}
                      className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-secondary transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Order Review */}
            <div className={`bg-white rounded-2xl border ${currentStep === 3 ? 'border-primary shadow-md' : 'border-stone-200 shadow-sm'} overflow-hidden transition-all`}>
              <div 
                className={`px-6 py-4 flex items-center gap-4 ${currentStep < 3 ? 'opacity-60' : 'bg-primary/5'}`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 3 ? 'bg-primary text-white' : 'bg-stone-100 text-stone-500'}`}>
                  3
                </span>
                <h2 className={`text-lg font-bold ${currentStep === 3 ? 'text-primary' : 'text-stone-800'}`}>Order Review</h2>
              </div>

              {currentStep === 3 && (
                <div className="p-6 border-t border-stone-100 animate-in slide-in-from-top-2">
                  <div className="space-y-6">
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-stone-800">Delivery Address</h4>
                          {selectedAddress && (
                            <div className="text-sm text-stone-600 mt-1">
                              <p>{selectedAddress.name} ({selectedAddress.phone})</p>
                              <p>{selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                            </div>
                          )}
                        </div>
                        <button onClick={() => setCurrentStep(1)} className="text-primary hover:text-secondary text-sm font-bold flex items-center gap-1">
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-start pt-4 border-t border-stone-200">
                        <div>
                          <h4 className="font-bold text-stone-800">Payment Method</h4>
                          <p className="text-sm text-stone-600 mt-1 capitalize">{paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod}</p>
                        </div>
                        <button onClick={() => setCurrentStep(2)} className="text-primary hover:text-secondary text-sm font-bold flex items-center gap-1">
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-stone-800 mb-4">Items in Order</h4>
                      <div className="space-y-4">
                        {cart.map(item => (
                          <div key={`${item.product.id}-${item.variant}`} className="flex gap-4 border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                            <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg border border-stone-100" />
                            <div className="flex-1 flex flex-col justify-center">
                              <h5 className="font-bold text-stone-800 text-sm">{item.product.name}</h5>
                              <p className="text-xs text-stone-500 mt-1">Variant: {item.variant}</p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-stone-600 font-medium">Qty: {item.quantity}</span>
                                <span className="font-bold text-stone-900">₹{getPriceForVariant(item.product.price, item.variant) * item.quantity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-bold text-stone-800 mb-4 pb-4 border-b border-stone-100">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Items Total</span>
                  <span className="font-medium text-stone-800">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Delivery Charges</span>
                  <span className="font-medium text-stone-800">{deliveryFee === 0 ? <span className="text-green-600">Free</span> : `₹${deliveryFee}`}</span>
                </div>
                {deliveryFee === 0 && (
                  <div className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-md font-medium">
                    You saved ₹50 on delivery!
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-3 border-t border-stone-200">
                  <span className="text-lg font-bold text-stone-900">Total Amount</span>
                  <span className="text-xl font-bold text-primary">₹{totalAmount}</span>
                </div>
              </div>

              {currentStep === 3 ? (
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full mt-6 bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-secondary transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${totalAmount}`}
                    </>
                  )}
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full mt-6 bg-stone-100 text-stone-400 py-3.5 rounded-xl font-bold cursor-not-allowed"
                >
                  Proceed to Pay
                </button>
              )}
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>Safe and Secure Payments</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
