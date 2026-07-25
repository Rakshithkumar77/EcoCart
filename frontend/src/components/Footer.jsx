import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Leaf className="text-emerald-600 h-5 w-5" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">EcoCart</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Your one-stop destination for high-quality electronics, fashion, beauty, home goods, and books. Curated responsibly for sustainable value.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/products" className="hover:text-indigo-600 transition-colors">All Products</Link></li>
              <li><Link to="/products?category=electronics" className="hover:text-indigo-600 transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=fashion" className="hover:text-indigo-600 transition-colors">Fashion</Link></li>
              <li><Link to="/products?category=home-kitchen" className="hover:text-indigo-600 transition-colors">Home & Kitchen</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Stay Connected</h4>
            <p className="text-gray-500 text-sm">Subscribe to our newsletter to receive updates, access to exclusive deals, and more.</p>
            <form className="flex space-x-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-50 text-gray-800 placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm flex-1"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <hr className="border-gray-100 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} EcoCart Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
