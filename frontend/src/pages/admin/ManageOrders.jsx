import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { AdminSidebar } from './AdminDashboard';
import { toast } from 'react-toastify';
import { Search, Calendar, FileText, XCircle, ClipboardCheck, Edit3 } from 'lucide-react';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Detail Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const fetchOrders = async (pageNumber = 0, status = statusFilter) => {
    setLoading(true);
    try {
      const url = status
        ? `/api/admin/orders?status=${status}&page=${pageNumber}&size=10`
        : `/api/admin/orders?page=${pageNumber}&size=10`;
      const response = await api.get(url);
      setOrders(response.data.content);
      setTotalPages(response.data.totalPages);
      setPage(pageNumber);
    } catch (err) {
      toast.error("Failed to load store orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(0, statusFilter);
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatusId(orderId);
    try {
      const response = await api.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success("Order status updated successfully!");
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(response.data);
      }
      fetchOrders(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const openOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      setSelectedOrder(response.data);
      setModalOpen(true);
    } catch (err) {
      toast.error("Failed to fetch order details");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-250';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-250';
      case 'SHIPPED':
        return 'bg-purple-50 text-purple-700 border-purple-250';
      case 'DELIVERED':
        return 'bg-green-50 text-green-700 border-green-250';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-250';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-250';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Console</h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AdminSidebar activeTab="orders" />

        <main className="flex-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manage Orders</h2>
              <p className="text-gray-500 text-sm">Fulfill orders and update shipping states.</p>
            </div>

            {/* Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none"
            >
              <option value="">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-gray-100 rounded-xl" />
              <div className="h-28 bg-gray-50 rounded-xl" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-center py-6 text-gray-400 text-sm">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-3">Order Number</th>
                    <th className="pb-3">Total Amount</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Order Date</th>
                    <th className="pb-3 text-right pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="text-gray-700 hover:bg-gray-50 transition-colors">
                      <td className="py-3 pl-3 font-semibold font-mono">{ord.orderNumber}</td>
                      <td className="py-3 font-bold">${ord.totalAmount.toFixed(2)}</td>
                      <td className="py-3">
                        <span className="block font-medium">{ord.paymentMethod}</span>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5">{ord.paymentStatus}</span>
                      </td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusColor(ord.status)}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-450">{new Date(ord.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-right pr-3 space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openOrderDetails(ord.id)}
                          className="bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          Details
                        </button>
                        
                        {/* Inline status update select */}
                        <select
                          value={ord.status}
                          disabled={updatingStatusId === ord.id || ord.status === 'CANCELLED' || ord.status === 'DELIVERED'}
                          onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-1 text-[10px] font-semibold text-gray-650 cursor-pointer disabled:opacity-50"
                        >
                          <option value="PENDING" disabled>Pending</option>
                          <option value="CONFIRMED">Confirm</option>
                          <option value="SHIPPED">Ship</option>
                          <option value="DELIVERED">Deliver</option>
                          <option value="CANCELLED">Cancel</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
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
        </main>
      </div>

      {/* Details Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">Admin Order details</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">Close</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-gray-100 pb-6">
                {/* Shipping Details */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shipping To</h4>
                  <p className="font-bold text-gray-800">{selectedOrder.shippingAddress?.fullName}</p>
                  <p className="text-gray-500 text-xs leading-normal">{selectedOrder.shippingAddress?.street}</p>
                  <p className="text-gray-500 text-xs">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.zip}</p>
                  <p className="text-gray-500 text-xs">{selectedOrder.shippingAddress?.country}</p>
                  <p className="text-gray-450 text-xs pt-1">{selectedOrder.shippingAddress?.phone}</p>
                </div>

                {/* Transaction details */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Modify Order Status</h4>
                    <select
                      value={selectedOrder.status}
                      disabled={selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'DELIVERED'}
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-705 focus:outline-none"
                    >
                      <option value="PENDING" disabled>Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
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
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Items</h4>
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

            <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-baseline space-x-2">
                <span className="text-gray-500 text-xs font-semibold">Total Revenue:</span>
                <span className="font-extrabold text-lg text-indigo-600">${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
              <button onClick={() => setModalOpen(false)} className="bg-gray-250 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-xl text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
