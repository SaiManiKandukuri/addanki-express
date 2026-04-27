"use client";

import { useAppStore, Product, Merchant } from "@/store/useStore";
import { Search, MapPin, ChevronRight, Star, Clock, Truck, ShoppingBag, PowerOff, Sparkles, X, Image as ImageIcon, HeadphonesIcon, LogOut, User, Globe, Phone, MessageCircle, ShoppingCart, History } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomerHome() {
  const merchants = useAppStore(state => state.merchants);
  const products = useAppStore(state => state.products);
  const orders = useAppStore(state => state.orders);
  const cart = useAppStore(state => state.cart);
  const banners = useAppStore(state => state.banners);
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
  
  const categories = [
    { name: "Milk", icon: "🥛", color: "bg-blue-100/50 text-blue-600" },
    { name: "Meat", icon: "🥩", color: "bg-red-100/50 text-red-600" },
    { name: "Veggies", icon: "🥬", color: "bg-green-100/50 text-green-600" },
    { name: "Kirana", icon: "🌾", color: "bg-yellow-100/50 text-yellow-600" }
  ];

  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'DENIED' && o.status !== 'CANCELLED' && o.status !== 'RETURN_REQUESTED');
  const pastOrders = orders.filter(o => o.status === 'DELIVERED').reverse().slice(0, 3);

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const isSearching = normalizedQuery.length > 0 || selectedCategory !== null;

  let matchedMerchants: Merchant[] = [];
  let matchedProducts: Product[] = [];

  if (selectedCategory) {
     matchedProducts = products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
  } else if (normalizedQuery.length > 0) {
     matchedMerchants = merchants.filter(m => m.name.toLowerCase().includes(normalizedQuery));
     matchedProducts = products.filter(p => p.name.toLowerCase().includes(normalizedQuery));
  }

  if (!mounted) return <div className="min-h-screen bg-[var(--color-softcream)] animate-pulse" />;

  return (
    <div className="min-h-screen bg-[var(--color-softcream)] space-y-8 max-w-md mx-auto relative pb-10">
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

        <div className="relative group cursor-text" onClick={() => setIsSearchOpen(true)}>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={20} />
          </div>
          <input 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder={t("Search stores & items...", "దుకాణాలలో వెతకండి...")}
             className="flex items-center w-full pl-12 pr-10 py-4 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
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
                  <style jsx>{`
                     .hide-scrollbar::-webkit-scrollbar { display: none; }
                     .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                  `}</style>
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
              <div>
                <h2 className="text-lg font-black text-gray-900 mb-4 tracking-tight">{t("Shop by Category", "వర్గాల ద్వారా షాపింగ్")}</h2>
                <div className="grid grid-cols-4 gap-3">
                  {categories.map((c, idx) => (
                    <div key={idx} onClick={() => { setSelectedCategory(c.name); setIsSearchOpen(true); }} className="flex flex-col items-center cursor-pointer group active:scale-95 transition-transform space-y-2">
                      <div className={`w-[72px] h-[72px] rounded-[1.25rem] flex items-center justify-center text-3xl shadow-sm border border-gray-100 ${c.color} group-hover:scale-105 transition-all`}>
                        {c.icon}
                      </div>
                      <span className="text-xs font-bold text-gray-700">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                   {isSearching ? t("Search Results", "శోధన ఫలితాలు") : t("Stores in Addanki", "అద్దంకి లోని దుకాణాలు")}
                </h2>
                {!isSearching && <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest bg-green-50 px-2 py-1 rounded">{merchants.length} {t("Live", "లైవ్")}</span>}
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
                  {(isSearching ? matchedMerchants : merchants).map(merchant => (
                    <div key={merchant.id}>
                      {merchant.isOffline ? (
                         <div className="block bg-gray-50 border border-gray-100 rounded-[2rem] p-5 shadow-sm opacity-60 grayscale cursor-not-allowed relative overflow-hidden">
                           <div className="absolute top-4 right-4 bg-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center">
                              <PowerOff size={10} className="mr-1" /> Offline
                           </div>
                           <div className="flex items-start">
                              <div className="w-[72px] h-[72px] bg-gray-200 rounded-2xl flex items-center justify-center text-3xl font-black text-gray-400">{merchant.name.charAt(0)}</div>
                              <div className="ml-4 flex-1 mt-1">
                                <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">{merchant.name}</h3>
                                <p className="text-sm font-medium text-gray-500 mt-1">Store is currently closed.</p>
                              </div>
                           </div>
                         </div>
                      ) : (
                        <Link href={`/customer/store/${merchant.id}`} className="block bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm hover:shadow-lg active:scale-[0.98] transition-all relative overflow-hidden">
                          <div className="flex items-start">
                            <div className="w-[72px] h-[72px] bg-gradient-to-br from-green-50 to-[var(--color-softcream)] border border-green-100 rounded-2xl flex items-center justify-center text-3xl font-black text-[var(--color-primary)]">
                              {merchant.name.charAt(0)}
                            </div>
                            <div className="ml-4 flex-1">
                              <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">{merchant.name}</h3>
                              <div className="flex items-center space-x-3 mt-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                                <span className="flex items-center text-orange-500 bg-orange-50 px-2 py-1 rounded-md">
                                  <Star size={12} className="mr-1 fill-current" /> {merchant.rating}
                                </span>
                                <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                                  <Clock size={12} className="mr-1" /> {merchant.deliveryTime}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>

      {/* ====== Footer ====== */}
      <footer className="bg-gray-900 text-white mt-8 px-5 pt-10 pb-28 rounded-t-[2.5rem]">
        {/* Brand */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <ShoppingCart size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight leading-none">Addanki <span className="text-green-400">Mart</span></h3>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{t("Quick Commerce • Addanki", "క్విక్ కామర్స్ • అద్దంకి")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Quick Links */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">{t("Quick Links", "త్వరిత లింకులు")}</p>
            <div className="space-y-2.5">
              <Link href="/customer/orders" className="block text-sm font-bold text-gray-300 hover:text-green-400 transition-colors">
                <History size={13} className="inline mr-2 text-gray-500" />{t("Order History", "ఆర్డర్ హిస్టరీ")}
              </Link>
              <button onClick={() => setShowSupport(true)} className="block text-sm font-bold text-gray-300 hover:text-green-400 transition-colors text-left">
                <HeadphonesIcon size={13} className="inline mr-2 text-gray-500" />{t("Customer Support", "కస్టమర్ సపోర్ట్")}
              </button>
              <button onClick={() => setShowProfile(true)} className="block text-sm font-bold text-gray-300 hover:text-green-400 transition-colors text-left">
                <User size={13} className="inline mr-2 text-gray-500" />{t("My Profile", "నా ప్రొఫైల్")}
              </button>
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">{t("Customer Care", "కస్టమర్ కేర్")}</p>
            <p className="text-sm font-extrabold text-white mb-1">SAI MANI KANDUKURI</p>
            <a href="tel:9346701988" className="flex items-center text-sm font-bold text-green-400 mb-2 hover:underline">
              <Phone size={13} className="mr-2" /> 9346701988
            </a>
            <a href="https://wa.me/919346701988" target="_blank" className="flex items-center text-sm font-bold text-green-400 hover:underline">
              <MessageCircle size={13} className="mr-2" /> WhatsApp
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-6 flex flex-col items-center text-center space-y-2">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t("Serving Addanki & Surroundings", "అద్దంకి & చుట్టుపక్కల సేవలు")}</p>
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Addanki Mart. {t("All rights reserved.", "అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.")}</p>
          <p className="text-[10px] text-gray-700 font-medium">{t("Made with ❤️ in Addanki", "అద్దంకిలో ❤️ తో తయారు చేయబడింది")}</p>
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
                     <p className="text-xl font-extrabold text-gray-900">SAI MANI KANDUKURI</p>
                     <p className="text-lg font-bold text-[var(--color-primary)] mt-1">9346701988</p>
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
