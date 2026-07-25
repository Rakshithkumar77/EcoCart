import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Star, ShoppingCart, Heart, ShieldAlert, Award, RefreshCw, Send, ChevronRight } from 'lucide-react';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Review submission state
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [reviewPage, setReviewPage] = useState(0);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        // Fetch product details
        const response = await api.get(`/api/products/slug/${slug}`);
        const prod = response.data;
        setProduct(prod);
        setActiveImage(prod.imageUrls?.[0] || 'https://picsum.photos/400/400');

        // Fetch product reviews
        fetchReviews(prod.id, 0);

        // Fetch related products (same category)
        if (prod.categoryId) {
          const relResponse = await api.get(`/api/products?category=${prod.categoryName.toLowerCase().replace(/\s+/g, '-')}&size=4`);
          setRelatedProducts(relResponse.data.content.filter(p => p.id !== prod.id));
        }

        // Check if item is in wishlist
        if (isAuthenticated) {
          const wishResponse = await api.get('/api/wishlist');
          const isItemInWishlist = wishResponse.data.some((item) => item.productId === prod.id);
          setInWishlist(isItemInWishlist);
        }
      } catch (err) {
        console.error("Failed to load product detail:", err);
        toast.error("Product not found");
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [slug, isAuthenticated]);

  const fetchReviews = async (productId, page) => {
    try {
      const response = await api.get(`/api/products/${productId}/reviews?page=${page}&size=5`);
      setReviews(response.data.content);
      setReviewTotalPages(response.data.totalPages);
      setReviewPage(page);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.info("Please log in to add items to your wishlist.");
      return;
    }
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await api.delete(`/api/wishlist/${product.id}`);
        setInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await api.post(`/api/wishlist/${product.id}`);
        setInWishlist(true);
        toast.success("Added to wishlist!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info("Please log in to add items to your cart.");
      return;
    }
    try {
      await addToCart(product.id, quantity);
      toast.success(`${quantity} item(s) added to cart!`);
    } catch (err) {
      toast.error(err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      toast.warn("Please write a comment");
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/api/products/${product.id}/reviews`, {
        rating: ratingInput,
        comment: commentInput,
      });
      toast.success("Review submitted!");
      setCommentInput('');
      setRatingInput(5);
      // Reload reviews
      fetchReviews(product.id, 0);
      
      // Update average rating displayed
      const updatedProductResp = await api.get(`/api/products/slug/${slug}`);
      setProduct(updatedProductResp.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) return null;

  const activePrice = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice;
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity < 10;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-indigo-600">Shop</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 truncate font-medium max-w-xs">{product.name}</span>
      </div>

      {/* Main product Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Images Column */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-3xl border border-gray-100 overflow-hidden relative shadow-sm group">
            <img
              src={activeImage}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
            />
          </div>
          {/* Thumbnails */}
          {product.imageUrls && product.imageUrls.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto py-1">
              {product.imageUrls.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(url)}
                  className={`h-16 w-16 rounded-xl overflow-hidden border-2 bg-white flex-shrink-0 transition-all ${
                    activeImage === url ? 'border-indigo-500 scale-95 shadow-md' : 'border-gray-100 opacity-85 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full">{product.categoryName}</span>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">{product.name}</h1>
            
            <div className="flex items-center space-x-4">
              {/* Rating */}
              <div className="flex items-center space-x-1">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-gray-800">{product.ratingAvg || '0.0'}</span>
                <span className="text-sm text-gray-400">({reviews.length} reviews)</span>
              </div>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-gray-500 font-mono">SKU: {product.sku}</span>
            </div>
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-extrabold text-gray-900">${activePrice.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-gray-400 line-through text-base">${product.price.toFixed(2)}</span>
              )}
            </div>
            {hasDiscount && (
              <span className="bg-red-100 text-red-700 font-bold text-xs px-3 py-1 rounded-full border border-red-200">
                Discount Active
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 text-sm">Product Description</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{product.description || "No description available for this product."}</p>
          </div>

          {/* Stock status & Stepper */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-700">Availability:</span>
              {isOutOfStock ? (
                <span className="text-sm font-bold text-red-500">Out of Stock</span>
              ) : isLowStock ? (
                <span className="text-sm font-bold text-orange-500">Only {product.stockQuantity} left in stock</span>
              ) : (
                <span className="text-sm font-bold text-green-600">In Stock</span>
              )}
            </div>

            {!isOutOfStock && (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none flex justify-center items-center space-x-2"
            >
              <ShoppingCart size={18} />
              <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
            </button>

            <button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              className={`p-3.5 rounded-xl border border-gray-200 transition-all ${
                inWishlist ? 'bg-red-50 border-red-200 text-red-500 shadow-sm' : 'bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600'
              }`}
            >
              <Heart size={20} className={inWishlist ? 'fill-red-500' : ''} />
            </button>
          </div>

          {/* Quality check badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
            <div className="space-y-1.5 flex flex-col items-center">
              <Award size={18} className="text-indigo-600" />
              <span>100% Authentic</span>
            </div>
            <div className="space-y-1.5 flex flex-col items-center">
              <RefreshCw size={18} className="text-indigo-600" />
              <span>30 Day Returns</span>
            </div>
            <div className="space-y-1.5 flex flex-col items-center">
              <ShieldAlert size={18} className="text-indigo-600" />
              <span>1 Year Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="border-t border-gray-100 pt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column - Score overview and submission form */}
        <div className="lg:col-span-1 space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <div className="flex items-center space-x-2">
              <span className="text-4xl font-extrabold text-gray-900">{product.ratingAvg || '0.0'}</span>
              <div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      className={s <= Math.round(product.ratingAvg || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Based on ratings</p>
              </div>
            </div>
          </div>

          {/* Write a Review */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitReview} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">Write a Customer Review</h3>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Your Rating</label>
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRatingInput(s)}
                      className="focus:outline-none"
                    >
                      <Star
                        size={22}
                        className={s <= ratingInput ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Review Message</label>
                <textarea
                  rows="4"
                  placeholder="What did you like or dislike? How was the quality?"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex justify-center items-center space-x-1.5 focus:outline-none shadow-sm"
              >
                <Send size={14} />
                <span>Submit Review</span>
              </button>
            </form>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center space-y-3">
              <p className="text-sm text-gray-500">Only logged-in customers who have purchased this product can leave a review.</p>
              <Link to="/login" className="inline-block bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white font-bold text-xs px-4 py-2 rounded-full transition-all">
                Sign In to Review
              </Link>
            </div>
          )}
        </div>

        {/* Right Column - Reviews list */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-gray-900 text-base">Shopper Feedback ({reviews.length})</h3>
          
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No reviews has been written for this product yet. Be the first to share your experience!</p>
          ) : (
            <div className="space-y-6 divide-y divide-gray-100">
              {reviews.map((rev) => (
                <div key={rev.id} className="pt-6 first:pt-0 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-gray-800">{rev.userName}</span>
                    <span className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Rating Stars */}
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className={s <= rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed font-normal">{rev.comment}</p>
                </div>
              ))}

              {/* Review pagination */}
              {reviewTotalPages > 1 && (
                <div className="flex space-x-2 pt-6">
                  {Array.from({ length: reviewTotalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => fetchReviews(product.id, idx)}
                      className={`h-8 w-8 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${
                        reviewPage === idx ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-gray-100 pt-16 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
            <p className="text-gray-500 text-sm">Customers also browsed these items</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => {
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
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(prod.id, 1);
                          toast.success("Added to cart!");
                        }}
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
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
