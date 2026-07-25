import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Search, SlidersHorizontal, ShoppingCart, Star, ChevronLeft, ChevronRight, X } from 'lucide-react';

const Catalog = () => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Active filter bindings from query params
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const sortParam = searchParams.get('sort') || 'createdAt,desc';
  const pageParam = parseInt(searchParams.get('page') || '0', 10);

  // Temporary local filter states for inputs
  const [localSearch, setLocalSearch] = useState(searchParam);
  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync inputs with params
  useEffect(() => {
    setLocalSearch(searchParam);
    setLocalMinPrice(minPriceParam);
    setLocalMaxPrice(maxPriceParam);
  }, [searchParam, minPriceParam, maxPriceParam]);

  // Load Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products when query params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryParam) params.append('category', categoryParam);
        if (searchParam) params.append('search', searchParam);
        if (minPriceParam) params.append('minPrice', minPriceParam);
        if (maxPriceParam) params.append('maxPrice', maxPriceParam);
        if (sortParam) params.append('sort', sortParam);
        params.append('page', pageParam.toString());
        params.append('size', '9'); // 9 items per page

        const response = await api.get(`/api/products?${params.toString()}`);
        setProducts(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } catch (err) {
        console.error("Failed to load products:", err);
        toast.error("Error loading products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryParam, searchParam, minPriceParam, maxPriceParam, sortParam, pageParam]);

  const updateFilters = (newParams) => {
    const nextParams = new URLSearchParams(searchParams);
    
    // Reset page on filter update
    nextParams.set('page', '0');

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val);
      }
    });

    setSearchParams(nextParams);
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    updateFilters({
      search: localSearch,
      minPrice: localMinPrice,
      maxPrice: localMaxPrice,
    });
    setShowMobileFilters(false);
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setSearchParams(new URLSearchParams());
    setShowMobileFilters(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('page', newPage.toString());
      setSearchParams(nextParams);
    }
  };

  const handleAddToCart = async (productId, e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Please log in to add items to your cart.");
      return;
    }
    try {
      await addToCart(productId, 1);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shop Products</h1>
          <p className="text-gray-500 text-sm">{totalElements} items found matching search filters</p>
        </div>

        {/* Sort and Filters Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 shadow-sm"
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>

          <select
            value={sortParam}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="bg-white text-gray-700 font-semibold text-sm px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 shadow-sm"
          >
            <option value="createdAt,desc">Newest Arrivals</option>
            <option value="price,asc">Price: Low to High</option>
            <option value="price,desc">Price: High to Low</option>
            <option value="rating,desc">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Sidebar Filters - Desktop */}
        <aside className="w-64 bg-white border border-gray-100 rounded-2xl p-6 space-y-8 sticky top-24 hidden md:block shadow-sm">
          {/* Categories */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Categories</h3>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => updateFilters({ category: '' })}
                className={`text-left text-sm py-1 font-medium transition-colors ${
                  !categoryParam ? 'text-indigo-600 font-semibold' : 'text-gray-500 hover:text-indigo-600'
                }`}
              >
                All Departments
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => updateFilters({ category: cat.slug })}
                  className={`text-left text-sm py-1 font-medium transition-colors pl-2 ${
                    categoryParam === cat.slug ? 'text-indigo-600 font-semibold border-l-2 border-indigo-500 pl-1.5' : 'text-gray-500 hover:text-indigo-600'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Price Form */}
          <form onSubmit={handleApplyFilters} className="space-y-6 border-t border-gray-100 pt-6">
            {/* Search */}
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Keyword</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search SKU, keyword..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 focus:bg-white text-sm"
                />
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Price Range</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  className="w-full bg-gray-50 text-gray-800 pl-3 pr-2 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
                />
                <span className="text-gray-400 text-xs">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  className="w-full bg-gray-50 text-gray-800 pl-3 pr-2 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-2 pt-2">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                Clear All
              </button>
            </div>
          </form>
        </aside>

        {/* Product Grid */}
        <main className="flex-1 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">No Products Found</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We couldn't find any products matching your active filters. Try broadening your keywords or clearing the filter values.
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-indigo-600 text-white font-bold px-6 py-2 rounded-full hover:bg-indigo-700 shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => {
                  const activePrice = prod.discountPrice || prod.price;
                  const hasDiscount = !!prod.discountPrice;
                  return (
                    <Link
                      key={prod.id}
                      to={`/products/${prod.slug}`}
                      className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full"
                    >
                      <div className="aspect-square bg-gray-50 overflow-hidden relative">
                        <img
                          src={prod.imageUrls?.[0] || 'https://picsum.photos/400/400'}
                          alt={prod.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {hasDiscount && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-sm">
                            Sale
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1 space-y-2 justify-between">
                        <div>
                          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{prod.categoryName}</span>
                          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors text-sm line-clamp-1">
                            {prod.name}
                          </h3>
                          <div className="flex items-center space-x-1 mt-1">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-semibold text-gray-700">{prod.ratingAvg || '0.0'}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <div className="flex items-baseline space-x-1.5">
                            <span className="font-bold text-gray-900 text-base">${activePrice.toFixed(2)}</span>
                            {hasDiscount && (
                              <span className="text-gray-400 line-through text-xs">${prod.price.toFixed(2)}</span>
                            )}
                          </div>
                          <button
                            onClick={(e) => handleAddToCart(prod.id, e)}
                            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white p-2 rounded-full transition-all focus:outline-none"
                          >
                            <ShoppingCart size={16} />
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 pt-6">
                  <button
                    onClick={() => handlePageChange(pageParam - 1)}
                    disabled={pageParam === 0}
                    className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm focus:outline-none"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-semibold text-gray-700">
                    Page {pageParam + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pageParam + 1)}
                    disabled={pageParam === totalPages - 1}
                    className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm focus:outline-none"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/50 backdrop-blur-sm">
          <div className="ml-auto w-80 bg-white h-full flex flex-col shadow-2xl p-6 justify-between animate-slide-in">
            <div className="space-y-8 overflow-y-auto pr-2">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Categories</h3>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => {
                      updateFilters({ category: '' });
                      setShowMobileFilters(false);
                    }}
                    className={`text-left text-sm py-1 font-medium ${
                      !categoryParam ? 'text-indigo-600 font-semibold' : 'text-gray-500'
                    }`}
                  >
                    All Departments
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => {
                        updateFilters({ category: cat.slug });
                        setShowMobileFilters(false);
                      }}
                      className={`text-left text-sm py-1 font-medium pl-2 ${
                        categoryParam === cat.slug ? 'text-indigo-600 font-semibold' : 'text-gray-500'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Price */}
              <div className="space-y-6 pt-4 border-t border-gray-100">
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Keyword</h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search SKU, name..."
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      className="w-full bg-gray-50 text-gray-800 pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm"
                    />
                    <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Price Range</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={localMinPrice}
                      onChange={(e) => setLocalMinPrice(e.target.value)}
                      className="w-full bg-gray-50 text-gray-800 px-3 py-2 rounded-xl border border-gray-200 text-sm"
                    />
                    <span className="text-gray-400">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={localMaxPrice}
                      onChange={(e) => setLocalMaxPrice(e.target.value)}
                      className="w-full bg-gray-50 text-gray-800 px-3 py-2 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-6 border-t border-gray-100">
              <button
                onClick={handleClearFilters}
                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-xl text-sm"
              >
                Clear
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
