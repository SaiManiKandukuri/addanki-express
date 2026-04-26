"use client";

import { useAppStore, Product } from "@/store/useStore";
import { ArrowLeft, Star, PowerOff, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function StoreMenu({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const merchantId = unwrappedParams.id;
  
  const merchants = useAppStore(state => state.merchants);
  const merchant = merchants.find(m => m.id === merchantId);
  const allProducts = useAppStore(state => state.products).filter(p => p.merchantId === merchantId);
  const cart = useAppStore(state => state.cart);
  const addToCart = useAppStore(state => state.addToCart);
  const removeFromCart = useAppStore(state => state.removeFromCart);

  const categories = Array.from(new Set(allProducts.map(p => p.category)));
  const [activeCategory, setActiveCategory] = useState("");
  const [flyingItem, setFlyingItem] = useState<{ id: string, x: number, y: number } | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) setActiveCategory(categories[0]);
  }, [categories, activeCategory]);

  const displayProducts = activeCategory ? allProducts.filter(p => p.category === activeCategory) : allProducts;

  const handleAdd = (e: React.MouseEvent, p: Product) => {
    if (merchant?.isOffline) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setFlyingItem({ id: Math.random().toString(), x: rect.left, y: rect.top });
    setTimeout(() => setFlyingItem(null), 700);
    addToCart(p);
  };

  if (!merchant) return <div className="p-4 font-bold">Store not found</div>;

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="min-h-screen bg-[var(--color-softcream)] max-w-md mx-auto flex flex-col pt-safe relative"
    >
      <AnimatePresence>
        {flyingItem && (
          <motion.div
            initial={{ top: flyingItem.y, left: flyingItem.x, scale: 1, opacity: 1 }}
            animate={{ top: window.innerHeight - 80, left: window.innerWidth / 2 - 20, scale: 0.1, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed w-10 h-10 bg-[var(--color-primary)] rounded-full z-[100] shadow-xl shadow-green-500/50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <div className="bg-white p-5 pt-8 pb-8 shadow-sm z-20 relative sticky top-0 border-b border-gray-100">
        <Link href="/customer" className="inline-block mb-4 p-2.5 bg-gray-50 text-gray-600 rounded-full active:scale-95 transition-transform shrink-0 border border-gray-200">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{merchant.name}</h1>
            <div className="flex items-center space-x-3 mt-3">
              <span className="flex items-center text-xs font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
                <Star size={12} className="mr-1 fill-current" /> {merchant.rating}
              </span>
              {merchant.isOffline ? (
                <span className="flex items-center text-xs font-black uppercase tracking-widest text-red-500 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                  <PowerOff size={10} className="mr-1" /> Currently Closed
                </span>
              ) : (
                <span className="flex items-center text-xs font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                  Open taking orders
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative z-0">
        {/* Left Rail Categories */}
        <div className="w-24 bg-gray-50 overflow-y-auto border-r border-gray-100 pb-24 z-10 shrink-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full text-center px-2 py-5 text-[10px] font-black uppercase tracking-widest border-l-4 transition-all ${
                activeCategory === cat 
                  ? "bg-white border-[var(--color-primary)] text-[var(--color-primary)] shadow-[2px_0_10px_rgba(0,0,0,0.03)]" 
                  : "border-transparent text-gray-400 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Listing */}
        <div className="flex-1 overflow-y-auto bg-white p-4 pb-28 relative">
          {merchant.isOffline && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 pointer-events-none flex items-center justify-center overflow-hidden">
               <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl transform rotate-[-5deg] border border-gray-100 font-extrabold text-red-500 uppercase tracking-widest font-mono text-center">
                  STORE CLOSED<br/>TRY TOMORROW
               </div>
            </div>
          )}

          <h2 className="font-extrabold text-2xl mb-6 text-gray-800 tracking-tight">{activeCategory}</h2>
          <div className="space-y-6">
            {displayProducts.map(product => {
              const cartItem = cart.find(c => c.id === product.id);
              const qty = cartItem ? cartItem.quantity : 0;
              
              return (
                <div key={product.id} className={`flex items-start border-b border-gray-50 pb-6 ${!product.inStock ? 'opacity-50 grayscale' : ''}`}>
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100 mr-4 flex items-center justify-center text-gray-300">
                     {product.photoUrl ? (
                         <img src={product.photoUrl} className="w-full h-full object-cover"/>
                     ) : (
                         <ImageIcon size={24} />
                     )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-extrabold text-gray-900 leading-tight">{product.name}</h3>
                    {product.description && <p className="text-xs text-gray-500 font-medium mt-1 leading-snug">{product.description}</p>}
                    <div className="flex justify-between items-end mt-2">
                       <div>
                         <div className="flex items-center space-x-2">
                           <p className="text-[var(--color-primary)] font-black text-lg tracking-tight">₹{product.price}</p>
                           {product.mrp && product.mrp > product.price && (
                             <p className="text-gray-400 font-bold text-xs line-through">₹{product.mrp}</p>
                           )}
                         </div>
                         {!product.inStock && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1">Out of stock</p>}
                       </div>

                       <div className="flex-shrink-0 z-30">
                         {qty === 0 ? (
                           <button
                             onClick={(e) => handleAdd(e, product)}
                             disabled={!product.inStock || merchant.isOffline}
                             className={`font-black uppercase tracking-widest text-xs px-6 py-2.5 rounded-xl shadow-sm transition-all w-24 text-center ${
                               product.inStock && !merchant.isOffline
                                 ? "bg-green-50 text-[var(--color-primary)] hover:shadow-md active:scale-95 border border-green-100" 
                                 : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                             }`}
                           >
                             ADD
                           </button>
                         ) : (
                           <div className="flex items-center justify-between bg-[var(--color-primary)] text-white w-24 px-2 py-2 rounded-xl shadow-[0_4px_12px_rgba(34,139,34,0.3)] font-black">
                             <button onClick={() => removeFromCart(product.id)} className="w-6 text-center text-lg active:scale-75 transition-transform">-</button>
                             <span>{qty}</span>
                             <button onClick={(e) => handleAdd(e, product)} className="w-6 text-center text-lg active:scale-75 transition-transform">+</button>
                           </div>
                         )}
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
