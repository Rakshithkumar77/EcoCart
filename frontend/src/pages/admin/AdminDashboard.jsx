import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { LayoutDashboard, ShoppingBag, FolderTree, ClipboardCheck, Users, BarChart3, AlertTriangle, ArrowRight, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';

export const AdminSidebar = ({ activeTab }) => {
  return (
    <div className="w-full lg:w-64 bg-white border border-gray-100 rounded-2xl p-4 flex flex-row lg:flex-col lg:space-y-1 overflow-x-auto lg:overflow-x-visible gap-2 lg:gap-0 shadow-sm">
      <Link
        to="/admin"
        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-2 whitespace-nowrap ${
          activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <LayoutDashboard size={16} />
        <span>Dashboard</span>
      </Link>
      <Link
        to="/admin/products"
        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-2 whitespace-nowrap ${
          activeTab === 'products' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <ShoppingBag size={16} />
        <span>Products CRUD</span>
      </Link>
      <Link
        to="/admin/categories"
        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-2 whitespace-nowrap ${
          activeTab === 'categories' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <FolderTree size={16} />
        <span>Categories</span>
      </Link>
      <Link
        to="/admin/orders"
        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-2 whitespace-nowrap ${
          activeTab === 'orders' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <ClipboardCheck size={16} />
        <span>Orders Manager</span>
      </Link>
      <Link
        to="/admin/users"
        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-2 whitespace-nowrap ${
          activeTab === 'users' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Users size={16} />
        <span>Users List</span>
      </Link>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/admin/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
        toast.error("Error loading dashboard metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  // Mock sales data for Recharts chart
  const salesChartData = [
    { name: 'Mon', sales: (stats.totalRevenue * 0.1) },
    { name: 'Tue', sales: (stats.totalRevenue * 0.15) },
    { name: 'Wed', sales: (stats.totalRevenue * 0.08) },
    { name: 'Thu', sales: (stats.totalRevenue * 0.22) },
    { name: 'Fri', sales: (stats.totalRevenue * 0.18) },
    { name: 'Sat', sales: (stats.totalRevenue * 0.12) },
    { name: 'Sun', sales: (stats.totalRevenue * 0.15) },
  ];

  const statCards = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Orders Placed', value: stats.totalOrders, icon: ClipboardCheck, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Products', value: stats.totalProducts, icon: ShoppingBag, color: 'text-purple-600 bg-purple-50' },
    { label: 'Store Users', value: stats.totalUsers, icon: Users, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Console</h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AdminSidebar activeTab="dashboard" />

        <main className="flex-1 space-y-8 w-full">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((c, i) => (
              <div key={i} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${c.color} hidden sm:block`}>
                  <c.icon size={22} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{c.label}</span>
                  <p className="font-extrabold text-gray-800 text-lg sm:text-xl">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Chart */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center">
                <BarChart3 className="mr-2 text-indigo-600" size={16} />
                <span>Sales Flow This Week</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} formatter={(v) => [`$${v.toFixed(2)}`, 'Sales']} />
                    <Bar dataKey="sales" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center text-orange-600">
                  <AlertTriangle className="mr-2" size={16} />
                  <span>Low Inventory Alerts</span>
                </h3>
                {stats.lowStockProducts?.length === 0 ? (
                  <p className="text-gray-400 text-xs italic">All product stocks are healthy.</p>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-52">
                    {stats.lowStockProducts?.map((p) => (
                      <div key={p.id} className="flex justify-between items-center text-xs">
                        <span className="text-gray-700 font-semibold truncate max-w-[150px]">{p.name}</span>
                        <span className="font-mono text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                          {p.stockQuantity} Left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Link to="/admin/products" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 mt-4">
                <span>Refill Stocks</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Recent Orders</h3>
            {stats.recentOrders?.length === 0 ? (
              <p className="text-gray-400 text-xs italic">No orders logged in database.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                      <th className="pb-3">Order Code</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.recentOrders?.map((ord) => (
                      <tr key={ord.id} className="text-gray-700 hover:bg-gray-50 transition-colors">
                        <td className="py-3 font-semibold font-mono">{ord.orderNumber}</td>
                        <td className="py-3 font-bold">${ord.totalAmount.toFixed(2)}</td>
                        <td className="py-3">{ord.paymentMethod}</td>
                        <td className="py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                            ord.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                            ord.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            ord.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400">{new Date(ord.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
