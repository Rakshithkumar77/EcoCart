import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AccountSidebar } from './Profile';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/wishlist');
      setWishlist(response.data);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await api.delete(`/api/wishlist/${productId}`);
      toast.success("Removed from wishlist");
      // filter locally
      setWishlist(wishlist.filter(item => item.productId !== productId));
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <AccountSidebar activeTab="wishlist" />

        <main className="flex-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Wishlist</h2>
            <p className="text-gray-500 text-sm">Products you've saved for future consideration.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 bg-gray-50 border border-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : wishlist.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-4 max-w-sm mx-auto">
              <Heart className="mx-auto text-gray-300" size={40} />
              <p className="text-sm">Your wishlist is currently empty. Start exploring our categories and save items you like!</p>
              <Link to="/products" className="inline-block bg-indigo-600 text-white font-bold text-xs px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wishlist.map((item) => {
                const activePrice = item.discountPrice || item.productPrice;
                const hasDiscount = !!item.discountPrice;
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-gray-200 transition-colors shadow-sm"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="h-16 w-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.imageUrl || 'https://picsum.photos/200/200'} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <Link to={`/products/${item.productSlug}`} className="font-bold text-gray-900 hover:text-indigo-600 text-sm line-clamp-1 block">
                          {item.productName}
                        </Link>
                        <div className="flex items-baseline space-x-2">
                          <span className="font-bold text-gray-900 text-xs sm:text-sm">${activePrice.toFixed(2)}</span>
                          {hasDiscount && (
                            <span className="text-gray-400 line-through text-[10px]">${item.productPrice.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-1 flex-shrink-0">
                      <button
                        onClick={() => handleAddToCart(item.productId)}
                        className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white p-2 rounded-xl transition-all focus:outline-none shadow-sm"
                      >
                        <ShoppingCart size={14} />
                      </button>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.productId)}
                        className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white p-2 rounded-xl transition-all focus:outline-none"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Wishlist;
