import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Plus, ToggleLeft, ToggleRight, CheckCircle2, Clock, Utensils, RefreshCw, Trash2, Edit3 } from 'lucide-react';

const STATUSES = ['all', 'placed', 'preparing', 'ready', 'completed', 'cancelled'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu'
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // New Menu Item Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Breakfast',
    is_veg: true,
    image_url: '',
  });

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      const url = selectedStatus === 'all' ? '/api/orders/' : `/api/orders/?status=${selectedStatus}`;
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('/api/menu/all', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin menu:', err);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleToggleAvailability = async (itemId) => {
    try {
      const res = await fetch(`/api/menu/${itemId}/availability`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (res.ok) {
        fetchMenuItems();
      }
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`/api/menu/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        fetchMenuItems();
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleCreateMenuItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/menu/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newItem,
          price: parseFloat(newItem.price),
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewItem({
          name: '',
          description: '',
          price: '',
          category: 'Breakfast',
          is_veg: true,
          image_url: '',
        });
        fetchMenuItems();
      }
    } catch (err) {
      console.error('Failed to create menu item:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Canteen Management Dashboard</h1>
            <p className="text-sm text-slate-400">Live order fulfillment and canteen menu controls</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Orders
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'menu'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Manage Menu
          </button>
        </div>
      </div>

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {STATUSES.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                  selectedStatus === st
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => {
              const orderId = order._id || order.id;

              return (
                <div
                  key={orderId}
                  className="glass-card rounded-3xl p-6 border border-slate-800/80 flex flex-col justify-between space-y-4 shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start border-b border-slate-800/80 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block uppercase">Order</span>
                        <span className="text-sm font-bold text-white font-mono">#{orderId}</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <span className="text-lg font-extrabold text-orange-400">₹{order.total_amount}</span>
                    </div>

                    <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-300">
                          <span>
                            {item.name} <b className="text-orange-400 font-semibold">x{item.quantity}</b>
                          </span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Action Buttons */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">
                      Current Status: <span className="text-amber-400 capitalize">{order.status}</span>
                    </span>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {order.status === 'placed' && (
                        <button
                          onClick={() => handleUpdateStatus(orderId, 'preparing')}
                          className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-bold transition-colors"
                        >
                          Mark Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(orderId, 'ready')}
                          className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition-colors"
                        >
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => handleUpdateStatus(orderId, 'completed')}
                          className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold transition-colors"
                        >
                          Mark Completed
                        </button>
                      )}
                      {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(orderId, 'cancelled')}
                          className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MENU TAB */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">All Menu Items ({menuItems.length})</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg glow-orange"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => {
              const itemId = item._id || item.id;

              return (
                <div key={itemId} className="glass-card rounded-3xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="flex items-center gap-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-800" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-600">
                        <Utensils className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.name}</h4>
                      <p className="text-xs text-orange-400 font-extrabold">₹{item.price}</p>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mt-0.5">{item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <button
                      onClick={() => handleToggleAvailability(itemId)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        item.is_available
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}
                    >
                      {item.is_available ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      <span>{item.is_available ? 'Available' : 'Sold Out'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteItem(itemId)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-8 space-y-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Add New Menu Item</h3>
            <form onSubmit={handleCreateMenuItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Item Name</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Chole Bhature"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Brief description of ingredients & taste"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    placeholder="80.0"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Image URL</label>
                <input
                  type="url"
                  value={newItem.image_url}
                  onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_veg"
                  checked={newItem.is_veg}
                  onChange={(e) => setNewItem({ ...newItem, is_veg: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-orange-500"
                />
                <label htmlFor="is_veg" className="text-sm font-semibold text-slate-200">Vegetarian Item</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs glow-orange"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
