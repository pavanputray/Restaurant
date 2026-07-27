import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { apiFetch } from '../utils/api';
import { Search, Plus, Check, Utensils, Flame, Leaf, Coffee, Pizza, Sparkles } from 'lucide-react';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages'];

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const { addToCart, cart } = useCart();
  const [addedIds, setAddedIds] = useState({});

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await apiFetch('/api/menu/');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    const id = item._id || item.id;
    setAddedIds((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [id]: false }));
    }, 1200);
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesVeg = !filterVegOnly || item.is_veg;

    return matchesCategory && matchesSearch && matchesVeg;
  });

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 bg-gradient-to-b from-slate-900/90 to-slate-950 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.15),rgba(255,255,255,0))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Fast & Fresh Campus Meals</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Delicious Hostel Bites, <br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Skip The Kitchen Lines
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Order fresh breakfast, thalis, snacks, and chilled beverages directly from your hostel room with real-time order status tracking.
          </p>

          {/* Search & Filter Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4" />
              <input
                type="text"
                placeholder="Search for masala dosa, biryani, coffee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-28 py-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-sm font-medium shadow-xl"
              />
              <button
                onClick={() => setFilterVegOnly(!filterVegOnly)}
                className={`absolute right-3 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  filterVegOnly
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                <span>Veg Only</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex-shrink-0 flex items-center gap-2 border ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-orange-500 shadow-lg glow-orange scale-105'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat === 'Breakfast' && <Coffee className="w-4 h-4" />}
              {cat === 'Lunch' && <Utensils className="w-4 h-4" />}
              {cat === 'Snacks' && <Pizza className="w-4 h-4" />}
              {cat === 'Beverages' && <Flame className="w-4 h-4" />}
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Menu Items Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800/80 max-w-md mx-auto space-y-3">
            <Utensils className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Menu Items Found</h3>
            <p className="text-sm text-slate-400">Try clearing your search query or selecting another category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const itemId = item._id || item.id;
              const isAdded = addedIds[itemId];
              const inCartItem = cart.find((c) => c.menu_item_id === itemId);

              return (
                <div
                  key={itemId}
                  className="group rounded-3xl glass-card border border-slate-800/80 hover:border-slate-700 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                >
                  <div>
                    {/* Item Image */}
                    <div className="relative h-44 overflow-hidden bg-slate-900">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                          <Utensils className="w-10 h-10" />
                        </div>
                      )}

                      {/* Veg / Non-Veg Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${
                            item.is_veg
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                              : 'bg-rose-950/80 text-rose-400 border-rose-500/40'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.is_veg ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          ></span>
                          {item.is_veg ? 'Veg' : 'Non-Veg'}
                        </span>
                      </div>

                      {/* Category Badge */}
                      {item.category && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-slate-300 border border-slate-800 backdrop-blur-md">
                            {item.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-2">
                      <h3 className="font-bold text-white text-base group-hover:text-orange-400 transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[32px]">
                        {item.description || 'Freshly prepared canteen delicacy.'}
                      </p>
                    </div>
                  </div>

                  {/* Price & Add Action */}
                  <div className="p-5 pt-0 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Price</span>
                      <span className="text-xl font-extrabold text-orange-400">₹{item.price}</span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                        isAdded
                          ? 'bg-emerald-500 text-white'
                          : inCartItem
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 hover:bg-orange-500 hover:text-white'
                          : 'bg-orange-500 hover:bg-orange-600 text-white glow-orange hover:scale-105 active:scale-95'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>{inCartItem ? `Add More (${inCartItem.quantity})` : 'Add to Cart'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
