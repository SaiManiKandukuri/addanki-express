"use client";

import { useAppStore, Product, Merchant } from "@/store/useStore";
import { Search, MapPin, ChevronRight, Star, Clock, Truck, ShoppingBag, PowerOff, Sparkles, X, Image as ImageIcon, HeadphonesIcon, LogOut, User, Globe, Phone, MessageCircle, ShoppingCart, History, Plus, Box } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomerHome() {
  const merchants = useAppStore(state => state.merchants);
  const products = useAppStore(state => state.products);
  const orders = useAppStore(state => state.orders);
  const cart = useAppStore(state => state.cart);
  const banners = useAppStore(state => state.banners);
  const categories = useAppStore(state => state.categories);
  const addToCart = useAppStore(state => state.addToCart);
  const setRole = useAppStore(state => state.setRole);
  
  const isTelugu = useAppStore(state => state.isTelugu);
  const toggleLanguage = useAppStore(state => state.toggleLanguage);
  const customerProfile = useAppStore(state => state.customerProfile);
  const updateCustomerProfile = useAppStore(state => state.updateCustomerProfile);

  const t = (en: string, te: string) => isTelugu ? te : en;

  const [location] = useState("RTC Bus Stand, Addanki");
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  

  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'DENIED' && o.status !== 'CANCELLED' && o.status !== 'RETURN_REQUESTED');
  const pastOrders = orders.filter(o => o.status === 'DELIVERED').reverse().slice(0, 3);

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const isSearching = normalizedQuery.length > 0 || selectedCategory !== null;

  let matchedMerchants: Merchant[] = [];
  let matchedProducts: Product[] = [];

  if (selectedCategory) {
     const cat = categories.find(c => c.name === selectedCategory);
     if (cat) {
        matchedProducts = products.filter(p => cat.productIds.includes(p.id));
     } else {
        matchedProducts = products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
     }
  } else if (normalizedQuery.length > 0) {
     matchedMerchants = merchants.filter(m => m.name.toLowerCase().includes(normalizedQuery));
     matchedProducts = products.filter(p => p.name.toLowerCase().includes(normalizedQuery));
  }

  if (!mounted) return <div className="min-h-screen bg-[var(--color-softcream)] animate-pulse" />;

  return (
    <div className="min-h-screen bg-[#F3F4F6] space-y-6 max-w-md mx-auto relative">
      {/* ====== Branded Header ====== */}
      <div className="bg-white/70 backdrop-blur-3xl sticky top-0 z-30 pt-4 pb-4 px-5 border-b border-white shadow-sm flex flex-col space-y-4">
        <div className="flex justify-between items-center w-full relative">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 tracking-tight leading-none">Addanki <span className="text-[var(--color-primary)]">Mart</span></h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("Quick Commerce", "క్విక్ కామర్స్")}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
             <button onClick={toggleLanguage} className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-600 rounded-xl font-bold border border-gray-100 hover:text-[var(--color-primary)] hover:border-green-100 transition-colors shadow-sm active:scale-95 text-lg">
                {isTelugu ? 'A' : 'అ'}
             </button>
             <button onClick={() => setShowProfile(true)} className="w-10 h-10 flex items-center justify-center bg-green-50 text-[var(--color-primary)] rounded-xl font-bold border border-green-100/50 shadow-sm active:scale-95">
                <User size={18} />
             </button>
          </div>
        </div>

        {/* Delivery address bar */}
        <button onClick={() => setShowProfile(true)} className="flex items-center space-x-2 bg-green-50/50 border border-green-100/50 rounded-xl px-3 py-2 w-full text-left">
          <MapPin size={14} className="text-[var(--color-primary)] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-extrabold text-[var(--color-primary)] uppercase tracking-widest">{t("Delivering to", "ఇక్కడకి డెలివరీ")}</p>
            <p className="text-sm font-bold text-gray-900 truncate">{customerProfile.deliveryAddress || customerProfile.name}</p>
          </div>
          <ChevronRight size={14} className="text-gray-400 shrink-0" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="relative flex-1 group cursor-text" onClick={() => setIsSearchOpen(true)}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={18} />
            </div>
            <input 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder={t("Search for 'Pizza'", "వెతకండి...")}
               className="flex items-center w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none transition-colors text-sm"
            />
          </div>
          <div className="flex flex-col items-center shrink-0">
             <div className="text-[8px] font-black uppercase text-gray-400 mb-0.5 tracking-tighter">Veg</div>
             <div className="w-10 h-5 bg-gray-200 rounded-full relative p-1 cursor-pointer">
                <div className="w-3 h-3 bg-white rounded-full shadow-sm border border-gray-300 flex items-center justify-center">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                </div>
             </div>
          </div>
        </div>
        
        {selectedCategory && (
           <div className="flex items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2">Filtering by:</span>
              <div className="flex items-center bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-green-500/20 active:scale-95 cursor-pointer" onClick={() => setSelectedCategory(null)}>
                 {selectedCategory} <X size={14} className="ml-1" />
              </div>
           </div>
        )}
      </div>

      <div className="px-5 space-y-8">
        <div className="space-y-8">
            {banners.length > 0 && (
               <div className="relative w-full -mx-5 px-5">
                  <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar space-x-4 pb-4">
                     {banners.map(banner => (
                        <div key={banner.id} className="snap-center shrink-0 w-[85%] h-40 relative rounded-[2rem] overflow-hidden shadow-lg border border-gray-100">
                           <img src={banner.photoUrl} className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {pastOrders.length > 0 && !isSearching && (
               <div>
                  <h2 className="text-lg font-black text-gray-900 mb-4 tracking-tight">{t("Buy Again", "మళ్లీ కొనండి")}</h2>
                  <div className="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar">
                     {pastOrders[0].items.map(item => (
                        <div key={item.id} className="w-[140px] shrink-0 bg-white border border-gray-100 rounded-3xl p-3 shadow-sm flex flex-col justify-between group active:scale-95 transition-transform">
                           <div className="h-24 bg-gray-50 rounded-2xl mb-3 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:shadow-inner transition-all">
                              {item.photoUrl ? <img src={item.photoUrl} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-gray-300"/>}
                           </div>
                           <div>
                              <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                              <p className="text-sm font-black text-[var(--color-primary)] mt-1">₹{item.price}</p>
                           </div>
                           <button onClick={() => addToCart(item)} className="mt-3 w-full bg-gradient-to-r from-green-50 to-emerald-50 text-[var(--color-primary)] border border-green-100 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl hover:bg-green-100 transition-colors shadow-sm">+ Add</button>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {!isSearching && (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h2 className="text-sm font-black text-gray-900 tracking-tight uppercase">{t("What's on your mind?", "మీ మనస్సులో ఏముంది?")}</h2>
                  <button className="text-[10px] font-bold text-[var(--color-primary)] flex items-center uppercase tracking-widest">
                     {t("See All", "అన్నీ చూడండి")} <ChevronRight size={14} className="ml-0.5"/>
                  </button>
                </div>
                <div className="flex overflow-x-auto space-x-6 pb-2 hide-scrollbar items-start">
                  {categories.filter(c => c.type === 'category' || !c.type).map((c) => (
                    <div key={c.id} onClick={() => { setSelectedCategory(c.name); setIsSearchOpen(true); }} className="flex flex-col items-center shrink-0 cursor-pointer group active:scale-95 transition-transform space-y-2">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-sm border border-gray-100 bg-white group-hover:scale-105 transition-all overflow-hidden`}>
                        {c.photoUrl ? <img src={c.photoUrl} className="w-full h-full object-cover" /> : <div className="text-2xl">📦</div>}
                      </div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight text-center w-16 leading-tight">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
              {/* ====== Sections (Big Cards) ====== */}
              {!isSearching && categories.filter(c => c.type === 'section').sort((a,b) => a.displayOrder - b.displayOrder).map((section) => {
                const sectionProducts = products.filter(p => section.productIds.includes(p.id));
                if (sectionProducts.length === 0) return null;
                
                return (
                  <div key={section.id} className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center space-x-2">
                        <h2 className="text-xl font-black text-gray-800 tracking-tight">{section.name}</h2>
                        {section.name.toLowerCase().includes('99') && (
                           <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center text-[10px] font-bold text-gray-400">₹</div>
                        )}
                      </div>
                      <button className="text-xs font-bold text-pink-500 flex items-center">
                         {t("See All", "అన్నీ")} <ChevronRight size={14} className="ml-0.5"/>
                      </button>
                    </div>
                    <div className="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar snap-x">
                      {sectionProducts.map((product) => {
                         const merchant = merchants.find(m => m.id === product.merchantId);
                         return (
                          <div key={product.id} className="w-56 shrink-0 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden snap-start group relative">
                            <div className="h-40 bg-gray-50 relative m-2 rounded-[1.8rem] overflow-hidden">
                              {product.photoUrl ? (
                                <img src={product.photoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-200"><Box size={32} /></div>
                              )}
                              
                              {/* Popular Tag */}
                              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-green-700 text-[9px] font-black px-2 py-1 rounded-full flex items-center shadow-sm">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                POPULAR
                              </div>

                              {/* Add Button Overlay */}
                              <button 
                                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                className="absolute bottom-3 right-3 w-10 h-10 bg-white text-pink-500 rounded-2xl flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all shadow-lg active:scale-90"
                              >
                                <Plus size={20} strokeWidth={3} />
                              </button>
                            </div>
                            
                            <div className="px-5 pb-5 pt-2">
                              <div className="flex items-center space-x-1 mb-1">
                                 <div className="w-3 h-3 border border-green-600 flex items-center justify-center p-0.5">
                                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                                 </div>
                                 <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{product.name}</h3>
                              </div>
                              
                              <p className="text-[10px] font-medium text-gray-400">by {merchant?.name || 'Unknown'}</p>
                              
                              <div className="flex items-center space-x-3 mt-2">
                                <div className="flex items-center bg-green-50 px-1.5 py-0.5 rounded text-[10px] font-bold text-green-700">
                                  <Star size={10} className="fill-green-700 mr-0.5" /> {merchant?.rating || '4.0'}
                                </div>
                                <span className="text-[10px] font-bold text-gray-400">{merchant?.deliveryTime || '30-40'} mins</span>
                              </div>
                              
                              <div className="mt-2">
                                <span className="font-black text-sm text-gray-900">₹{product.price}</span>
                                {product.mrp && product.mrp > product.price && (
                                  <span className="text-[10px] text-gray-400 line-through ml-2">₹{product.mrp}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

            {!isSearching && (
              <div className="space-y-4">
                <h2 className="text-lg font-black text-gray-900 tracking-tight">{t("Popular Brands", "ప్రముఖ బ్రాండ్లు")}</h2>
                <div className="flex overflow-x-auto space-x-6 pb-2 hide-scrollbar">
                  {merchants.slice(0, 5).map((m, idx) => (
                    <div key={idx} className="flex flex-col items-center shrink-0 space-y-2">
                       <div className="w-20 h-20 rounded-full bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
                          <div className="text-2xl font-black text-[var(--color-primary)]">{m.name.charAt(0)}</div>
                       </div>
                       <span className="text-[10px] font-bold text-gray-800 text-center w-20 truncate">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex overflow-x-auto space-x-2 pb-2 hide-scrollbar">
               <button className="shrink-0 bg-white border border-gray-200 px-4 py-2 rounded-full text-xs font-bold text-gray-700 shadow-sm flex items-center">
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                  Filter
               </button>
               <button className="shrink-0 bg-white border border-gray-200 px-4 py-2 rounded-full text-xs font-bold text-gray-700 shadow-sm">₹49 & under</button>
               <button className="shrink-0 bg-white border border-gray-200 px-4 py-2 rounded-full text-xs font-bold text-gray-700 shadow-sm">₹49 - ₹99</button>
               <button className="shrink-0 bg-white border border-gray-200 px-4 py-2 rounded-full text-xs font-bold text-gray-700 shadow-sm">Delivery under 30 mins</button>
            </div>

            <div>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                   {isSearching ? t("Search Results", "శోధన ఫలితాలు") : t("Explore all restaurants", "అన్ని రెస్టారెంట్లు")}
                </h2>
              </div>
              
              {isSearching && matchedMerchants.length === 0 && matchedProducts.length === 0 ? (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-10 text-center border border-gray-100 shadow-sm mt-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-gray-200">
                       <Search size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Nothing found</h3>
                    <p className="text-sm font-medium text-gray-500 mb-8 px-4">We searched all across Addanki, but couldn't find any stores or items matching your request.</p>
                    <button onClick={() => { setSearchQuery(""); setSelectedCategory(null); setIsSearchOpen(false); }} className="bg-gray-900 text-white font-bold px-8 py-4 rounded-2xl text-sm uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-gray-900/20">Clear Search</button>
                 </motion.div>
              ) : (
                <div className="space-y-4">
                  {isSearching && matchedProducts.length > 0 && (
                     <div className="mb-6 grid grid-cols-2 gap-3">
                        {matchedProducts.map(item => (
                           <div key={item.id} className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
                             <div className="h-24 bg-gray-50 rounded-2xl mb-3 flex items-center justify-center overflow-hidden border border-gray-100">
                                {item.photoUrl ? <img src={item.photoUrl} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-gray-300"/>}
                             </div>
                             <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                             <p className="text-sm font-black text-[var(--color-primary)] mt-1">₹{item.price}</p>
                             <button onClick={() => addToCart(item)} className="mt-3 w-full bg-green-50 text-[var(--color-primary)] text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl active:scale-95">+ Add</button>
                          </div>
                        ))}
                     </div>
                  )}
                  {(isSearching ? matchedMerchants : merchants).map(merchant => {
                    const merchantProducts = products.filter(p => p.merchantId === merchant.id).slice(0, 3);
                    return (
                    <div key={merchant.id}>
                      {merchant.isOffline ? (
                         <div className="block bg-white border border-gray-100 rounded-2xl p-4 shadow-sm opacity-60 grayscale cursor-not-allowed relative overflow-hidden">
                            <div className="flex items-start">
                              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl font-black text-gray-400">{merchant.name.charAt(0)}</div>
                              <div className="ml-4 flex-1">
                                <h3 className="font-extrabold text-lg text-gray-900 tracking-tight">{merchant.name}</h3>
                                <p className="text-xs font-medium text-gray-500">Currently Offline</p>
                              </div>
                            </div>
                         </div>
                      ) : (
                        <div className="block bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden space-y-4">
                          <Link href={`/customer/store/${merchant.id}`} className="flex items-center justify-between group">
                            <div className="flex-1">
                              <div className="inline-block border border-pink-200 text-pink-500 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm mb-2">
                                Lowest Price Guaranteed
                              </div>
                              <div className="flex items-center">
                                <h3 className="font-extrabold text-xl text-gray-900 tracking-tight group-hover:text-[var(--color-primary)] transition-colors">{merchant.name}</h3>
                                <ChevronRight size={20} className="ml-1 text-gray-400" />
                              </div>
                              <div className="flex items-center space-x-3 mt-1 text-[10px] font-bold text-gray-500">
                                <span className="flex items-center text-[#FFD700]">
                                  <Star size={12} className="mr-0.5 fill-current" /> {merchant.rating}
                                </span>
                                <span>•</span>
                                <span>{merchant.deliveryTime}</span>
                                <span>•</span>
                                <span className="truncate max-w-[120px]">Chinese, Indian, Snacks</span>
                              </div>
                            </div>
                          </Link>

                          {merchantProducts.length > 0 && (
                            <div className="flex overflow-x-auto space-x-3 hide-scrollbar pt-1">
                              {merchantProducts.map(p => (
                                <div key={p.id} className="shrink-0 w-32 space-y-2">
                                  <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                                    {p.photoUrl ? <img src={p.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20}/></div>}
                                    <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-black text-green-600 uppercase tracking-tighter">Popular</div>
                                    <button onClick={() => addToCart(p)} className="absolute bottom-1 right-1 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center text-pink-500 border border-pink-100 active:scale-90 transition-transform">
                                      <span className="text-xl leading-none font-bold">+</span>
                                    </button>
                                  </div>
                                  <div className="px-0.5">
                                    <p className="text-[10px] font-bold text-gray-800 truncate">{p.name}</p>
                                    <div className="flex items-center space-x-1.5 mt-0.5">
                                      <p className="text-xs font-black text-pink-500">₹{p.price}</p>
                                      {p.mrp && p.mrp > p.price && (
                                        <p className="text-[10px] font-medium text-gray-400 line-through">₹{p.mrp}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              )}
            </div>
        </div>
      </div>

      {/* ====== Footer ====== */}
      {/* ====== Compact Branded Footer ====== */}
      <footer className="bg-gray-950 text-white mt-2 px-6 pt-6 pb-20 rounded-t-[2.5rem] shadow-2xl relative">
        <div className="relative z-10 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-[var(--color-primary)] rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <ShoppingCart size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight leading-none">Addanki <span className="text-green-500">Mart</span></h3>
                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1">S/O Koteswara Rao Platform</p>
              </div>
            </div>
            <div className="flex space-x-1.5">
               <a href="https://wa.me/919346701988" className="p-1.5 bg-white/5 rounded-lg text-green-400 border border-white/10 hover:bg-white/10"><MessageCircle size={16}/></a>
               <a href="https://www.instagram.com/k_sai_mani_18/" className="p-1.5 bg-white/5 rounded-lg text-pink-400 border border-white/10 hover:bg-white/10"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[16px] h-[16px]"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
            </div>
          </div>

          {/* Core Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Quick Support</p>
              <div className="space-y-2">
                <button onClick={()=>setShowSupport(true)} className="flex items-center text-xs font-bold text-gray-400 hover:text-white transition-colors">
                  <div className="w-6 h-6 bg-white/5 rounded-lg flex items-center justify-center mr-2.5"><HeadphonesIcon size={12}/></div>
                  {t("Help", "సహాయం")}
                </button>
                <Link href="/customer/orders" className="flex items-center text-xs font-bold text-gray-400 hover:text-white transition-colors">
                  <div className="w-6 h-6 bg-white/5 rounded-lg flex items-center justify-center mr-2.5"><History size={12}/></div>
                  {t("Orders", "ఆర్డర్లు")}
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Contact Point</p>
              <div className="space-y-0.5">
                <p className="text-xs font-black text-white">SAI MANI KANDUKURI</p>
                <a href="tel:9346701988" className="text-sm font-black text-[var(--color-primary)] block">9346701988</a>
                <p className="text-[7px] font-bold text-gray-700 uppercase">Addanki, Andhra Pradesh</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-center">
            <p className="text-[8px] text-gray-700">© {new Date().getFullYear()} Addanki Mart. {t("All rights reserved.", "అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.")}</p>
          </div>
        </div>
      </footer>



      {activeOrders.length > 0 && (
          <div className={`fixed left-0 right-0 p-4 z-40 bg-gradient-to-t from-white via-white to-transparent pointer-events-none transition-all ${cart.length > 0 ? "bottom-[72px] pb-4" : "bottom-0 pb-8"}`}>
             <div className="max-w-md mx-auto pointer-events-auto">
                <Link href="/customer/tracking" className="bg-[var(--color-primary)] text-white p-4 rounded-2xl flex items-center justify-between shadow-[0_10px_30px_rgba(34,139,34,0.3)] active:scale-95 transition-transform border-2 border-white">
                   <div className="flex items-center space-x-3">
                     <div className="bg-white/20 p-2 rounded-xl animate-pulse">
                        <Truck size={20} className="text-white relative z-10" />
                     </div>
                     <div>
                       <p className="font-bold text-sm">{activeOrders.length} {t("Active Orders Queue", "ఆర్డర్ క్యూ")}</p>
                       <p className="text-[10px] text-green-100 font-extrabold uppercase tracking-widest">{t("Tap to Trace Live", "ట్రాక్ చేయడానికి నొక్కండి")}</p>
                     </div>
                   </div>
                   <ChevronRight />
                </Link>
             </div>
          </div>
       )}


       {/* ====== Profile Slide-out ====== */}
       <AnimatePresence>
         {showProfile && (
            <div className="fixed inset-0 z-50 flex justify-end">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfile(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
               <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative bg-white w-full max-w-sm h-full shadow-2xl flex flex-col pointer-events-auto">
                  <div className="p-6 bg-gray-50 flex justify-between items-center border-b border-gray-200">
                     <h2 className="font-black text-xl text-gray-900 tracking-tight">{t("Your Profile", "మీ ప్రొఫైల్")}</h2>
                     <button onClick={() => setShowProfile(false)} className="p-2 bg-white rounded-full text-gray-500 shadow-sm border border-gray-200 hover:text-black">
                        <X size={20} />
                     </button>
                  </div>
                  <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                     <div className="space-y-4">
                        <div>
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">{t("Name", "పేరు")}</label>
                           <input type="text" value={customerProfile.name} onChange={e => updateCustomerProfile({ name: e.target.value })} className="w-full bg-white border border-gray-200 p-4 rounded-xl font-bold text-gray-900 focus:border-[var(--color-primary)] outline-none" />
                        </div>
                        <div>
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">{t("Phone Number", "ఫోన్ నంబర్")}</label>
                           <input type="tel" value={customerProfile.phone} onChange={e => updateCustomerProfile({ phone: e.target.value })} className="w-full bg-white border border-gray-200 p-4 rounded-xl font-bold text-gray-900 focus:border-[var(--color-primary)] outline-none" />
                        </div>
                        <div>
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">{t("Saved Location", "సేవ్ చేసిన స్థానం")}</label>
                           <input type="text" value={customerProfile.deliveryAddress} onChange={e => updateCustomerProfile({ deliveryAddress: e.target.value })} className="w-full bg-white border border-gray-200 p-4 rounded-xl font-bold text-gray-900 focus:border-[var(--color-primary)] outline-none" />
                        </div>
                     </div>
                     <div className="pt-6 border-t border-gray-100 space-y-3">
                        <Link href="/customer/orders" onClick={() => setShowProfile(false)} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl font-bold text-gray-700 hover:bg-gray-100">
                           <span className="flex items-center"><History size={18} className="mr-3 text-gray-400" /> {t("Order History", "ఆర్డర్ హిస్టరీ")}</span>
                           <ChevronRight size={16} className="text-gray-400" />
                        </Link>
                        <button onClick={() => { setShowProfile(false); setShowSupport(true); }} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl font-bold text-gray-700 hover:bg-gray-100">
                           <span className="flex items-center"><HeadphonesIcon size={18} className="mr-3 text-gray-400" /> {t("Support / Help", "సహాయం")}</span>
                           <ChevronRight size={16} className="text-gray-400" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl font-bold text-gray-700 hover:bg-gray-100" onClick={toggleLanguage}>
                           <span className="flex items-center"><Globe size={18} className="mr-3 text-gray-400" /> {t("Language", "భాష")}</span>
                           <span className="text-[var(--color-primary)]">{isTelugu ? 'తెలుగు' : 'English'}</span>
                        </button>
                        <button onClick={() => setRole(null)} className="w-full flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-xl font-bold active:scale-95 transition-transform mt-8">
                           <LogOut size={18} className="mr-2" /> {t("Sign Out", "సైన్ అవుట్")}
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
       </AnimatePresence>

       {/* ====== Customer Care Modal ====== */}
       <AnimatePresence>
         {showSupport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSupport(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
               <motion.div initial={{ y: 50, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-sm border border-gray-100">
                  <div className="text-center mb-6">
                     <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-green-500/30 mb-4">
                        <HeadphonesIcon size={28} className="text-white" />
                     </div>
                     <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{t("Customer Care", "కస్టమర్ కేర్")}</h2>
                     <p className="text-gray-500 font-medium mt-1">Addanki Mart Support</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t("Contact Person", "సంప్రదింపు వ్యక्తి")}</p>
                     <p className="text-xl font-extrabold text-gray-900 leading-tight">SAI MANI KANDUKURI</p>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">S/O Koteswara Rao</p>
                     <p className="text-lg font-bold text-[var(--color-primary)]">9346701988</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <a href="tel:9346701988" className="flex items-center justify-center bg-[var(--color-primary)] text-white font-bold py-4 rounded-xl active:scale-95 transition-transform shadow-lg shadow-green-500/20">
                        <Phone size={18} className="mr-2" /> {t("Call", "కాల్")}
                     </a>
                     <a href="https://wa.me/919346701988" target="_blank" className="flex items-center justify-center bg-green-500 text-white font-bold py-4 rounded-xl active:scale-95 transition-transform shadow-lg shadow-green-500/20">
                        <MessageCircle size={18} className="mr-2" /> WhatsApp
                     </a>
                  </div>
                  <button onClick={() => setShowSupport(false)} className="w-full mt-4 text-gray-400 font-bold py-2 text-sm">{t("Close", "మూసివేయండి")}</button>
               </motion.div>
            </div>
         )}
       </AnimatePresence>
    </div>
  );
}
