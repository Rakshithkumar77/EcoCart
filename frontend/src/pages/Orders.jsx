import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AccountSidebar } from './Profile';
import { toast } from 'react-toastify';
import { AlertCircle, ShoppingBag, Calendar, Truck, FileText, XCircle } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Selected order details state (modal)
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchOrders = async (pageNumber = 0) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/orders?page=${pageNumber}&size=8`);
      setOrders(response.data.content);
      setTotalPages(response.data.totalPages);
      setPage(pageNumber);
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(0);
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const response = await api.put(`/api/orders/${orderId}/cancel`);
      toast.success("Order cancelled successfully!");
      // If modal is open, update selected order
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(response.data);
      }
      // Reload order list
      fetchOrders(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    }
  };

  const openOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      setSelectedOrder(response.data);
      setModalOpen(true);
    } catch (err) {
      toast.error("Failed to load order details");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SHIPPED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DELIVERED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <AccountSidebar activeTab="orders" />

        <main className="flex-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order History</h2>
            <p className="text-gray-500 text-sm">Review your past orders and their shipping status.</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-gray-50 border border-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-4 max-w-sm mx-auto">
              <ShoppingBag className="mx-auto text-gray-300" size={40} />
              <p className="text-sm">You haven't placed any orders yet. Once you complete a purchase, your order history will appear here.</p>
              <Link to="/products" className="inline-block bg-indigo-600 text-white font-bold text-xs px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-200 transition-colors shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-gray-900 text-base">{ord.orderNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusColor(ord.status)}`}>
                        {ord.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 font-medium">
                      <span className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <FileText size={12} className="mr-1" />
                        {ord.items?.length || 0} Item(s)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                    <span className="font-extrabold text-gray-900 text-base sm:text-lg">
                      ${ord.totalAmount.toFixed(2)}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openOrderDetails(ord.id)}
                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                      >
                        Details
                      </button>
                      {ord.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelOrder(ord.id)}
                          className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center space-x-1"
                        >
                          <XCircle size={12} />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Paging */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2 pt-4">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => fetchOrders(idx)}
                      className={`h-8 w-8 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${
                        page === idx ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Order Details Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">Order Details</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                Close
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-gray-100 pb-6">
                {/* Shipping Details */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shipping To</h4>
                  <p className="font-bold text-gray-800">{selectedOrder.shippingAddress?.fullName}</p>
                  <p className="text-gray-500 text-xs leading-normal">{selectedOrder.shippingAddress?.street}</p>
                  <p className="text-gray-500 text-xs">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.zip}</p>
                  <p className="text-gray-500 text-xs">{selectedOrder.shippingAddress?.country}</p>
                  <p className="text-gray-400 text-xs pt-1">{selectedOrder.shippingAddress?.phone}</p>
                </div>

                {/* Transaction Details */}
                <div className="space-y-2">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Status</h4>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase mt-1 ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Method</h4>
                    <p className="font-semibold text-gray-800 text-xs">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Status</h4>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase mt-1 ${
                      selectedOrder.paymentStatus === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Purchased Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                          <img src={item.imageUrl || 'https://picsum.photos/100/100'} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-xs">{item.productName}</p>
                          <p className="text-gray-400 text-[10px] mt-0.5 font-mono">{item.quantity}x @ ${item.priceAtPurchase.toFixed(2)}</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">${(item.quantity * item.priceAtPurchase).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-baseline space-x-2">
                <span className="text-gray-500 text-xs font-semibold">Total Paid:</span>
                <span className="font-extrabold text-lg text-indigo-600">${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex space-x-2">
                {selectedOrder.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                  >
                    Cancel Order
                  </button>
                )}
                <button
                  onClick={() => setModalOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-xl text-xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
