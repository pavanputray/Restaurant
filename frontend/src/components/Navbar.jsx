import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, UtensilsCrossed, User as UserIcon, LogOut, Shield, Clock } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg glow-orange group-hover:scale-105 transition-transform duration-300">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-orange-400 bg-clip-text text-transparent">
              AparnaDevi Canteen
            </span>
            <span className="block text-xs font-semibold text-orange-400 uppercase tracking-widest">
              Hostel Canteen
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-4">
          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-medium transition-all group"
          >
            <ShoppingBag className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-orange-500 text-white rounded-full glow-orange animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'customer' && (
                <Link
                  to="/my-orders"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-sm font-medium transition-colors"
                >
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="hidden sm:inline">My Orders</span>
                </Link>
              )}

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-semibold transition-colors"
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-orange-400 font-semibold">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-200">{user.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 rounded-xl shadow-lg glow-orange transition-all hover:scale-105 active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
