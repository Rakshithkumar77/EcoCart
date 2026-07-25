import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ShoppingBag, Heart, MapPin, Mail, Phone, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AccountSidebar = ({ activeTab }) => {
  return (
    <div className="w-full md:w-64 bg-white border border-gray-100 rounded-2xl p-4 flex flex-row md:flex-col md:space-y-1 overflow-x-auto md:overflow-x-visible gap-2 md:gap-0 shadow-sm">
      <Link
        to="/account"
        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-2 whitespace-nowrap ${
          activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <User size={16} />
        <span>Profile Info</span>
      </Link>
      <Link
        to="/account/orders"
        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-2 whitespace-nowrap ${
          activeTab === 'orders' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <ShoppingBag size={16} />
        <span>Order History</span>
      </Link>
      <Link
        to="/account/wishlist"
        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-2 whitespace-nowrap ${
          activeTab === 'wishlist' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Heart size={16} />
        <span>Wishlist</span>
      </Link>
      <Link
        to="/account/addresses"
        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-2 whitespace-nowrap ${
          activeTab === 'addresses' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <MapPin size={16} />
        <span>Address Book</span>
      </Link>
    </div>
  );
};

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <AccountSidebar activeTab="profile" />

        <main className="flex-1 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
            <p className="text-gray-500 text-sm">Review your registration details and access levels.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            {/* Name */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gray-50 text-gray-400 rounded-xl">
                <User size={20} />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Full Name</span>
                <p className="font-bold text-gray-800 text-base">{user.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gray-50 text-gray-400 rounded-xl">
                <Mail size={20} />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email Address</span>
                <p className="font-bold text-gray-800 text-base">{user.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gray-50 text-gray-400 rounded-xl">
                <Phone size={20} />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Phone Number</span>
                <p className="font-bold text-gray-800 text-base">{user.phone || 'Not provided'}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gray-50 text-gray-400 rounded-xl">
                <Shield size={20} />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Account Role</span>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                    user.role === 'ROLE_ADMIN' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-indigo-50 text-indigo-700 border border-primary-200'
                  }`}>
                    {user.role === 'ROLE_ADMIN' ? 'Administrator' : 'Customer'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
