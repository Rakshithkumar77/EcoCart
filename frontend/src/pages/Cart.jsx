import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { Trash2, ShoppingBag, ArrowRight, Tag, Percent } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, updateQuantity, removeFromCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponType, setCouponType] = useState(null); // PERCENT or FLAT
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [applying, setApplying] = useState(false);

  const handleUpdateQty = async (itemId, currentQty, amount) => {
    const nextQty = currentQty + amount;
    if (nextQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    try {
      await updateQuantity(itemId, nextQty);
    } catch (err) {
      toast.error(err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success("Item removed from cart");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    try {
      const response = await api.get(`/api/products`); // dummy check/just standard coupon validation
      // Validate coupon against mock backend endpoint since checkout API applies it.
      // We call coupon endpoint if we had one, but we can also just let the coupon validation
      // run at backend during order checkout. Let's provide a mock validation locally for UX!
      const code = couponCode.trim().toUpperCase();
      if (code === 'WELCOME10') {
        if (cart.totalAmount < 50) {
          toast.warn("WELCOME10 requires a minimum order of $50");
        } else {
          setCouponDiscount(10);
          setCouponType('PERCENT');
          setAppliedCoupon(code);
          toast.success("Coupon WELCOME10 applied successfully (10% discount)!");
        }
      } else if (code === 'FLAT50') {
        if (cart.totalAmount < 200) {
          toast.warn("FLAT50 requires a minimum order of $200");
        } else {
          setCouponDiscount(50);
          setCouponType('FLAT');
          setAppliedCoupon(code);
          toast.success("Coupon FLAT50 applied successfully ($50.00 discount)!");
        }
      } else {
        toast.error("Invalid coupon code");
      }
    } catch (err) {
      toast.error("Failed to apply coupon");
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponType(null);
    setAppliedCoupon('');
    toast.info("Coupon removed");
  };

  const calculateTotals = () => {
    const subtotal = cart.totalAmount || 0;
    let discount = 0;
    if (appliedCoupon) {
      if (couponType === 'PERCENT') {
        discount = (subtotal * couponDiscount) / 100;
      } else if (couponType === 'FLAT') {
        discount = couponDiscount;
      }
    }
    const shipping = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
    const total = subtotal - discount + shipping;
    return {
      subtotal,
      discount,
      shipping,
      total: total < 0 ? 0 : total,
    };
  };

  const totals = calculateTotals();

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      toast.info("Please log in to proceed to checkout");
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout', {
      state: {
        couponCode: appliedCoupon,
        discountAmount: totals.discount,
      },
    });
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center space-y-6">
        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
          <ShoppingBag size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
          <p className="text-gray-500 text-sm max-w-sm">Looks like you haven't added anything to your cart yet. Explore our departments to start shopping!</p>
        </div>
        <Link to="/products" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-full shadow-md transition-colors inline-block">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const activePrice = item.discountPrice || item.productPrice;
            const hasDiscount = !!item.discountPrice;
            return (
              <div
                key={item.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="h-20 w-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.imageUrl || 'https://picsum.photos/200/200'} alt={item.productName} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <Link to={`/products/${item.productSlug}`} className="font-bold text-gray-900 hover:text-indigo-600 text-sm sm:text-base line-clamp-1">
                      {item.productName}
                    </Link>
                    <p className="text-xs text-gray-400 font-mono">SKU: {item.productSku}</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="font-bold text-gray-900 text-sm">${activePrice.toFixed(2)}</span>
                      {hasDiscount && (
                        <span className="text-gray-400 line-through text-xs">${item.productPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                  {/* Stepper */}
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => handleUpdateQty(item.id, item.quantity, -1)}
                      className="px-2.5 py-1 hover:bg-gray-50 text-gray-600 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-sm font-bold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQty(item.id, item.quantity, 1)}
                      className="px-2.5 py-1 hover:bg-gray-50 text-gray-600 font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total & Remove */}
                  <div className="flex items-center space-x-4">
                    <span className="font-extrabold text-gray-900 text-sm sm:text-base w-20 text-right">
                      ${(activePrice * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors focus:outline-none"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 text-base">Order Summary</h3>
            
            <div className="space-y-3 text-sm border-b border-gray-100 pb-4">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal ({cart.totalQuantity} items)</span>
                <span className="font-semibold text-gray-900">${totals.subtotal.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-red-600 font-medium">
                  <span className="flex items-center">
                    <Percent size={14} className="mr-1" />
                    Discount ({appliedCoupon})
                  </span>
                  <span>-${totals.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-500">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-gray-900">
                  {totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="font-bold text-gray-900 text-base">Order Total</span>
              <span className="font-extrabold text-gray-900 text-2xl text-indigo-600">${totals.total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none flex justify-center items-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Coupon Code Panel */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-gray-900 text-sm flex items-center">
              <Tag size={16} className="mr-2 text-indigo-600" />
              <span>Apply Promo Code</span>
            </h4>
            
            {appliedCoupon ? (
              <div className="bg-indigo-50 text-indigo-800 p-3 rounded-xl border border-primary-200 flex justify-between items-center text-sm font-semibold">
                <span>Coupon '{appliedCoupon}' Active</span>
                <button onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:text-red-700 focus:outline-none underline">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="WELCOME10 / FLAT50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-gray-50 text-gray-800 placeholder-gray-400 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 focus:bg-white text-sm flex-1 font-mono uppercase"
                />
                <button
                  type="submit"
                  disabled={applying || !couponCode.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors shadow-sm focus:outline-none"
                >
                  Apply
                </button>
              </form>
            )}
            <p className="text-gray-400 text-xs leading-normal">
              Try <span className="font-mono text-gray-500">WELCOME10</span> (10% off on orders above $50) or <span className="font-mono text-gray-500">FLAT50</span> ($50 off on orders above $200).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
