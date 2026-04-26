"use client";

import { useAppStore, Order, OrderStatus, Product } from "@/store/useStore";
import { useEffect, useState, useRef } from "react";
import { BellRing, Check, Package, LogOut, ArrowRight, DollarSign, Power, Plus, Edit2, X, Image as ImageIcon, UploadCloud, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MerchantDashboard() {
  const allOrders = useAppStore(state => state.orders);
  const updateOrderStatus = useAppStore(state => state.updateOrderStatus);
  const products = useAppStore(state => state.products);
  const toggleProductStock = useAppStore(state => state.toggleProductStock);
  const addProduct = useAppStore(state => state.addProduct);
  const editProduct = useAppStore(state => state.editProduct);
  const setRole = useAppStore(state => state.setRole);
  const merchants = useAppStore(state => state.merchants);
  const toggleMerchantStatus = useAppStore(state => state.toggleMerchantStatus);

  const [activeTab, setActiveTab] = useState<"kanban" | "inventory" | "earnings">("kanban");
  
  const myMerchantId = useAppStore(state => state.currentUserId) || "m1"; 
  const myMerchant = merchants.find(m => m.id === myMerchantId);
  const myOrders = allOrders.filter(o => o.merchantIds.includes(myMerchantId) && o.status !== 'DENIED');
  const myProducts = products.filter(p => p.merchantId === myMerchantId);

  const [hasLocationAccess, setHasLocationAccess] = useState(false);

  useEffect(() => {
     if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
           () => setHasLocationAccess(true),
           () => setHasLocationAccess(false)
        );
     }
  }, []);

  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [fName, setFName] = useState("");
  const [fPrice, setFPrice] = useState("");
  const [fMrp, setFMrp] = useState("");
  const [fCat, setFCat] = useState<Product['category']>('Kirana');
  const [fDesc, setFDesc] = useState("");
  const [fPhoto, setFPhoto] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFName(""); setFPrice(""); setFMrp(""); setFCat('Kirana'); setFDesc(""); setFPhoto("");
    setEditingItem(null); setIsAdding(false);
  };

  const openEdit = (p: Product) => {
    setEditingItem(p); setFName(p.name); setFPrice(p.price.toString()); setFMrp(p.mrp ? p.mrp.toString() : "");
    setFCat(p.category); setFDesc(p.description || ""); setFPhoto(p.photoUrl || "");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveProduct = () => {
    if (!fName || !fPrice) return;
    if (editingItem) {
      editProduct(editingItem.id, {
        name: fName, price: Number(fPrice), mrp: fMrp ? Number(fMrp) : undefined, category: fCat, description: fDesc, photoUrl: fPhoto
      });
    } else {
      addProduct({
        id: 'p_' + Math.random().toString(36).substr(2, 6),
        merchantId: myMerchantId,
        name: fName, price: Number(fPrice), mrp: fMrp ? Number(fMrp) : undefined, category: fCat,
        inStock: true, description: fDesc, photoUrl: fPhoto
      });
    }
    resetForm();
  };

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    let vibInterval: NodeJS.Timeout | null = null;
    
    const hasNew = myOrders.some(o => o.status === 'PENDING');
    if (hasNew && activeTab === 'kanban') {
      audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"); // Intense disaster-like beep tone
      audio.loop = true;
      audio.play().catch(() => {});
      
      if ('vibrate' in navigator) {
         vibInterval = setInterval(() => {
            navigator.vibrate([200, 100, 200, 100, 500, 1000]);
         }, 2500);
      }
    }
    
    return () => {
      if (audio) { audio.pause(); audio.currentTime = 0; }
      if (vibInterval) clearInterval(vibInterval);
    };
  }, [myOrders, activeTab]);

  const advanceOrder = (orderId: string, current: OrderStatus) => {
    let next: OrderStatus = 'PENDING';
    if (current === 'PENDING') next = 'PREPARING';
    if (current === 'PREPARING') next = 'READY_FOR_PICKUP';
    if (next !== 'PENDING') updateOrderStatus(orderId, next);
  };

  const salesCount = myOrders.filter(o => o.status === 'DELIVERED').length;
  const myTotalSales = myOrders.reduce((acc, order) => {
    if (order.status !== 'DELIVERED') return acc;
    return acc + order.items.filter(i => i.merchantId === myMerchantId).reduce((s, i) => s + (i.price * i.quantity), 0);
  }, 0);
  const commission = myOrders.reduce((acc, order) => {
    if (order.status !== 'DELIVERED') return acc;
    return acc + order.items.filter(i => i.merchantId === myMerchantId).reduce((s, i) => {
      const rate = i.category === 'Kirana' ? 0.05 : i.category === 'Snacks' ? 0.15 : 0.10;
      return s + (i.price * i.quantity * rate);
    }, 0);
  }, 0);
  const netPayout = myTotalSales - commission;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 to-orange-50/50 flex flex-col font-sans relative">
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm z-20 sticky top-0 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-[var(--color-primary)] rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 text-white font-bold text-xl">
             {myMerchant?.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">{myMerchant?.name}</h1>
            <div className="flex items-center space-x-3 mt-1">
               <button 
                 onClick={() => toggleMerchantStatus(myMerchantId)}
                 className={`flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border transition-all ${
                   myMerchant?.isOffline ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200 shadow-sm'
                 }`}
               >
                 <Power size={10} className={myMerchant?.isOffline ? '' : 'text-green-500'} />
                 <span>{myMerchant?.isOffline ? 'Store Offline' : 'Store Online'}</span>
               </button>
            </div>
          </div>
        </div>
        <button onClick={() => setRole(null)} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors">
          <LogOut size={18} />
        </button>
      </div>

      <div className="flex bg-white/50 backdrop-blur-md sticky top-[80px] z-10 border-b border-gray-200/50">
        {(['kanban', 'inventory', 'earnings'] as const).map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-xs font-extrabold uppercase tracking-widest transition-all ${
              activeTab === tab ? 'text-[var(--color-primary)] border-b-[3px] border-[var(--color-primary)] bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/40'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 overflow-y-auto w-full relative z-0">
        {activeTab === 'kanban' && (
          <div className="flex space-x-6 overflow-x-auto h-full pb-4 items-start snap-x" style={{ scrollbarWidth: 'none' }}>
            <div className="w-80 flex-shrink-0 bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/40 p-4 snap-center flex flex-col max-h-[80vh]">
              <div className="flex justify-between items-center mb-5 px-3">
                <h3 className="font-extrabold text-gray-800 uppercase tracking-widest text-sm">New Orders</h3>
                <span className="bg-[var(--color-alert)] text-white px-3 py-1 rounded-full text-xs font-black shadow-lg shadow-red-500/40 animate-pulse">
                  {myOrders.filter(o => o.status === 'PENDING').length}
                </span>
              </div>
              <div className="space-y-4 overflow-y-auto pr-1">
                {myOrders.filter(o => o.status === 'PENDING').map(order => (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={order.id} className="bg-white border-l-4 border-red-500 rounded-2xl p-5 shadow-sm relative hover:shadow-md transition-shadow">
                    <div className="flex justify-between font-black mb-3 text-gray-900 border-b border-gray-100 pb-2">
                      <span className="tracking-widest uppercase text-sm">#{order.id}</span>
                      <span className="text-[var(--color-alert)] bg-red-50 p-1.5 rounded-lg"><BellRing className="animate-pulse" size={16} /></span>
                    </div>
                    <ul className="text-sm font-medium text-gray-500 space-y-2 mb-5">
                      {order.items.filter(i => i.merchantId === myMerchantId).map(item => (
                        <li key={item.id} className="flex items-center"><span className="font-black text-gray-900 mr-2 bg-gray-100 px-2 py-0.5 rounded">{item.quantity}x</span> {item.name}</li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => advanceOrder(order.id, 'PENDING')}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-xl font-bold active:scale-95 transition-all shadow-md shadow-red-500/20 flex justify-center items-center group mb-2"
                    >
                      ACCEPT <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'DENIED')}
                      className="w-full bg-red-50 text-red-600 py-2.5 rounded-xl font-bold active:scale-95 transition-all text-xs tracking-widest uppercase border border-red-100"
                    >
                      Deny Order
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

             <div className="w-80 flex-shrink-0 bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/40 p-4 snap-center flex flex-col max-h-[80vh]">
              <div className="flex justify-between items-center mb-5 px-3">
                <h3 className="font-extrabold text-gray-800 uppercase tracking-widest text-sm">Preparing</h3>
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-black shadow-inner">
                  {myOrders.filter(o => o.status === 'PREPARING').length}
                </span>
              </div>
              <div className="space-y-4 overflow-y-auto pr-1">
                {myOrders.filter(o => o.status === 'PREPARING').map(order => (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={order.id} className="bg-white border-l-4 border-orange-400 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="font-black mb-4 text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2">#{order.id}</div>
                    <button 
                      onClick={() => advanceOrder(order.id, 'PREPARING')}
                      className="w-full bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 py-3 rounded-xl font-bold active:scale-95 transition-all flex justify-center items-center"
                    >
                      <Check size={16} className="mr-2" /> Mark Ready
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="w-80 flex-shrink-0 bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/40 p-4 snap-center flex flex-col max-h-[80vh]">
              <div className="flex justify-between items-center mb-5 px-3">
                <h3 className="font-extrabold text-gray-800 uppercase tracking-widest text-sm">Pickup Wait</h3>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black shadow-inner">
                  {myOrders.filter(o => o.status === 'READY_FOR_PICKUP').length}
                </span>
              </div>
              <div className="space-y-4 overflow-y-auto pr-1">
                {myOrders.filter(o => o.status === 'READY_FOR_PICKUP').map(order => (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={order.id} className="bg-green-50/50 border border-green-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                       <div className="font-black text-green-900 uppercase tracking-widest">#{order.id}</div>
                       <div className="bg-white p-2 border border-green-100 rounded-xl shadow-sm text-green-500"><Package size={18} /></div>
                    </div>
                    {hasLocationAccess && (
                      <div className="bg-white rounded-xl border border-green-100 p-3 flex flex-col cursor-pointer overflow-hidden relative">
                         <div className="flex justify-between items-center">
                           <div>
                              <p className="text-[9px] font-black uppercase text-gray-500">Distance Vector</p>
                              <p className="text-xs font-extrabold text-[var(--color-primary)] truncate max-w-[120px]">{order.customerLandmark}</p>
                           </div>
                           <MapPin className="text-[var(--color-primary)] opacity-40 shrink-0" size={24} />
                         </div>
                         <svg className="w-full h-8 mt-2 opacity-50" preserveAspectRatio="none">
                            <path d="M5,15 Q75,10 150,15" stroke="#228b22" strokeWidth="2" strokeDasharray="3 3" fill="none" className="animate-[dash_10s_linear_infinite]" />
                         </svg>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html:`@keyframes dash{to{stroke-dashoffset: -100;}}`}} />

        {activeTab === 'inventory' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white/60 backdrop-blur-xl p-5 rounded-[2rem] shadow-sm border border-white/40">
               <div>
                  <h2 className="text-xl font-extrabold text-gray-900">Database</h2>
               </div>
               <button onClick={() => setIsAdding(true)} className="bg-[var(--color-primary)] text-white px-5 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-green-500/30">
                  <Plus size={18} className="mr-2" /> Add Item
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myProducts.map(product => (
                <div key={product.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl text-gray-300 flex items-center justify-center border border-dashed border-gray-200 overflow-hidden shrink-0">
                          {product.photoUrl ? <img src={product.photoUrl} className="w-full h-full object-cover" /> : <ImageIcon size={20}/>}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{product.name} <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md ml-1">{product.category}</span></h3>
                        </div>
                     </div>
                     <div className="text-right flex-shrink-0">
                        <p className="font-extrabold text-[var(--color-primary)] text-lg">₹{product.price}</p>
                     </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-6 border-t border-gray-50 pt-4">
                    <label className="flex items-center cursor-pointer group-hover:opacity-100 transition-opacity">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={product.inStock} onChange={() => toggleProductStock(product.id)} />
                        <div className={`block w-12 h-6 rounded-full shadow-inner transition-colors ${product.inStock ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${product.inStock ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                      <span className={`ml-2 text-xs font-bold uppercase tracking-widest ${product.inStock ? 'text-green-600' : 'text-gray-400'}`}>
                        {product.inStock ? 'In Stock' : 'Out'}
                      </span>
                    </label>
                    <button onClick={() => openEdit(product)} className="text-gray-400 p-2 rounded-xl border">
                       <Edit2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {(isAdding || editingItem) && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <motion.div initial={{ y: 50, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white rounded-[2rem] shadow-2xl p-6 w-full max-w-md border border-white/20">
                 <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-extrabold text-gray-900">{editingItem ? 'Edit Item' : 'Create Item'}</h2>
                   <button onClick={resetForm} className="bg-gray-100 text-gray-500 p-2 rounded-full hover:bg-gray-200"><X size={20}/></button>
                 </div>
                 
                 <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 pb-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Item Name</label>
                      <input value={fName} onChange={e=>setFName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:border-[var(--color-primary)] outline-none font-bold text-gray-900" placeholder="e.g. Fresh Milk (1L)" />
                   </div>
                   <div className="flex space-x-4">
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Selling Price (₹)</label>
                        <input value={fPrice} onChange={e=>setFPrice(e.target.value.replace(/\D/g, ''))} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:border-[var(--color-primary)] outline-none font-bold text-gray-900" placeholder="60" />
                     </div>
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">MRP Target (₹)</label>
                        <input value={fMrp} onChange={e=>setFMrp(e.target.value.replace(/\D/g, ''))} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:border-red-400 outline-none font-bold text-gray-600" placeholder="75" />
                     </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Category</label>
                      <select value={fCat} onChange={e=>setFCat(e.target.value as any)} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:border-[var(--color-primary)] outline-none font-bold text-gray-600">
                        <option>Milk</option><option>Meat</option><option>Veggies</option><option>Kirana</option><option>Snacks</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                      <textarea value={fDesc} onChange={e=>setFDesc(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:border-[var(--color-primary)] outline-none text-sm text-gray-700" placeholder="Brief info..." rows={2}></textarea>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Item Photo</label>
                      <div className="flex space-x-3">
                         <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center bg-gray-50 border border-gray-200 border-dashed rounded-xl px-4 py-3 shrink-0 hover:bg-gray-100 transition-colors">
                            <UploadCloud size={20} className="text-[var(--color-primary)]" />
                         </button>
                         <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                         <input value={fPhoto} onChange={e=>setFPhoto(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:border-[var(--color-primary)] outline-none text-xs font-mono text-blue-600" placeholder="Or paste base64/URL..." />
                      </div>
                      {fPhoto && (
                          <div className="mt-3 w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                             <img src={fPhoto} className="w-full h-full object-cover" />
                          </div>
                      )}
                   </div>
                   <button onClick={saveProduct} className="w-full bg-[var(--color-primary)] text-white font-extrabold py-4 rounded-xl shadow-lg shadow-green-500/20 active:scale-95 transition-transform mt-6">
                      {editingItem ? 'Save Changes' : 'Publish Item'}
                   </button>
                 </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {activeTab === 'earnings' && (
          <div className="max-w-2xl mx-auto space-y-6 pb-20">
            <h2 className="text-2xl font-black text-gray-900 px-2 tracking-tight">Revenue Dashboard</h2>
            <div className="bg-gradient-to-br from-green-600 to-[var(--color-primary)] text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[50px] -mr-10 -mt-20"></div>
               <div className="relative z-10 flex flex-col space-y-6">
                 <div>
                   <p className="text-white/80 font-extrabold uppercase tracking-widest text-xs mb-1">Total Gross Platform Volume</p>
                   <h2 className="text-6xl font-black">₹{myTotalSales}</h2>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                    <div>
                       <p className="text-[10px] text-white/70 uppercase font-black tracking-widest">Completed Orders</p>
                       <p className="text-2xl font-black text-white">{salesCount}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-white/70 uppercase font-black tracking-widest">Net Revenue Payout</p>
                       <p className="text-2xl font-black text-white">₹{netPayout}</p>
                    </div>
                 </div>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                  <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Fees Structure</h3>
                  <div className="mt-4 space-y-4">
                     <div className="flex justify-between font-bold text-sm border-b border-gray-50 pb-2">
                        <span className="text-gray-500">Gross Sales</span>
                        <span className="text-gray-900">₹{myTotalSales}</span>
                     </div>
                     <div className="flex justify-between font-bold text-sm border-b border-gray-50 pb-2">
                        <span className="text-red-500">Platform Commission</span>
                        <span className="text-red-500">-₹{commission}</span>
                     </div>
                     <div className="flex justify-between font-black text-lg pt-1">
                        <span className="text-[var(--color-primary)]">Net Transfer</span>
                        <span className="text-[var(--color-primary)]">₹{netPayout}</span>
                     </div>
                  </div>
               </div>
               
               <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                  <DollarSign size={40} className="text-green-500 mb-2" />
                  <p className="font-extrabold text-sm text-gray-900">Payouts execute daily at Midnight automatically to your registered UPI handle.</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
