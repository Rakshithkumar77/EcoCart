import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { AdminSidebar } from './AdminDashboard';
import { toast } from 'react-toastify';
import { Users, Mail, Phone, Calendar } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (pageNumber = 0) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/admin/users?page=${pageNumber}&size=12`);
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
      setPage(pageNumber);
    } catch (err) {
      toast.error("Failed to load users list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(0);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Console</h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AdminSidebar activeTab="users" />

        <main className="flex-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 w-full">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manage Users</h2>
            <p className="text-gray-500 text-sm">View registered store customer and administrator profiles.</p>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-gray-100 rounded-xl" />
              <div className="h-28 bg-gray-50 rounded-xl" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center py-6 text-gray-400 text-sm">No users registered.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-3">User ID</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((usr) => (
                    <tr key={usr.id} className="text-gray-700 hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 pl-3 font-mono">{usr.id}</td>
                      <td className="py-3.5 font-bold text-sm text-gray-900">{usr.name}</td>
                      <td className="py-3.5 flex items-center space-x-1.5">
                        <Mail size={12} className="text-gray-400" />
                        <span>{usr.email}</span>
                      </td>
                      <td className="py-3.5">
                        {usr.phone ? (
                          <span className="flex items-center space-x-1.5">
                            <Phone size={12} className="text-gray-400" />
                            <span>{usr.phone}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                          usr.role === 'ROLE_ADMIN' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-indigo-50 text-indigo-700 border-primary-200'
                        }`}>
                          {usr.role === 'ROLE_ADMIN' ? 'Admin' : 'Customer'}
                        </span>
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
                  onClick={() => fetchUsers(idx)}
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
        </div>
      );
    };

    export default ManageUsers;
