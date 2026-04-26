"use client";

import { useAppStore, Merchant, Product, Banner } from "@/store/useStore";
import { LogOut, Activity, Users, Box, AlertTriangle, Plus, Edit2, X, Image as ImageIcon, Power, Truck, UploadCloud, Megaphone, Trash2, DollarSign } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const allOrders = useAppStore(state => state.orders);
  const merchants = useAppStore(state => state.merchants);
  const products = useAppStore(state => state.products);
  const agents = useAppStore(state => state.agents);
  const banners = useAppStore(state => state.banners);
  
  const setRole = useAppStore(state => state.setRole);
  const addMerchant = useAppStore(state => state.addMerchant);
  const editProduct = useAppStore(state => state.editProduct);
  const toggleMerchantStatus = useAppStore(state => state.toggleMerchantStatus);
  const toggleAgentStatus = useAppStore(state => state.toggleAgentStatus);
  const addBanner = useAppStore(state => state.addBanner);
  const removeBanner = useAppStore(state => state.removeBanner);
  const updateMerchant = useAppStore(state => state.updateMerchant);
  const updateAgent = useAppStore(state => state.updateAgent);
  const reassignAgent = useAppStore(state => state.reassignAgent);

  const [activeTab, setActiveTab] = useState<"live" | "merchants" | "inventory" | "fleet" | "promos" | "financials">("live");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editingCreds, setEditingCreds] = useState<{id: string, type: 'merchant'|'agent'} | null>(null);
  const [tempCreds, setTempCreds] = useState('');

  const [isAddingMerchant, setIsAddingMerchant] = useState(false);
  const [mName, setMName] = useState("");
  const [mTime, setMTime] = useState("");

  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [fName, setFName] = useState("");
  const [fPrice, setFPrice] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fPhoto, setFPhoto] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         addBanner({
            id: 'b' + Math.random().toString().substring(2, 6),
            photoUrl: reader.result as string
         });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMerchant = () => {
    if (!mName) return;
    addMerchant({
      id: "m" + Math.random().toString().substring(2, 6),
      name: mName,
      rating: 5.0,
      deliveryTime: mTime || "15 mins",
      isOffline: false
    });
    setMName(""); setMTime(""); setIsAddingMerchant(false);
  };

  const openOverride = (p: Product) => {
    setEditingItem(p); setFName(p.name); setFPrice(p.price.toString()); 
    setFDesc(p.description || ""); setFPhoto(p.photoUrl || "");
  };

  const saveOverride = () => {
    if (editingItem) {
      editProduct(editingItem.id, {
        name: fName, price: Number(fPrice), description: fDesc, photoUrl: fPhoto
      });
    }
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex h-screen overflow-hidden font-sans">
      <div className="w-72 bg-white/5 border-r border-white/10 flex flex-col hidden md:flex backdrop-blur-3xl z-20">
        <div className="p-8 font-extrabold text-2xl border-b border-white/10 text-[var(--color-secondary)] tracking-tight">
          Admin Core <div className="text-xs text-white/40 tracking-widest uppercase mt-1">Addanki Engine</div>
        </div>
        <div className="p-4 space-y-2 flex-1 mt-4">
          <button onClick={()=>setActiveTab('live')} className={`w-full px-5 py-4 rounded-2xl flex items-center font-bold transition-all ${activeTab === 'live' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 text-md tracking-wide' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><Activity className="mr-3" size={20}/> Live Operations</button>
          <button onClick={()=>setActiveTab('merchants')} className={`w-full px-5 py-4 rounded-2xl flex items-center font-bold transition-all ${activeTab === 'merchants' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 text-md tracking-wide' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><Users className="mr-3" size={20}/> Partnerships</button>
          <button onClick={()=>setActiveTab('inventory')} className={`w-full px-5 py-4 rounded-2xl flex items-center font-bold transition-all ${activeTab === 'inventory' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 text-md tracking-wide' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><Box className="mr-3" size={20}/> Global Catalog</button>
          <button onClick={()=>setActiveTab('fleet')} className={`w-full px-5 py-4 rounded-2xl flex items-center font-bold transition-all ${activeTab === 'fleet' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 text-md tracking-wide' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><Truck className="mr-3" size={20}/> Delivery Fleet</button>
          <button onClick={()=>setActiveTab('promos')} className={`w-full px-5 py-4 rounded-2xl flex items-center font-bold transition-all ${activeTab === 'promos' ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/20 text-md tracking-wide' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><Megaphone className="mr-3" size={20}/> Marketing Banners</button>
          <button onClick={()=>setActiveTab('financials')} className={`w-full px-5 py-4 rounded-2xl flex items-center font-bold transition-all ${activeTab === 'financials' ? 'bg-gradient-to-r from-[var(--color-primary)] to-green-800 text-white shadow-lg shadow-green-500/20 text-md tracking-wide' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><DollarSign className="mr-3" size={20}/> Platform Revenue</button>
        </div>
        <button onClick={() => setRole(null)} className="p-8 text-gray-500 font-bold flex items-center hover:text-red-400 transition-colors uppercase tracking-widest text-xs"><LogOut className="mr-3 text-red-500" size={16}/> Terminate Session</button>
      </div>

      <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto w-full relative z-0">
        <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none"></div>

        <div className="flex justify-between items-center mb-10 relative z-10">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              {activeTab === 'live' ? 'Command Center' : activeTab === 'merchants' ? 'Merchant Partners' : activeTab === 'fleet' ? 'Fleet Operations' : activeTab === 'promos' ? 'Marketing' : activeTab === 'financials' ? 'Global Revenue' : 'Global Catalog'}
            </h1>
            <p className="text-green-400/80 font-bold tracking-widest text-xs uppercase mt-2">Absolute System Authority Active</p>
          </div>
          <button onClick={() => setRole(null)} className="md:hidden bg-white/10 border border-white/20 text-white px-5 py-2.5 rounded-xl font-bold active:scale-95 transition-transform text-xs tracking-widest uppercase">Sign out</button>
        </div>

        {activeTab === 'live' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
              <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-white/30 transition-colors">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Orders</p>
                  <p className="text-5xl font-black text-white mt-2">{allOrders.filter(o => o.status !== 'DELIVERED').length}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-white/30 transition-colors">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stores Live</p>
                  <p className="text-5xl font-black text-[var(--color-secondary)] mt-2">{merchants.filter(m => !m.isOffline).length}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-white/30 transition-colors">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Riders</p>
                  <p className="text-5xl font-black text-blue-400 mt-2">{agents.filter(a => a.isOnline).length}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 border-b-4 border-b-green-500 shadow-lg shadow-green-500/10">
                  <p className="text-xs font-bold text-green-400 uppercase tracking-widest">GMV Today</p>
                  <p className="text-5xl font-black text-white mt-2">₹{allOrders.filter(o => o.status === 'DELIVERED').reduce((acc,o)=>acc+o.total,0)}</p>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden flex-1 flex flex-col">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-lg font-bold text-white tracking-wide">Sync Telemetry Log</h2>
                <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-green-400 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20"><span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse shadow-[0_0_8px_#4ade80]"></span> Live</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/5 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                    <tr>
                        <th className="px-8 py-5">Order Reference</th>
                        <th className="px-8 py-5">Value</th>
                        <th className="px-8 py-5">State</th>
                        <th className="px-8 py-5 hidden md:table-cell">Destination</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.slice().reverse().map(order => (
                      <tr key={order.id} onClick={() => setSelectedOrder(order)} className="border-b border-white/5 text-sm hover:bg-white/10 transition-colors cursor-pointer">
                        <td className="px-8 py-5 font-mono font-bold text-white uppercase tracking-wider">#{order.id}</td>
                        <td className="px-8 py-5 font-bold text-[var(--color-secondary)]">₹{order.total}</td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            order.status === 'PENDING' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-gray-400 hidden md:table-cell max-w-xs truncate font-medium">{order.customerAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'promos' && (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-4xl mx-auto space-y-6">
             <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10">
                <div>
                   <h2 className="text-xl font-bold text-white tracking-wide">Live Promotions Carousel</h2>
                   <p className="text-gray-400 text-sm mt-1">These images dynamically beam into the Customer Application's top header sequence.</p>
                </div>
                <button onClick={() => bannerInputRef.current?.click()} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center active:scale-95 transition-transform hover:bg-purple-500">
                   <Plus size={18} className="mr-2" /> Inject Native Banner
                </button>
                <input type="file" accept="image/*" ref={bannerInputRef} onChange={handleBannerUpload} className="hidden" />
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map(banner => (
                   <div key={banner.id} className="relative bg-white/5 rounded-3xl overflow-hidden border border-white/10 group h-48">
                      <img src={banner.photoUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                         <button onClick={() => removeBanner(banner.id)} className="bg-red-500 text-white p-2 rounded-xl flex items-center text-xs font-bold uppercase tracking-widest hover:bg-red-400 ml-auto">
                            <Trash2 size={14} className="mr-2" /> Kill Banner
                         </button>
                      </div>
                   </div>
                ))}
                {banners.length === 0 && (
                   <div className="col-span-2 border border-dashed border-white/20 rounded-3xl h-48 flex items-center justify-center text-gray-500 font-bold">
                      No banners active. Customer UI will fallback to static default arrays.
                   </div>
                )}
             </div>
           </motion.div>
        )}

        {/* ... (Merchants, Fleet & Inventory rendering intact as before safely) */}
        {activeTab === 'merchants' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 space-y-6">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold text-white tracking-wide">Registered Entities</h2>
               <button onClick={() => setIsAddingMerchant(true)} className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center active:scale-95 transition-transform text-sm tracking-wide">
                  <Plus size={18} className="mr-2" /> Add Merchant
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {merchants.map(m => (
                  <div key={m.id} className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10 relative">
                     {m.isOffline && <div className="absolute top-4 right-4 bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Offline</div>}
                     <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center font-extrabold text-2xl text-[var(--color-secondary)] mb-4">{m.name.charAt(0)}</div>
                     <h3 className="font-extrabold text-lg text-white mb-1">{m.name}</h3>
                     <p className="text-sm font-medium text-gray-400 mb-4">Delivery: {m.deliveryTime}</p>
                     
                     <div className="bg-black/50 p-3 rounded-xl mb-6 border border-white/5">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Access Key</span>
                           {editingCreds?.id === m.id ? (
                              <button onClick={() => { updateMerchant(m.id, { credentials: tempCreds }); setEditingCreds(null); }} className="text-xs font-bold text-green-400 hover:text-green-300">Save</button>
                           ) : (
                              <button onClick={() => { setEditingCreds({id: m.id, type: 'merchant'}); setTempCreds(m.credentials || ''); }} className="text-xs font-bold text-blue-400 hover:text-blue-300">Edit</button>
                           )}
                        </div>
                        {editingCreds?.id === m.id ? (
                           <input autoFocus value={tempCreds} onChange={(e) => setTempCreds(e.target.value)} className="w-full mt-2 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white font-mono outline-none" placeholder="Enter new pin..." />
                        ) : (
                           <p className="text-sm font-mono text-gray-300 mt-1">{m.credentials || 'Not Set'}</p>
                        )}
                     </div>
                     
                     <button onClick={() => toggleMerchantStatus(m.id)} className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center transition-all border border-white/10 hover:bg-white/5 active:scale-95">
                        <Power size={14} className={`mr-2 ${m.isOffline ? 'text-green-400' : 'text-red-400'}`} /> {m.isOffline ? 'Force Online' : 'Force Offline'}
                     </button>
                  </div>
               ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'fleet' && (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 space-y-6">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold text-white tracking-wide">Dynamic Rider Pool</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {agents.map(a => {
                  const assignedOrder = allOrders.find(o => o.agentId === a.id && o.status !== 'DELIVERED' && o.status !== 'DENIED');
                  return (
                  <div key={a.id} className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10 relative">
                     <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl text-black ${a.isOnline ? 'bg-lime-500' : 'bg-gray-400'}`}>
                           {a.id.toUpperCase()}
                        </div>
                        <div>
                           <h3 className="font-extrabold text-lg text-white leading-tight">{a.name}</h3>
                           <p className="text-xs font-bold text-gray-400">{a.phone}</p>
                        </div>
                     </div>
                     <div className="bg-black/50 p-3 rounded-xl mb-4 border border-white/5">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Access Key</span>
                           {editingCreds?.id === a.id ? (
                              <button onClick={() => { updateAgent(a.id, { credentials: tempCreds }); setEditingCreds(null); }} className="text-xs font-bold text-green-400 hover:text-green-300">Save</button>
                           ) : (
                              <button onClick={() => { setEditingCreds({id: a.id, type: 'agent'}); setTempCreds(a.credentials || ''); }} className="text-xs font-bold text-blue-400 hover:text-blue-300">Edit</button>
                           )}
                        </div>
                        {editingCreds?.id === a.id ? (
                           <input autoFocus value={tempCreds} onChange={(e) => setTempCreds(e.target.value)} className="w-full mt-2 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white font-mono outline-none" placeholder="Enter new pin..." />
                        ) : (
                           <p className="text-sm font-mono text-gray-300 mt-1">{a.credentials || 'Not Set'}</p>
                        )}
                     </div>
                     
                     {a.isOnline ? (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                           <div className="flex justify-between items-center mb-2">
                              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Current State</p>
                              {assignedOrder ? (
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">BUSY</span>
                              ) : (
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-400 border border-lime-500/30">FREE</span>
                              )}
                           </div>
                           {assignedOrder ? (
                              <p className="text-orange-400 font-extrabold text-sm truncate">Routing to: {assignedOrder.customerLandmark}</p>
                           ) : (
                              <p className="text-lime-400 font-extrabold text-sm">Standby - Available Sequential</p>
                           )}
                        </div>
                     ) : (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Current State</p>
                            <p className="text-red-400 font-extrabold text-sm">Offline - Off Duty</p>
                        </div>
                     )}
                     
                     <button onClick={() => toggleAgentStatus(a.id)} className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center transition-all border border-white/10 hover:bg-white/5 active:scale-95">
                        <Power size={14} className={`mr-2 ${a.isOnline ? 'text-red-400' : 'text-green-400'}`} /> {a.isOnline ? 'Force Rider Offline' : 'Force Rider Online'}
                     </button>
                  </div>
               )})}
            </div>
          </motion.div>
        )}

        {activeTab === 'inventory' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-4xl mx-auto">
             <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                <div className="grid grid-cols-1 gap-4">
                  {products.map(product => {
                    const merchantName = merchants.find(m => m.id === product.merchantId)?.name;
                    return (
                      <div key={product.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center group hover:bg-white/10 transition-colors">
                        <div className="flex items-center space-x-4 w-1/2">
                          <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-gray-500 overflow-hidden shrink-0">
                             {product.photoUrl ? <img src={product.photoUrl} className="w-full h-full object-cover" /> : <ImageIcon size={18}/>}
                          </div>
                          <div>
                            <h3 className="font-bold text-white truncate">{product.name}</h3>
                            <p className="text-xs text-gray-400 font-medium truncate">{merchantName}</p>
                          </div>
                        </div>
                        <div className="font-mono text-[var(--color-secondary)] font-bold shrink-0">₹{product.price}</div>
                        <button onClick={() => openOverride(product)} className="text-gray-400 hover:text-white bg-white/5 p-3 rounded-xl transition-colors shrink-0">
                           <Edit2 size={16} />
                        </button>
                      </div>
                    )
                  })}
                </div>
             </div>
           </motion.div>
        )}

        {activeTab === 'financials' && (() => {
           const deliveredCount = allOrders.filter(o => o.status === 'DELIVERED').length;
           const gmv = allOrders.filter(o => o.status === 'DELIVERED').reduce((acc,o)=>acc+o.total,0);
           const platformCommission = gmv * 0.10; // Approx aggregate
           const deliveryFeesCollected = deliveredCount * 15;
           const riderPayouts = deliveredCount * 20;
           const netPlatformRevenue = (platformCommission + deliveryFeesCollected) - riderPayouts;
           
           return (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-4xl mx-auto space-y-6">
                 <div className="bg-gradient-to-br from-gray-900 to-black p-10 rounded-[3rem] border border-white/20 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    <div className="relative z-10 flex flex-col justify-center items-center text-center">
                       <p className="text-green-400 font-extrabold tracking-widest uppercase text-xs mb-2">Platform Net Profits</p>
                       <h2 className="text-7xl font-black text-white">₹{netPlatformRevenue.toFixed(0)}</h2>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                       <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Gross Merchandise Value (GMV)</p>
                       <p className="text-3xl font-extrabold text-white">₹{gmv.toFixed(0)}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                       <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Merchant Payouts Matrix</p>
                       <p className="text-3xl font-extrabold text-blue-400">₹{(gmv - platformCommission).toFixed(0)}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                       <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Total Delivery Surcharges Collected</p>
                       <p className="text-3xl font-extrabold text-[#FFD700]">₹{deliveryFeesCollected}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                       <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Fleet Disbursements / Subsidies</p>
                       <p className="text-3xl font-extrabold text-red-500">-₹{riderPayouts}</p>
                    </div>
                 </div>
              </motion.div>
           );
        })()}

        {/* Modals */}
        <AnimatePresence>
          {selectedOrder && (
            <div key="order-modal" className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
               <motion.div initial={{ y: 50, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-gray-900 rounded-[2rem] shadow-2xl p-8 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto">
                 <div className="flex justify-between items-center mb-6">
                   <div>
                     <h2 className="text-2xl font-extrabold text-white">Trace Overview</h2>
                     <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">Ref #{selectedOrder.id}</p>
                   </div>
                   <button onClick={() => setSelectedOrder(null)} className="bg-white/10 text-gray-400 p-2 rounded-full hover:bg-white/20 hover:text-white transition-colors"><X size={20}/></button>
                 </div>
                 
                 <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                         <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">State</p>
                         <p className={`font-extrabold text-sm ${selectedOrder.status === 'DELIVERED' ? 'text-green-400' : 'text-blue-400'}`}>{selectedOrder.status}</p>
                      </div>
                      <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                         <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Assigned Agent</p>
                         <p className="font-extrabold text-sm text-[var(--color-secondary)]">
                            {agents.find(a => a.id === selectedOrder.agentId)?.name || <span className="text-red-500">NO AGENT ONLINE</span>}
                         </p>
                      </div>
                   </div>

                   <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Customer Coordinates</p>
                      <p className="font-bold text-white text-sm">{selectedOrder.customerAddress}</p>
                      <p className="text-xs text-gray-400 font-medium mt-1">Landmark: {selectedOrder.customerLandmark}</p>
                   </div>

                   <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                      <p className="text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest mb-3">Manual Agent Override</p>
                      <div className="flex space-x-2">
                         <select 
                            id="agent-override-select"
                            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none appearance-none"
                            defaultValue={selectedOrder.agentId || ""}
                         >
                            <option value="" disabled className="text-black">Select an agent...</option>
                            {agents.map(ag => (
                               <option key={ag.id} value={ag.id} className="text-black">{ag.name} ({ag.isOnline ? 'Online' : 'Offline'})</option>
                            ))}
                         </select>
                         <button 
                            onClick={() => {
                               const selectEl = document.getElementById('agent-override-select') as HTMLSelectElement;
                               if (selectEl && selectEl.value) {
                                  reassignAgent(selectedOrder.id, selectEl.value);
                                  setSelectedOrder({...selectedOrder, agentId: selectEl.value});
                               }
                            }}
                            className="bg-[var(--color-secondary)] text-black px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform"
                         >
                            Assign
                         </button>
                      </div>
                   </div>

                   <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Cart Logistics</p>
                      <ul className="space-y-2">
                        {selectedOrder.items.map((item: any) => {
                           const merchantName = merchants.find(m => m.id === item.merchantId)?.name || 'Unknown Store';
                           return (
                             <li key={item.id} className="flex justify-between items-start text-sm border-b border-white/10 last:border-0 pb-2 last:pb-0">
                               <div>
                                 <p className="font-bold text-white">{item.quantity}x {item.name}</p>
                                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{merchantName}</p>
                               </div>
                               <span className="font-mono font-bold text-gray-300">₹{item.price * item.quantity}</span>
                             </li>
                           )
                        })}
                      </ul>
                      <div className="border-t border-white/20 mt-3 pt-3 flex justify-between items-center text-sm">
                         <span className="font-black text-gray-400 uppercase tracking-widest">Revenue Net</span>
                         <span className="font-extrabold text-[var(--color-secondary)] text-lg">₹{selectedOrder.total}</span>
                      </div>
                   </div>
                 </div>
               </motion.div>
            </div>
          )}
          {isAddingMerchant && (
            <div key="add-merchant-modal" className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
               <motion.div initial={{ y: 50, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-gray-900 rounded-[2rem] shadow-2xl p-8 w-full max-w-md border border-white/10">
                 <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-extrabold text-white">Add New Merchant</h2>
                   <button onClick={() => setIsAddingMerchant(false)} className="bg-white/10 text-gray-400 p-2 rounded-full hover:bg-white/20 hover:text-white transition-colors"><X size={20}/></button>
                 </div>
                 <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Store Name</label>
                      <input value={mName} onChange={e=>setMName(e.target.value)} className="w-full bg-white/10 border border-white/20 p-3 rounded-xl focus:border-[var(--color-primary)] outline-none font-bold text-white" placeholder="e.g. Fresh Mart" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Avg Delivery Time</label>
                      <input value={mTime} onChange={e=>setMTime(e.target.value)} className="w-full bg-white/10 border border-white/20 p-3 rounded-xl focus:border-[var(--color-primary)] outline-none font-bold text-white" placeholder="e.g. 15 mins" />
                   </div>
                   <button onClick={handleAddMerchant} className="w-full bg-white text-black font-extrabold py-4 rounded-xl active:scale-95 transition-transform mt-6">
                      Register Merchant
                   </button>
                 </div>
               </motion.div>
            </div>
          )}

          {editingItem && (
            <div key="edit-item-modal" className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
               <motion.div initial={{ y: 50, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-gray-900 rounded-[2rem] shadow-2xl p-8 w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto">
                 <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-extrabold text-white">Override Catalog Item</h2>
                   <button onClick={() => setEditingItem(null)} className="bg-white/10 text-gray-400 p-2 rounded-full hover:bg-white/20 hover:text-white transition-colors"><X size={20}/></button>
                 </div>
                 <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Item Name</label>
                      <input value={fName} onChange={e=>setFName(e.target.value)} className="w-full bg-white/10 border border-white/20 p-3 rounded-xl focus:border-[var(--color-primary)] outline-none font-bold text-white" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Selling Price (₹)</label>
                      <input value={fPrice} onChange={e=>setFPrice(e.target.value.replace(/\D/g, ''))} className="w-full bg-white/10 border border-white/20 p-3 rounded-xl focus:border-[var(--color-primary)] outline-none font-bold text-white" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                      <textarea value={fDesc} onChange={e=>setFDesc(e.target.value)} className="w-full bg-white/10 border border-white/20 p-3 rounded-xl focus:border-[var(--color-primary)] outline-none text-sm text-gray-300" rows={2}></textarea>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Item Photo (Base64/URL)</label>
                      <div className="flex space-x-3">
                         <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center bg-white/10 border border-white/20 rounded-xl px-4 py-3 shrink-0 hover:bg-white/20 transition-colors">
                            <UploadCloud size={20} className="text-white" />
                         </button>
                         <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                         <input value={fPhoto} onChange={e=>setFPhoto(e.target.value)} className="w-full bg-white/10 border border-white/20 p-3 rounded-xl focus:border-[var(--color-primary)] outline-none text-xs font-mono text-gray-300" />
                      </div>
                      {fPhoto && (
                          <div className="mt-3 w-full h-32 bg-black/40 rounded-xl overflow-hidden border border-white/10">
                             <img src={fPhoto} className="w-full h-full object-cover" />
                          </div>
                      )}
                   </div>
                   <button onClick={saveOverride} className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-green-500/20 active:scale-95 transition-transform mt-6">
                      Save Override
                   </button>
                 </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
