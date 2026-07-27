import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle2, AlertTriangle, XCircle, ChevronRight, RefreshCw } from 'lucide-react';

const STATUS_STEPS = ['placed', 'preparing', 'ready', 'completed'];

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000); // Polling status updates
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/my', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (res.ok) {
        await fetchOrders();
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-400 mb-3" />
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Order History</h1>
          <p className="text-sm text-slate-400 mt-1">Track real-time updates for your canteen orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-slate-800 space-y-4">
          <Clock className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Orders Placed Yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Whenever you order delicious meals from the home page, your active & past orders will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const orderId = order._id || order.id;
            const currentStepIdx = STATUS_STEPS.indexOf(order.status);
            const isCancelled = order.status === 'cancelled';

            return (
              <div
                key={orderId}
                className="glass-card rounded-3xl p-6 border border-slate-800/80 space-y-6 shadow-xl"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div>
                    <span className="text-xs text-slate-500 font-mono block">Order ID</span>
                    <span className="text-sm font-bold text-white font-mono">#{orderId}</span>
                    <span className="text-xs text-slate-400 block mt-1">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xl font-extrabold text-orange-400">₹{order.total_amount.toFixed(2)}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${
                        order.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : order.status === 'ready'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : order.status === 'preparing'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                          : order.status === 'cancelled'
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Status Progress Stepper */}
                {!isCancelled ? (
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-2 text-center relative">
                      {STATUS_STEPS.map((step, idx) => {
                        const isDone = currentStepIdx >= idx;
                        const isCurrent = currentStepIdx === idx;

                        return (
                          <div key={step} className="space-y-2">
                            <div
                              className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold transition-all ${
                                isDone
                                  ? 'bg-orange-500 text-white glow-orange'
                                  : 'bg-slate-800 text-slate-500'
                              } ${isCurrent ? 'ring-4 ring-orange-500/30' : ''}`}
                            >
                              {idx + 1}
                            </div>
                            <span
                              className={`text-[11px] font-bold capitalize block ${
                                isDone ? 'text-slate-200' : 'text-slate-600'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    <span>This order was cancelled.</span>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Items</h4>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1 border-b border-slate-900 last:border-none">
                      <span className="text-slate-200">
                        {item.name} <span className="text-slate-500 font-medium">x {item.quantity}</span>
                      </span>
                      <span className="text-slate-300 font-mono">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Cancel Action */}
                {order.status === 'placed' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleCancel(orderId)}
                      disabled={cancellingId === orderId}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {cancellingId === orderId ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
