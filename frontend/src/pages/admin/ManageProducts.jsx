import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { AdminSidebar } from './AdminDashboard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, X, Search, SlidersHorizontal } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(3, 'SKU is required'),
  price: z.preprocess((val) => Number(val), z.number().positive('Price must be a positive number')),
  discountPrice: z.preprocess((val) => (val === '' ? null : Number(val)), z.number().positive('Discount price must be positive').nullable().optional()),
  stockQuantity: z.preprocess((val) => Number(val), z.number().int().min(0, 'Stock cannot be negative')),
  categoryId: z.preprocess((val) => Number(val), z.number().positive('Select a valid category')),
  description: z.string().optional(),
  imageUrl: z.string().url('Must be a valid image URL').or(z.literal('')),
});

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Get all active/inactive items (Admin gets large page size for simplicity, or we filter)
      const response = await api.get('/api/products?size=100'); // get products list
      setProducts(response.data.content);
    } catch (err) {
      toast.error("Failed to load products list");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      // Flatten hierarchical categories for simple dropdown options
      const list = [];
      const traverse = (cat, depth = 0) => {
        list.push({ id: cat.id, name: '— '.repeat(depth) + cat.name });
        if (cat.subCategories) {
          cat.subCategories.forEach((sub) => traverse(sub, depth + 1));
        }
      };
      response.data.forEach((cat) => traverse(cat, 0));
      setCategories(list);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    reset({
      name: '',
      sku: '',
      price: '',
      discountPrice: '',
      stockQuantity: '',
      categoryId: '',
      description: '',
      imageUrl: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    reset({
      name: prod.name,
      sku: prod.sku,
      price: prod.price,
      discountPrice: prod.discountPrice || '',
      stockQuantity: prod.stockQuantity,
      categoryId: prod.categoryId,
      description: prod.description || '',
      imageUrl: prod.imageUrls?.[0] || '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setFormSubmitLoading(true);
    try {
      const payload = {
        name: data.name,
        sku: data.sku,
        price: data.price,
        discountPrice: data.discountPrice || null,
        stockQuantity: data.stockQuantity,
        categoryId: data.categoryId,
        description: data.description,
        imageUrls: data.imageUrl ? [data.imageUrl] : [],
      };

      if (editingProduct) {
        await api.put(`/api/products/${editingProduct.id}`, payload);
        toast.success("Product updated successfully!");
      } else {
        await api.post('/api/products', payload);
        toast.success("Product created successfully!");
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this product? It will no longer show in the public store.")) return;
    try {
      await api.delete(`/api/products/${id}`);
      toast.success("Product deactivated successfully");
      fetchProducts();
    } catch (err) {
      toast.error("Failed to deactivate product");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Console</h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AdminSidebar activeTab="products" />

        <main className="flex-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 w-full">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manage Products</h2>
              <p className="text-gray-500 text-sm">Add, modify, or archive inventory products.</p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center space-x-1.5 focus:outline-none shadow-sm"
            >
              <Plus size={14} />
              <span>Create Product</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-sm">
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-gray-100 rounded-xl" />
              <div className="h-32 bg-gray-50 rounded-xl" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center py-6 text-gray-400 text-sm">No products found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-3">Image</th>
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Stock</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="text-gray-700 hover:bg-gray-50 transition-colors">
                      <td className="py-3 pl-3">
                        <div className="h-10 w-10 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                          <img src={prod.imageUrls?.[0] || 'https://picsum.photos/100/100'} alt="" className="h-full w-full object-cover" />
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-sm">{prod.name}</td>
                      <td className="py-3 font-mono">{prod.sku}</td>
                      <td className="py-3 font-semibold">${prod.price.toFixed(2)}</td>
                      <td className="py-3 font-medium">
                        <span className={prod.stockQuantity < 10 ? 'text-red-500 font-bold' : ''}>
                          {prod.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                          prod.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {prod.active ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-3 space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        {prod.active && (
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* CREATE/EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-extrabold text-gray-900 text-lg">
                {editingProduct ? 'Edit Product' : 'Create Product'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Product Name</label>
                  <input type="text" {...register('name')} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">SKU Code</label>
                  <input type="text" {...register('sku')} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none font-mono" />
                  {errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Price ($)</label>
                  <input type="text" {...register('price')} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                  {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Discount Price ($)</label>
                  <input type="text" {...register('discountPrice')} placeholder="Optional" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                  {errors.discountPrice && <p className="text-xs text-red-500">{errors.discountPrice.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Stock Qty</label>
                  <input type="number" {...register('stockQuantity')} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                  {errors.stockQuantity && <p className="text-xs text-red-500">{errors.stockQuantity.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Category</label>
                  <select {...register('categoryId')} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none">
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Image URL</label>
                  <input type="text" placeholder="https://..." {...register('imageUrl')} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none" />
                  {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Description</label>
                <textarea rows="4" {...register('description')} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none" />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex justify-center items-center shadow-sm"
                >
                  {formSubmitLoading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
