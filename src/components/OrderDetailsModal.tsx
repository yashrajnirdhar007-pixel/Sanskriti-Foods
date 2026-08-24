import React from 'react';
import { X, Package, MapPin, CreditCard, Clock } from 'lucide-react';

interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
}

export const OrderDetailsModal = ({ order, onClose }: OrderDetailsModalProps) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100 bg-stone-50/50">
          <div>
            <h2 className="text-xl font-bold text-stone-800">Order Details</h2>
            <p className="text-sm text-stone-500 mt-1">ID: {order.id}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Customer Info */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
              <div className="flex items-center gap-2 text-primary font-bold mb-3">
                <MapPin className="w-4 h-4" />
                Shipping Details
              </div>
              <p className="text-sm font-medium text-stone-800">{order.userName || 'Guest'}</p>
              <p className="text-sm text-stone-600">{order.userEmail}</p>
              <p className="text-sm text-stone-600 mt-2 whitespace-pre-wrap">{order.address || 'Address not provided'}</p>
            </div>

            {/* Order Info */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
              <div className="flex items-center gap-2 text-primary font-bold mb-3">
                <CreditCard className="w-4 h-4" />
                Payment & Status
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Date:</span>
                  <span className="font-medium text-stone-800">{order.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Method:</span>
                  <span className="font-medium text-stone-800">{order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Payment Status:</span>
                  <span className={`font-bold ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>{order.paymentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Order Status:</span>
                  <span className="font-bold text-stone-800">{order.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Order Items
            </h3>
            <div className="border border-stone-100 rounded-xl overflow-hidden">
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-4 border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-stone-100" />
                    <div className="flex-1">
                      <h4 className="font-bold text-stone-800">{item.name}</h4>
                      <p className="text-sm text-stone-500">Variant: {item.variant}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-stone-800">₹{typeof item.price === 'object' ? Object.values(item.price)[0] : item.price}</p>
                      <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-stone-500 text-sm">No items found</div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-sm space-y-2">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>₹{order.subtotal || order.total}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Delivery</span>
              <span>₹{order.delivery || 0}</span>
            </div>
            <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-200 text-base">
              <span>Total</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
