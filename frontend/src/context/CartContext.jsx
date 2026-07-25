import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalQuantity: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response = await api.get('/api/cart');
      setCart(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart({ items: [], totalQuantity: 0, totalAmount: 0 });
    }
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error("Please log in to add items to your cart.");
    }
    try {
      const response = await api.post('/api/cart/items', { productId, quantity });
      setCart(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to add item to cart.";
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const response = await api.put(`/api/cart/items/${itemId}?quantity=${quantity}`);
      setCart(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to update quantity.";
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await api.delete(`/api/cart/items/${itemId}`);
      setCart(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to remove item.";
    }
  };

  const clearCart = async () => {
    try {
      const response = await api.delete('/api/cart');
      setCart(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to clear cart.";
    }
  };

  const value = {
    cart,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
