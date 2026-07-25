import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, Search, Heart, LogOut, Settings, ChevronDown, Menu, X, Leaf } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollToSection: sectionId } });
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
              <Leaf className="text-indigo-600 h-6 w-6" />
              <span className="text-2xl font-bold text-gray-900 tracking-tight">EcoCart</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8 hidden md:flex items-center">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm"
              />
              <button type="submit" className="absolute left-3 top-2.5 text-gray-400 hover:text-indigo-600 transition-colors">
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium text-sm transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-gray-600 hover:text-indigo-600 font-medium text-sm transition-colors">
              Shop
            </Link>
            <button
              onClick={() => handleNavClick('about')}
              className="text-gray-600 hover:text-indigo-600 font-medium text-sm transition-colors cursor-pointer bg-transparent border-0"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-gray-600 hover:text-indigo-600 font-medium text-sm transition-colors cursor-pointer bg-transparent border-0"
            >
              Contact
            </button>
            
            {isAuthenticated && (
              <Link to="/account/wishlist" className="text-gray-600 hover:text-indigo-600 transition-colors relative">
                <Heart size={20} />
              </Link>
            )}

            {/* Cart Icon */}
            <Link to="/cart" className="text-gray-600 hover:text-indigo-600 transition-colors relative">
              <ShoppingBag size={20} />
              {cart?.totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white font-bold text-xs rounded-full h-5 w-5 flex items-center justify-center border border-white">
                  {cart.totalQuantity}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors font-medium text-sm focus:outline-none"
                >
                  <User size={18} />
                  <span>{user.name}</span>
                  <ChevronDown size={14} className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings size={16} className="mr-2 text-gray-400" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} className="mr-2 text-gray-400" />
                      My Profile
                    </Link>
                    <Link
                      to="/account/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ShoppingBag size={16} className="mr-2 text-gray-400" />
                      Order History
                    </Link>
                    <hr className="border-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                      <LogOut size={16} className="mr-2 text-red-400" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 font-medium text-sm px-3 py-1.5 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white font-medium text-sm px-4 py-2 rounded-full hover:bg-indigo-700 shadow-sm transition-all hover:shadow-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-indigo-600 focus:outline-none p-1"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-2 shadow-inner">
          <form onSubmit={handleSearch} className="relative my-2">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none text-sm"
            />
            <button type="submit" className="absolute left-3 top-2.5 text-gray-400">
              <Search size={18} />
            </button>
          </form>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
          >
            Shop All Products
          </Link>
          <button
            onClick={() => { setMobileMenuOpen(false); handleNavClick('about'); }}
            className="w-full text-left block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors bg-transparent border-0 cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); handleNavClick('contact'); }}
            className="w-full text-left block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors bg-transparent border-0 cursor-pointer"
          >
            Contact
          </button>

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
              >
                My Profile
              </Link>
              <Link
                to="/account/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
              >
                Order History
              </Link>
              <Link
                to="/account/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
              >
                My Wishlist
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
              >
                Shopping Cart ({cart.totalQuantity})
              </Link>
              <hr className="border-gray-100 my-2" />
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-indigo-600 text-white font-medium text-base px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
