import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { AdminSidebar } from './AdminDashboard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { Plus, Trash2, FolderTree, AlertCircle } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().optional(),
  parentCategoryId: z.preprocess((val) => (val === '' ? null : Number(val)), z.number().nullable().optional()),
});

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data);

      // Flatten hierarchical categories for simple list table and parent selector
      const list = [];
      const traverse = (cat, depth = 0) => {
        list.push({ id: cat.id, name: '— '.repeat(depth) + cat.name, rawName: cat.name, slug: cat.slug, parentName: cat.parentCategoryName || 'None' });
        if (cat.subCategories) {
          cat.subCategories.forEach((sub) => traverse(sub, depth + 1));
        }
      };
      response.data.forEach((cat) => traverse(cat, 0));
      setFlatCategories(list);
    } catch (err) {
      toast.error("Failed to load categories list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (data) => {
    setFormSubmitLoading(true);
    try {
      await api.post('/api/categories', data);
      toast.success("Category created successfully!");
      reset();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? All subcategories will also be deleted.")) return;
    try {
      await api.delete(`/api/categories/${id}`);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Console</h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AdminSidebar activeTab="categories" />

        <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 items-start w-full">
          {/* Create Category Form */}
          <div className="md:col-span-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <FolderTree className="mr-2 text-indigo-600" size={18} />
              <span>Create Category</span>
            </h2>
            <hr className="border-gray-50" />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-650">Category Name</label>
                <input type="text" {...register('name')} placeholder="e.g. Shoes" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-650">Parent Category</label>
                <select {...register('parentCategoryId')} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none">
                  <option value="">None (Set as Root)</option>
                  {flatCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-650">Description</label>
                <textarea rows="3" {...register('description')} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none" />
              </div>

              <button
                type="submit"
                disabled={formSubmitLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex justify-center items-center shadow-sm"
              >
                {formSubmitLoading ? 'Saving...' : 'Add Category'}
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="md:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manage Categories</h2>
              <p className="text-gray-500 text-sm">View or delete store department categories.</p>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-28 bg-gray-50 rounded-xl" />
              </div>
            ) : flatCategories.length === 0 ? (
              <p className="text-center py-6 text-gray-400 text-sm">No categories created yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3 pl-3">Department Category</th>
                      <th className="pb-3">Slug</th>
                      <th className="pb-3">Parent</th>
                      <th className="pb-3 text-right pr-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {flatCategories.map((c) => (
                      <tr key={c.id} className="text-gray-700 hover:bg-gray-50 transition-colors">
                        <td className="py-3 pl-3 font-semibold text-sm">{c.name}</td>
                        <td className="py-3 font-mono">{c.slug}</td>
                        <td className="py-3 text-gray-400">{c.parentName}</td>
                        <td className="py-3 text-right pr-3">
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
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

export default ManageCategories;
