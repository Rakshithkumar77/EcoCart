import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowRight, ShoppingCart, Star, ShieldCheck, Truck, RefreshCw, Leaf,
  Globe, Award, Heart, HelpCircle, Trees 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// Scroll reveal observer helper hook
const useIntersectionObserver = (elementId) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const element = document.getElementById(elementId);
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(element);
      }
    }, { threshold: 0.1 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [elementId]);
  return isVisible;
};

const Home = () => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Scroll reveal visibility hooks
  const valueGridVisible = useIntersectionObserver('value-grid-section');
  const categoriesVisible = useIntersectionObserver('categories-section');
  const impactVisible = useIntersectionObserver('impact-section');
  const productsVisible = useIntersectionObserver('products-section');
  const testimonialsVisible = useIntersectionObserver('testimonials-section');
  const faqVisible = useIntersectionObserver('faq-section');
  const aboutVisible = useIntersectionObserver('about');
  const contactVisible = useIntersectionObserver('contact');

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(null);

  // Statistics counter (live counting effect on mount)
  const [stats, setStats] = useState({ bottles: 120000, trees: 14800, co2: 47600 });
  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({
        bottles: prev.bottles + Math.floor(Math.random() * 3) + 1,
        trees: prev.trees + (Math.random() > 0.8 ? 1 : 0),
        co2: prev.co2 + Math.floor(Math.random() * 2) + 1
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (location.state?.scrollToSection) {
      const sectionId = location.state.scrollToSection;
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get('/api/products?size=4&sort=rating,desc');
        setFeaturedProducts(response.data.content);
      } catch (error) {
        console.error("Error loading featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

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

  const categories = [
    { name: 'Electronics', slug: 'electronics', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&q=80' },
    { name: 'Fashion', slug: 'fashion', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80' },
    { name: 'Books', slug: 'books', img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80' },
  ];

  const faqs = [
    { q: "How do you verify products are eco-friendly?", a: "We audit our manufacturing partners and require certifications (like GOTS for organic fabrics, FSC for wood, and Cruelty-Free for cosmetics) before products are listed." },
    { q: "Where do you ship your items from?", a: "We ship from solar-powered fulfillment centers close to regional hubs to reduce transit times and carbon footprints." },
    { q: "What is carbon-neutral delivery?", a: "We calculate the carbon emissions of every delivery and purchase offset credits that fund certified reforestation and renewable energy projects." },
    { q: "What packaging materials do you use?", a: "We use 100% recycled cardboard boxes, water-activated paper tape, and biodegradable cornstarch packing peanuts that dissolve in water." }
  ];

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="space-y-28 pb-16 overflow-hidden">
      {/* 1. Hero Banner */}
      <section className="bg-gradient-to-br from-emerald-50/40 via-white to-gray-50/30 rounded-3xl border border-gray-100 p-8 md:p-12 lg:p-16 mx-4 sm:mx-6 lg:mx-8 mt-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-12 relative items-center">
        {/* Left text panel */}
        <div className="space-y-6 flex flex-col justify-center relative z-10">
          <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 font-semibold px-3 py-1 rounded-full text-xs w-fit border border-emerald-100">
            <Leaf size={12} className="animate-spin-slow" />
            <span>Summer Special Sale</span>
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
            Discover <br />
            <span className="text-emerald-700">Sustainable</span> <br />
            Value
          </h1>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-md">
            Get up to <span className="text-emerald-700 font-bold">10% off</span> on your first checkout using code <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">WELCOME10</span>. Explore premium electronics, clothing, organic skincare, and more.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl text-sm"
            >
              <span>Shop Catalog</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Right showcase image panel */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-50 rounded-full scale-95 opacity-50 filter blur-3xl -z-10" />
          <img
            src="/eco_hero_tote.png"
            alt="Think Green Canvas Bag"
            className="max-h-[350px] md:max-h-[420px] object-contain hover:scale-103 transition-transform duration-500 ease-out"
          />
        </div>
      </section>

      {/* 2. Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex items-center space-x-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Truck size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Fast Shipping</h3>
            <p className="text-gray-500 text-sm">On order aggregates above $100</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Secure Payments</h3>
            <p className="text-gray-500 text-sm">Stateless double-token encryption</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <RefreshCw size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Easy Returns</h3>
            <p className="text-gray-500 text-sm">No questions asked 30-day refund policy</p>
          </div>
        </div>
      </section>

      {/* NEW SECTION: Why Choose Us Value Proposition Grid */}
      <section
        id="value-grid-section"
        className={`transition-all duration-1000 transform ease-out ${
          valueGridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        } max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10`}
      >
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Our Core Commitments</h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">We integrate rigorous ecological standards into every step of our supply and delivery chain.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white border border-gray-100 p-6 rounded-3xl space-y-4 hover:border-emerald-100 hover:shadow-md transition-all">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl w-fit">
              <Globe size={24} />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Carbon Offsetting</h3>
            <p className="text-gray-500 text-xs leading-relaxed">We calculate the delivery footprint of every purchase and fund certified reforestation initiatives.</p>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-3xl space-y-4 hover:border-emerald-100 hover:shadow-md transition-all">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl w-fit">
              <Award size={24} />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Verified Sourcing</h3>
            <p className="text-gray-500 text-xs leading-relaxed">We screen all manufacturers for organic certifications and ethical employee wage standards.</p>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-3xl space-y-4 hover:border-emerald-100 hover:shadow-md transition-all">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl w-fit">
              <Heart size={24} />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Toxic-Free Material</h3>
            <p className="text-gray-500 text-xs leading-relaxed">All active cosmetic, beauty, and textile products are strictly cruelty-free and parabens-free.</p>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-3xl space-y-4 hover:border-emerald-100 hover:shadow-md transition-all">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl w-fit">
              <Trees size={24} />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Zero-Waste Packs</h3>
            <p className="text-gray-500 text-xs leading-relaxed">Our fulfillment packaging is 100% biodegradable and recyclable to minimize domestic landfill waste.</p>
          </div>
        </div>
      </section>

      {/* 3. Featured Categories (Scroll-reveal animated) */}
      <section
        id="categories-section"
        className={`transition-all duration-1000 transform ease-out ${
          categoriesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        } max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6`}
      >
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Browse Categories</h2>
            <p className="text-gray-500 text-sm">Select a department to explore products</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-900 shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="absolute inset-0 h-full w-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                <span className="text-white font-bold text-lg tracking-tight group-hover:text-indigo-300 transition-colors">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* NEW SECTION: Sustainability Live Impact Counters */}
      <section
        id="impact-section"
        className={`transition-all duration-1000 transform ease-out ${
          impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        } max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}
      >
        <div className="bg-emerald-900 rounded-3xl p-8 md:p-12 text-white shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(52,211,153,0.1),transparent_50%)]" />
          <div className="space-y-2 relative z-10">
            <span className="text-3xl sm:text-4xl font-extrabold block text-emerald-200">
              {stats.bottles.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-100/70 font-semibold uppercase tracking-wider">Plastic Bottles Prevented</span>
          </div>
          <div className="space-y-2 relative z-10 border-y md:border-y-0 md:border-x border-emerald-800/80 py-6 md:py-0">
            <span className="text-3xl sm:text-4xl font-extrabold block text-emerald-200">
              {stats.trees.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-100/70 font-semibold uppercase tracking-wider">Trees Planted Globally</span>
          </div>
          <div className="space-y-2 relative z-10">
            <span className="text-3xl sm:text-4xl font-extrabold block text-emerald-200">
              {stats.co2.toLocaleString()} kg
            </span>
            <span className="text-xs text-emerald-100/70 font-semibold uppercase tracking-wider">Carbon Offset Completed</span>
          </div>
        </div>
      </section>

      {/* 4. Featured / Best Sellers (Scroll-reveal animated) */}
      <section
        id="products-section"
        className={`transition-all duration-1000 transform ease-out ${
          productsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        } max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6`}
      >
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Top Rated Products</h2>
            <p className="text-gray-500 text-sm">Customer favorites based on reviews</p>
          </div>
          <Link to="/products" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => {
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
                      {/* Rating */}
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
                        className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white p-2 rounded-full transition-all focus:outline-none shadow-sm"
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* NEW SECTION: Customer Testimonials Slider */}
      <section
        id="testimonials-section"
        className={`transition-all duration-1000 transform ease-out ${
          testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        } max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10`}
      >
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Voices of Change</h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">Hear how our community is making a difference through daily choices.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center space-x-1 text-yellow-400">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} className="fill-current" />)}
            </div>
            <p className="text-gray-600 text-xs italic leading-relaxed">
              "The organic clothing pack is incredibly soft. I love the minimalist cardboard packaging and the fact that they offset delivery emissions."
            </p>
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <span className="font-bold text-gray-800 text-xs">Elena R.</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold uppercase">Verified Buyer</span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center space-x-1 text-yellow-400">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} className="fill-current" />)}
            </div>
            <p className="text-gray-600 text-xs italic leading-relaxed">
              "I purchased the professional blender and the bamboo brush set. Top-notch build and zero plastic waste! The website has a premium feel."
            </p>
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <span className="font-bold text-gray-800 text-xs">David K.</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold uppercase">Verified Buyer</span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center space-x-1 text-yellow-400">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} className="fill-current" />)}
            </div>
            <p className="text-gray-600 text-xs italic leading-relaxed">
              "Outstanding customer service. I needed to update my delivery address and support handled it in seconds. EcoCart is now my default store!"
            </p>
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <span className="font-bold text-gray-800 text-xs">Sara M.</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold uppercase">Verified Buyer</span>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION: Frequently Asked Questions (FAQ Accordion) */}
      <section
        id="faq-section"
        className={`transition-all duration-1000 transform ease-out ${
          faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        } max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8`}
      >
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center space-x-2">
            <HelpCircle className="text-indigo-650" size={28} />
            <span>Frequently Asked Questions</span>
          </h2>
          <p className="text-gray-500 text-sm">Everything you need to know about our sustainability standards.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-5 flex justify-between items-center font-bold text-gray-800 hover:bg-gray-50/50 transition-colors text-sm"
              >
                <span>{faq.q}</span>
                <span className="text-gray-400 text-base">{activeFaq === idx ? '−' : '+'}</span>
              </button>
              {activeFaq === idx && (
                <div className="p-5 pt-0 border-t border-gray-50 text-gray-500 text-xs leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. About Section (Scroll-reveal animated) */}
      <section
        id="about"
        className={`transition-all duration-1000 transform ease-out ${
          aboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        } max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 scroll-mt-20 border-t border-gray-100`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-6">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-2">
              <Leaf className="text-emerald-600" size={28} />
              <span>About EcoCart</span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              At EcoCart, we believe in high-quality, sustainable daily essentials that don't compromise on beauty, performance, or durability. We partner with ethical makers to select products that minimize environmental footprint while maximizing customer satisfaction.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Every item in our collection is carefully inspected to meet strict organic, zero-waste, or biodegradable standards. Shop with confidence knowing your purchase supports a greener planet.
            </p>
          </div>
          <div className="h-64 bg-indigo-50/50 rounded-3xl flex items-center justify-center border border-indigo-100 p-8 shadow-inner">
            <div className="text-center space-y-3">
              <ShieldCheck className="mx-auto text-indigo-600" size={48} />
              <h3 className="font-bold text-gray-900 text-lg">100% Certified Eco-Friendly</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                All products undergo verified sustainability testing before being added to our store catalog.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contact Section (Scroll-reveal animated) */}
      <section
        id="contact"
        className={`transition-all duration-1000 transform ease-out ${
          contactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        } max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 border-t border-gray-100`}
      >
        <div className="py-16 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Contact Developer</h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
            Have questions about this project, the technical architecture, or want to discuss full-stack development opportunities? Connect with me directly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-6">
            <a
              href="mailto:rakshithkumar415@gmail.com"
              className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-1 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col items-center justify-center text-center animate-hover"
            >
              <h4 className="font-bold text-gray-900 text-sm">Developer Email</h4>
              <p className="text-xs text-indigo-600 font-semibold">rakshithkumar415@gmail.com</p>
            </a>
            <a
              href="https://github.com/Rakshithkumar77"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-1 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col items-center justify-center text-center animate-hover"
            >
              <h4 className="font-bold text-gray-900 text-sm">GitHub Profile</h4>
              <p className="text-xs text-indigo-600 font-semibold">github.com/Rakshithkumar77</p>
            </a>
            <a
              href="https://linkedin.com/in/rakshith-kumar-s-b6b841300"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-1 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col items-center justify-center text-center animate-hover"
            >
              <h4 className="font-bold text-gray-900 text-sm">LinkedIn Network</h4>
              <p className="text-xs text-indigo-600 font-semibold">linkedin.com/in/rakshith-kumar-s-b6b841300</p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
