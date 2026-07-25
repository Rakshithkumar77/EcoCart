import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { CreditCard, Truck, ClipboardList, CheckCircle, Plus, MapPin } from 'lucide-react';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(4, 'Zip code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().min(7, 'Phone number is required'),
});

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart, fetchCart } = useCart();

  // Redirect state
  const couponCode = location.state?.couponCode || '';
  const discountAmount = location.state?.discountAmount || 0;

  // Checkout steps & states
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review, 4: Confirmation
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [orderResult, setOrderResult] = useState(null);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const {
    register: addressRegister,
    handleSubmit: handleAddressSubmit,
    reset: resetAddressForm,
    formState: { errors: addressErrors },
  } = useForm({
    resolver: zodResolver(addressSchema),
  });

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/api/addresses');
      setAddresses(response.data);
      if (response.data.length > 0) {
        // Pre-select default address
        const def = response.data.find((a) => a.default) || response.data[0];
        setSelectedAddressId(def.id);
      }
    } catch (err) {
      console.error("Failed to load addresses:", err);
    }
  };

  useEffect(() => {
    if (!cart.items || cart.items.length === 0) {
      navigate('/cart');
      return;
    }
    fetchAddresses();
  }, [cart]);

  const handleAddNewAddress = async (data) => {
    setAddressLoading(true);
    try {
      const response = await api.post('/api/addresses', { ...data, default: addresses.length === 0 });
      toast.success("Address added!");
      setShowAddressForm(false);
      resetAddressForm();
      // Reload and set as selected
      await fetchAddresses();
      setSelectedAddressId(response.data.id);
    } catch (err) {
      toast.error("Failed to add address");
    } finally {
      setAddressLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.warn("Please select a shipping address");
      return;
    }
    setCheckoutLoading(true);
    try {
      const response = await api.post('/api/orders/checkout', {
        addressId: selectedAddressId,
        paymentMethod: paymentMethod === 'CARD' ? 'Credit Card (Mock)' : 'Cash on Delivery',
        couponCode: couponCode || null,
      });
      setOrderResult(response.data);
      // Synchronize cart state on context
      await fetchCart();
      setStep(4);
      toast.success("Order placed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const subtotal = cart.totalAmount || 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal - discountAmount + shipping;

  if (step === 4 && orderResult) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center space-y-6">
        <div className="p-4 bg-green-50 text-green-600 rounded-full animate-bounce">
          <CheckCircle size={56} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Thank You for Your Order!</h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Your purchase was completed successfully. Your order tracking number is:
          </p>
          <span className="inline-block bg-indigo-50 text-indigo-700 font-mono font-bold text-lg px-4 py-1.5 rounded-xl border border-primary-200 mt-2">
            {orderResult.orderNumber}
          </span>
        </div>
        <div className="flex space-x-4 pt-4">
          <Link to="/account/orders" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-full transition-colors shadow-sm text-sm">
            View Order Status
          </Link>
          <Link to="/" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-full transition-colors text-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Wizard steps */}
      <div className="flex items-center justify-center space-x-4 sm:space-x-8 max-w-lg mx-auto border-b border-gray-100 pb-6 text-sm">
        <button
          onClick={() => setStep(1)}
          className={`flex items-center space-x-2 font-semibold ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>1</span>
          <span className="hidden sm:inline">Address</span>
        </button>
        <span className="text-gray-300">/</span>
        <button
          onClick={() => { if (selectedAddressId) setStep(2); }}
          className={`flex items-center space-x-2 font-semibold ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>2</span>
          <span className="hidden sm:inline">Payment</span>
        </button>
        <span className="text-gray-300">/</span>
        <button
          onClick={() => { if (selectedAddressId) setStep(3); }}
          className={`flex items-center space-x-2 font-semibold ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>3</span>
          <span className="hidden sm:inline">Review</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Step details panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: ADDRESS SELECTION */}
          {step === 1 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-lg flex items-center">
                  <Truck className="mr-2 text-indigo-600" size={20} />
                  <span>Shipping Address</span>
                </h3>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-indigo-600 hover:text-indigo-700 font-bold text-sm flex items-center space-x-1"
                  >
                    <Plus size={16} />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {showAddressForm ? (
                <form onSubmit={handleAddressSubmit(handleAddNewAddress)} className="space-y-4 border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Full Name</label>
                      <input type="text" {...addressRegister('fullName')} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                      {addressErrors.fullName && <p className="text-xs text-red-500">{addressErrors.fullName.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Phone</label>
                      <input type="text" {...addressRegister('phone')} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                      {addressErrors.phone && <p className="text-xs text-red-500">{addressErrors.phone.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Street Address</label>
                    <input type="text" {...addressRegister('street')} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                    {addressErrors.street && <p className="text-xs text-red-500">{addressErrors.street.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1 col-span-1">
                      <label className="text-xs font-semibold text-gray-600">City</label>
                      <input type="text" {...addressRegister('city')} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                      {addressErrors.city && <p className="text-xs text-red-500">{addressErrors.city.message}</p>}
                    </div>
                    <div className="space-y-1 col-span-1">
                      <label className="text-xs font-semibold text-gray-600">State</label>
                      <input type="text" {...addressRegister('state')} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                      {addressErrors.state && <p className="text-xs text-red-500">{addressErrors.state.message}</p>}
                    </div>
                    <div className="space-y-1 col-span-1">
                      <label className="text-xs font-semibold text-gray-600">Zip Code</label>
                      <input type="text" {...addressRegister('zip')} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                      {addressErrors.zip && <p className="text-xs text-red-500">{addressErrors.zip.message}</p>}
                    </div>
                    <div className="space-y-1 col-span-1">
                      <label className="text-xs font-semibold text-gray-600">Country</label>
                      <input type="text" {...addressRegister('country')} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                      {addressErrors.country && <p className="text-xs text-red-500">{addressErrors.country.message}</p>}
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addressLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl text-sm"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              ) : addresses.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  <MapPin className="mx-auto text-gray-300 mb-2" size={32} />
                  <p>You have no saved addresses. Please click "Add New" to write your shipping destination.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between h-36 ${
                        selectedAddressId === addr.id
                          ? 'border-indigo-500 bg-indigo-50/20 shadow-sm'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-gray-900 text-sm block">{addr.fullName}</span>
                        <span className="text-gray-500 text-xs block leading-tight">{addr.street}</span>
                        <span className="text-gray-500 text-xs block">{addr.city}, {addr.state} - {addr.zip}</span>
                        <span className="text-gray-500 text-xs block">{addr.country}</span>
                      </div>
                      <div className="flex justify-between items-center w-full pt-2">
                        <span className="text-gray-400 text-xs">{addr.phone}</span>
                        {addr.isDefault && (
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Default</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {addresses.length > 0 && !showAddressForm && (
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm focus:outline-none"
                >
                  Continue to Payment
                </button>
              )}
            </div>
          )}

          {/* STEP 2: PAYMENT METHOD */}
          {step === 2 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-gray-900 text-lg flex items-center">
                <CreditCard className="mr-2 text-indigo-600" size={20} />
                <span>Payment Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('CARD')}
                  className={`text-left p-5 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'CARD' ? 'border-indigo-500 bg-indigo-50/20 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <span className="font-bold text-gray-900 text-sm block">Credit / Debit Card</span>
                  <span className="text-gray-500 text-xs block mt-1">Visa, Mastercard, AMEX (Mock Gateway)</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('COD')}
                  className={`text-left p-5 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'COD' ? 'border-indigo-500 bg-indigo-50/20 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <span className="font-bold text-gray-900 text-sm block">Cash on Delivery</span>
                  <span className="text-gray-500 text-xs block mt-1">Pay with cash when package is delivered</span>
                </button>
              </div>

              {paymentMethod === 'CARD' && (
                <div className="space-y-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Card Number</label>
                    <input type="text" placeholder="4111 2222 3333 4444" defaultValue="4111222233334444" disabled className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none text-gray-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Expiry Date</label>
                      <input type="text" placeholder="MM/YY" defaultValue="12/28" disabled className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none text-gray-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">CVV</label>
                      <input type="password" placeholder="•••" defaultValue="123" disabled className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none text-gray-500" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER REVIEW */}
          {step === 3 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-gray-900 text-lg flex items-center">
                <ClipboardList className="mr-2 text-indigo-600" size={20} />
                <span>Review Order Details</span>
              </h3>

              <div className="divide-y divide-gray-100">
                {/* Shipping Review */}
                <div className="py-4 first:pt-0 space-y-1">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shipping Destination</h4>
                  {selectedAddress && (
                    <div className="text-sm font-semibold text-gray-800">
                      <p>{selectedAddress.fullName}</p>
                      <p className="text-gray-500 font-normal">{selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zip}</p>
                    </div>
                  )}
                </div>

                {/* Payment Review */}
                <div className="py-4 space-y-1">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Method</h4>
                  <p className="text-sm font-semibold text-gray-800">
                    {paymentMethod === 'CARD' ? 'Credit Card (Mock Payment Gateway)' : 'Cash on Delivery'}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={checkoutLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none flex justify-center items-center"
                >
                  {checkoutLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-gray-900 text-base">Purchase Summary</h3>

          {/* Cart items summary */}
          <div className="space-y-3 overflow-y-auto max-h-60 pr-2 border-b border-gray-100 pb-4">
            {cart.items.map((item) => {
              const activePrice = item.discountPrice || item.productPrice;
              return (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-xs font-mono">{item.quantity}x</span>
                    <span className="text-gray-700 font-medium truncate max-w-xs">{item.productName}</span>
                  </div>
                  <span className="font-semibold text-gray-900">${(activePrice * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 text-sm border-b border-gray-100 pb-4 text-gray-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            {couponCode && (
              <div className="flex justify-between text-red-600 font-medium">
                <span>Coupon ({couponCode})</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-gray-900">
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-2">
            <span className="font-bold text-gray-900 text-sm">Final Amount</span>
            <span className="font-extrabold text-lg text-indigo-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
