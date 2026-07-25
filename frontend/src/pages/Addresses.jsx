import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AccountSidebar } from './Profile';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { MapPin, Plus, Trash2, Home, CheckCircle2 } from 'lucide-react';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(4, 'Zip code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().min(7, 'Phone number is required'),
  isDefault: z.boolean().optional(),
});

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      isDefault: false,
    }
  });

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/addresses');
      setAddresses(response.data);
    } catch (err) {
      console.error("Failed to load addresses:", err);
      toast.error("Failed to load address book");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleCreateAddress = async (data) => {
    setFormLoading(true);
    try {
      await api.post('/api/addresses', {
        ...data,
        default: data.isDefault || addresses.length === 0,
      });
      toast.success("Address added successfully!");
      setShowForm(false);
      reset();
      fetchAddresses();
    } catch (err) {
      toast.error("Failed to save address");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.delete(`/api/addresses/${addressId}`);
      toast.success("Address deleted successfully");
      fetchAddresses();
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (address) => {
    try {
      await api.put(`/api/addresses/${address.id}`, {
        fullName: address.fullName,
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
        phone: address.phone,
        isDefault: true,
      });
      toast.success("Default address updated!");
      fetchAddresses();
    } catch (err) {
      toast.error("Failed to update default address");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <AccountSidebar activeTab="addresses" />

        <main className="flex-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Address Book</h2>
              <p className="text-gray-500 text-sm font-normal">Manage your shipping destinations and billing defaults.</p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>Add Address</span>
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleSubmit(handleCreateAddress)} className="space-y-4 bg-gray-50/50 border border-gray-150 rounded-2xl p-5 shadow-inner">
              <h3 className="font-bold text-gray-900 text-sm">Add a New Address</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Full Name</label>
                  <input type="text" {...register('fullName')} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                  {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Phone</label>
                  <input type="text" {...register('phone')} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Street Address</label>
                <input type="text" {...register('street')} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                {errors.street && <p className="text-xs text-red-500">{errors.street.message}</p>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-semibold text-gray-600">City</label>
                  <input type="text" {...register('city')} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                  {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-semibold text-gray-600">State</label>
                  <input type="text" {...register('state')} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                  {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-semibold text-gray-600">Zip Code</label>
                  <input type="text" {...register('zip')} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                  {errors.zip && <p className="text-xs text-red-500">{errors.zip.message}</p>}
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-semibold text-gray-600">Country</label>
                  <input type="text" {...register('country')} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                  {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
                </div>
              </div>

              {/* Set as default checkbox */}
              <div className="flex items-center space-x-2 pt-1.5">
                <input type="checkbox" id="isDefault" {...register('isDefault')} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                <label htmlFor="isDefault" className="text-xs font-semibold text-gray-600">Set as default shipping address</label>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); reset(); }}
                  className="bg-gray-250 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl text-sm shadow-sm"
                >
                  {formLoading ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-gray-50 border border-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-3 max-w-sm mx-auto">
              <MapPin className="mx-auto text-gray-300" size={36} />
              <p className="text-sm">You have no saved addresses. Add your shipping location details to make checkout quick and easy.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-2xl border-2 flex flex-col justify-between h-40 transition-all ${
                    addr.isDefault
                      ? 'border-indigo-500 bg-indigo-50/10 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-gray-100'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-gray-900 text-sm">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="bg-indigo-100 text-indigo-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Default</span>
                      )}
                    </div>
                    <span className="text-gray-500 text-xs block leading-tight">{addr.street}</span>
                    <span className="text-gray-500 text-xs block">{addr.city}, {addr.state} - {addr.zip}</span>
                    <span className="text-gray-500 text-xs block">{addr.country}</span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-50 w-full mt-2 text-xs">
                    <span className="text-gray-400">{addr.phone}</span>
                    
                    <div className="flex space-x-1">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr)}
                          className="text-[10px] bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 font-semibold px-2 py-1 rounded-lg transition-colors"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Addresses;
