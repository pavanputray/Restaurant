import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, Trash2, Plus, Minus, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalAmount, isCartOpen, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState(null);

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    if (!user) {
      setIsCartOpen(false);
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        cart_items: cart.map((i) => ({
          menu_item_id: i.menu_item_id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to place order');
      }

      setOrderSuccess(data);
      clearCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Your Food Basket</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {cart.length} items
            </span>
          </h2>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setOrderSuccess(null);
              setError(null);
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {orderSuccess ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto glow-green">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white">Order Placed!</h3>
              <p className="text-sm text-slate-300">
                Your order <span className="font-mono text-orange-400 font-semibold">#{orderSuccess._id || orderSuccess.id}</span> has been received by the canteen kitchen.
              </p>
              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setOrderSuccess(null);
                    navigate('/my-orders');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg transition-all"
                >
                  Track Order Status
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <X className="w-8 h-8" />
              </div>
              <p className="text-slate-400 font-medium">Your cart is empty.</p>
              <p className="text-xs text-slate-500">Explore our delicious canteen menu and add items to get started!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.menu_item_id}
                className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-800"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold">
                    Food
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-100 text-sm line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-orange-400 font-bold mt-0.5">₹{item.price} each</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.menu_item_id, -1)}
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-white px-2">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menu_item_id, 1)}
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white block">₹{item.price * item.quantity}</span>
                  <button
                    onClick={() => removeFromCart(item.menu_item_id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors mt-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {!orderSuccess && cart.length > 0 && (
          <div className="p-6 border-t border-slate-800 space-y-4 bg-slate-950/40">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-200 font-medium">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Taxes & Canteen Handling</span>
                <span className="text-emerald-400 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Amount</span>
                <span className="text-orange-400 text-xl">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-2xl shadow-xl glow-orange flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <span>Place Canteen Order</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
