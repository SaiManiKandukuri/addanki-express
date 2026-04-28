"use client";

import { useAppStore, Merchant, Product, Banner, Agent } from "@/store/useStore";
import { LogOut, Activity, Users, Box, AlertTriangle, Plus, Edit2, X, Image as ImageIcon, Power, Truck, UploadCloud, Megaphone, Trash2, DollarSign, ShieldAlert, UserX, BarChart3, Phone } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const allOrders = useAppStore(state => state.orders);
  const merchants = useAppStore(state => state.merchants);
  const products = useAppStore(state => state.products);
  const agents = useAppStore(state => state.agents);
  const banners = useAppStore(state => state.banners);
  const allCustomers = useAppStore(state => state.allCustomers);
  const toggleCustomerBlock = useAppStore(state => state.toggleCustomerBlock);
  const addAgent = useAppStore(state => state.addAgent);
  const removeAgent = useAppStore(state => state.removeAgent);
  
  const categories = useAppStore(state => state.categories);
  const addCategory = useAppStore(state => state.addCategory);
  const updateCategory = useAppStore(state => state.updateCategory);
  const removeCategory = useAppStore(state => state.removeCategory);
  
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

  const [activeTab, setActiveTab] = useState<"live" | "merchants" | "inventory" | "fleet" | "promos" | "financials" | "customers" | "categories">("live");
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

  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [aName, setAName] = useState("");
  const [aPhone, setAPhone] = useState("");
  const [aCreds, setACreds] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);

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

  const handleAddAgent = () => {
    if (!aName || !aPhone) return;
    addAgent({
      id: "a" + Math.random().toString().substring(2, 6),
      name: aName,
      phone: aPhone,
      isOnline: false,
      credentials: aCreds || undefined,
    });
    setAName(""); setAPhone(""); setACreds(""); setIsAddingAgent(false);
  };

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [catName, setCatName] = useState("");
  const [catPhoto, setCatPhoto] = useState("");
  const [catOrder, setCatOrder] = useState("0");
  const [catProductIds, setCatProductIds] = useState<string[]>([]);

  const handleCategoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCatPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const [isSavingCat, setIsSavingCat] = useState(false);
  const handleAddCategory = async () => {
    if (!catName) {
      alert("Please enter a section name");
      return;
    }
    
    setIsSavingCat(true);
    try {
      const newCat = {
        id: "cat" + Math.random().toString().substring(2, 6),
        name: catName,
        photoUrl: catPhoto,
        displayOrder: Number(catOrder),
        productIds: catProductIds,
        type: 'section' as const
      };
      
      addCategory(newCat);
      setCatName(""); setCatPhoto(""); setCatOrder("0"); setCatProductIds([]); setIsAddingCategory(false);
      alert("Section created successfully!");
    } catch (err: any) {
      alert("Failed to create section: " + err.message);
    } finally {
      setIsSavingCat(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex h-screen overflow-hidden font-sans">
      <div className="w-72 bg-white/5 border-r border-white/10 flex flex-col hidden md:flex backdrop-blur-3xl z-20">
        <div className="p-8 font-extrabold text-2xl border-b border-white/10 text-[var(--color-secondary)] tracking-tight">
          Admin Core <div className="text-xs text-white/40 tracking-widest uppercase mt-1">Addanki Mart</div>
        </div>
        <div className="p-4 space-y-2 flex-1 mt-4">
          <button onClick={()=>setActiveTab('live')} className={`w-full px-5 py-4 rounded-2xl flex items-center font-bold transition-all ${activeTab === 'live' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 text-md tracking-wide' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><Activity className="mr-3" size={20}/> Live Operations</button>
          <button onClick={()=>setActiveTab('merchants')} className={`w-full px-5 py-4 rounded-2xl flex items-center font-bold transition-all ${activeTab === 'merchants' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 text-md tracking-wide' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><Users className="mr-3" size={20}/> Partnerships</button>
          <button onClick={()=>setActiveTab('inventory')} className={`w-full px-5 py-4 rounded-2xl flex items-center font-bold transition-all ${activeTab === 'inventory' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 text-md tracking-wide' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><Box className="mr-3" size={20}/> Global Catalog</button>
          <button onClick={()=>setActiveTab('fleet')} className={`w-full px-5 py-4 rounded-2xl flex items-center font-bold transition-all ${activeTab === 'fleet' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 text-md tracking-wide' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><Truck className="mr-3" size={20}/> Delivery Fleet</button>
          <button onClick={()=>setActiveTab('categories')} className={`w-full px-5 py-4 rounded-2xl flex items-center font-bold transition-all ${activeTab === 'categories' ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/20 text-md tracking-wide' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><Box className="mr-3" size={20}/> Custom Sections</button>
          <button onClick={()=>setActiveTab('promos')} className={`w-full px-5 py-4 rounded-2xl flex items-center font-bold transition-all ${activeTab === 'promos' ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/20 text-md tracking-wide' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><Megaphone className="mr-3" size={20}/> Marketing Banners</button>
          <button onClick={()=>setActiveTab('financials')} className={`w-full px-5 py-4 rounded-2xl flex items-center font-bold transition-all ${activeTab === 'financials' ? 'bg-gradient-to-r from-[var(--color-primary)] to-green-800 text-white shadow-lg shadow-green-500/20 text-md tracking-wide' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><DollarSign className="mr-3" size={20}/> Platform Revenue</button>
          <button onClick={()=>setActiveTab('customers')} className={`w-full px-5 py-4 rounded-2xl flex items-center font-bold transition-all ${activeTab === 'customers' ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/20 text-md tracking-wide' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><ShieldAlert className="mr-3" size={20}/> Customers</button>
        </div>
        <button onClick={() => setRole(null)} className="p-8 text-gray-500 font-bold flex items-center hover:text-red-400 transition-colors uppercase tracking-widest text-xs"><LogOut className="mr-3 text-red-500" size={16}/> Terminate Session</button>
      </div>

      <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto w-full relative z-0">
        <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none"></div>

        <div className="flex justify-between items-center mb-10 relative z-10">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              {activeTab === 'live' ? 'Command Center' : activeTab === 'merchants' ? 'Merchant Partners' : activeTab === 'fleet' ? 'Fleet Operations' : activeTab === 'promos' ? 'Marketing' : activeTab === 'financials' ? 'Global Revenue' : activeTab === 'customers' ? 'Customer Management' : 'Global Catalog'}
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
               <button onClick={() => setIsAddingAgent(true)} className="bg-lime-500 text-black px-6 py-3 rounded-xl font-bold flex items-center active:scale-95 transition-transform text-sm tracking-wide">
                  <Plus size={18} className="mr-2" /> Add Agent
               </button>
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
                     <button onClick={() => removeAgent(a.id)} className="w-full mt-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center transition-all border border-red-500/20 text-red-400 hover:bg-red-500/10 active:scale-95">
                        <Trash2 size={12} className="mr-2" /> Remove Agent
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
           const cancelledCount = allOrders.filter(o => o.status === 'CANCELLED').length;
           const pendingCount = allOrders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING').length;
           const activeCount = allOrders.filter(o => o.status === 'OUT_FOR_DELIVERY' || o.status === 'READY_FOR_PICKUP').length;
           const totalOrders = allOrders.length;
           const gmv = allOrders.filter(o => o.status === 'DELIVERED').reduce((acc,o)=>acc+o.total,0);
           const platformCommission = gmv * 0.10;
           const deliveryFeesCollected = deliveredCount * 15;
           const riderPayouts = deliveredCount * 20;
           const netPlatformRevenue = (platformCommission + deliveryFeesCollected) - riderPayouts;
           const avgOrderValue = deliveredCount > 0 ? (gmv / deliveredCount).toFixed(0) : '0';

           // Donut chart data
           const donutData = [
             { label: 'Commission', value: platformCommission, color: '#4ade80' },
             { label: 'Delivery Fees', value: deliveryFeesCollected, color: '#facc15' },
             { label: 'Rider Payouts', value: riderPayouts, color: '#ef4444' },
           ];
           const donutTotal = donutData.reduce((a,d) => a+d.value, 0) || 1;
           let donutOffset = 0;

           // Bar chart data
           const barData = [
             { label: 'Delivered', value: deliveredCount, color: '#4ade80' },
             { label: 'Active', value: activeCount, color: '#3b82f6' },
             { label: 'Pending', value: pendingCount, color: '#f59e0b' },
             { label: 'Cancelled', value: cancelledCount, color: '#ef4444' },
           ];
           const barMax = Math.max(...barData.map(b => b.value), 1);
           
           return (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-5xl mx-auto space-y-6">
                 {/* KPI Cards */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6"><p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">GMV</p><p className="text-4xl font-black text-white">₹{gmv}</p></div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6"><p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Net Revenue</p><p className="text-4xl font-black text-green-400">₹{netPlatformRevenue.toFixed(0)}</p></div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6"><p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Total Orders</p><p className="text-4xl font-black text-blue-400">{totalOrders}</p></div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6"><p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Avg Order ₹</p><p className="text-4xl font-black text-[#FFD700]">₹{avgOrderValue}</p></div>
                 </div>

                 {/* Charts Row */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Donut Chart */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                       <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Revenue Breakdown</h3>
                       <div className="flex items-center justify-center">
                          <svg viewBox="0 0 42 42" className="w-48 h-48">
                             <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#333" strokeWidth="5" />
                             {donutData.map((d, i) => {
                                const pct = (d.value / donutTotal) * 100;
                                const dash = `${pct} ${100 - pct}`;
                                const offset = donutOffset;
                                donutOffset += pct;
                                return <circle key={i} cx="21" cy="21" r="15.9" fill="transparent" stroke={d.color} strokeWidth="5" strokeDasharray={dash} strokeDashoffset={-offset + 25} strokeLinecap="round" />;
                             })}
                             <text x="21" y="20" textAnchor="middle" className="fill-white text-[5px] font-black">₹{netPlatformRevenue.toFixed(0)}</text>
                             <text x="21" y="24" textAnchor="middle" className="fill-gray-400 text-[2.5px] font-bold">NET PROFIT</text>
                          </svg>
                       </div>
                       <div className="flex justify-center space-x-4 mt-4">
                          {donutData.map((d,i) => (
                             <div key={i} className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background:d.color}}></div><span className="text-[10px] font-bold text-gray-400">{d.label}</span></div>
                          ))}
                       </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                       <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Orders by Status</h3>
                       <div className="space-y-4 mt-6">
                          {barData.map((b,i) => (
                             <div key={i}>
                                <div className="flex justify-between mb-1"><span className="text-xs font-bold text-gray-300">{b.label}</span><span className="text-xs font-black text-white">{b.value}</span></div>
                                <div className="w-full h-6 bg-white/5 rounded-full overflow-hidden"><motion.div initial={{width:0}} animate={{width:`${(b.value/barMax)*100}%`}} transition={{duration:0.8,delay:i*0.1}} className="h-full rounded-full" style={{background:b.color}}/></div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* Breakdown Table */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                       <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Revenue Ledger</h3>
                       <div className="space-y-3">
                          <div className="flex justify-between font-bold text-sm border-b border-white/5 pb-2"><span className="text-gray-400">Gross Sales</span><span className="text-white">₹{gmv}</span></div>
                          <div className="flex justify-between font-bold text-sm border-b border-white/5 pb-2"><span className="text-green-400">Commission (10%)</span><span className="text-green-400">+₹{platformCommission.toFixed(0)}</span></div>
                          <div className="flex justify-between font-bold text-sm border-b border-white/5 pb-2"><span className="text-yellow-400">Delivery Fees</span><span className="text-yellow-400">+₹{deliveryFeesCollected}</span></div>
                          <div className="flex justify-between font-bold text-sm border-b border-white/5 pb-2"><span className="text-red-400">Rider Payouts</span><span className="text-red-400">-₹{riderPayouts}</span></div>
                          <div className="flex justify-between font-black text-lg pt-1"><span className="text-green-400">Net Profit</span><span className="text-green-400">₹{netPlatformRevenue.toFixed(0)}</span></div>
                       </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-center items-center text-center">
                       <BarChart3 size={48} className="text-green-500 mb-3 opacity-60" />
                       <p className="text-sm font-bold text-gray-400">Merchant payouts: <span className="text-blue-400 font-extrabold">₹{(gmv - platformCommission).toFixed(0)}</span></p>
                       <p className="text-sm font-bold text-gray-400 mt-1">Active stores: <span className="text-white font-extrabold">{merchants.filter(m=>!m.isOffline).length}</span></p>
                    </div>
                 </div>
              </motion.div>
           );
        })()}

        {/* ====== Customers Tab ====== */}
        {activeTab === 'customers' && (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-4xl mx-auto space-y-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden">
                 <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                       <h2 className="text-lg font-bold text-white tracking-wide">Registered Customers</h2>
                       <p className="text-gray-400 text-xs mt-1">{allCustomers.length} total accounts</p>
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-white/5 border-b border-white/5 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                          <tr>
                             <th className="px-8 py-5">Customer</th>
                             <th className="px-8 py-5">Phone</th>
                             <th className="px-8 py-5">Orders</th>
                             <th className="px-8 py-5">Status</th>
                             <th className="px-8 py-5">Action</th>
                          </tr>
                       </thead>
                       <tbody>
                          {allCustomers.length === 0 ? (
                             <tr><td colSpan={5} className="px-8 py-10 text-center text-gray-500 font-bold">No customers registered yet</td></tr>
                          ) : allCustomers.map(customer => {
                             const customerOrders = allOrders.filter(o => o.customerAddress?.includes(customer.deliveryAddress || '---'));
                             return (
                                <tr key={customer.id} className="border-b border-white/5 text-sm hover:bg-white/5 transition-colors">
                                   <td className="px-8 py-5">
                                      <p className="font-bold text-white">{customer.name}</p>
                                      <p className="text-xs text-gray-500">{customer.email || 'No email'}</p>
                                   </td>
                                   <td className="px-8 py-5 font-mono text-gray-300">{customer.phone || '-'}</td>
                                   <td className="px-8 py-5 font-bold text-[var(--color-secondary)]">{customerOrders.length}</td>
                                   <td className="px-8 py-5">
                                      {customer.isBlocked ? (
                                         <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/30">🚩 Blocked</span>
                                      ) : (
                                         <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/20 text-green-400 border border-green-500/30">Active</span>
                                      )}
                                   </td>
                                   <td className="px-8 py-5">
                                      <button onClick={() => toggleCustomerBlock(customer.id!)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest active:scale-95 transition-all border ${customer.isBlocked ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' : 'border-red-500/30 text-red-400 hover:bg-red-500/10'}`}>
                                         {customer.isBlocked ? 'Unblock' : '🚩 Red Flag'}
                                      </button>
                                   </td>
                                </tr>
                             );
                          })}
                       </tbody>
                    </table>
                 </div>
              </div>
           </motion.div>
        )}
        {activeTab === 'categories' && (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center space-x-4">
                    <div className="bg-pink-500/10 p-3 rounded-2xl border border-pink-500/20">
                       <Box className="text-pink-400" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Custom Sections</h2>
                 </div>
                 <button onClick={() => setIsAddingCategory(true)} className="bg-white text-black px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-transform shadow-lg flex items-center">
                    <Plus className="mr-2" size={18}/> Create New Section
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {categories.map(cat => (
                    <div key={cat.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden group">
                       <div className="h-40 relative">
                          {cat.photoUrl ? <img src={cat.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/5 flex items-center justify-center"><ImageIcon size={40} className="text-white/10"/></div>}
                          <div className="absolute top-4 right-4 flex space-x-2">
                             <button onClick={() => removeCategory(cat.id)} className="p-2 bg-black/50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                          </div>
                          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">Order: {cat.displayOrder}</div>
                       </div>
                       <div className="p-6">
                          <h3 className="text-xl font-black text-white mb-2">{cat.name}</h3>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{cat.productIds.length} Linked Products</p>
                          <div className="flex flex-wrap gap-2">
                             {cat.productIds.slice(0, 3).map(pid => {
                                const p = products.find(prod => prod.id === pid);
                                return p ? <span key={pid} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-400 font-bold">{p.name}</span> : null;
                             })}
                             {cat.productIds.length > 3 && <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-400 font-bold">+{cat.productIds.length - 3} more</span>}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </motion.div>
        )}

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

          {isAddingAgent && (
            <div key="add-agent-modal" className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
               <motion.div initial={{ y: 50, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-gray-900 rounded-[2rem] shadow-2xl p-8 w-full max-w-md border border-white/10">
                 <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-extrabold text-white">Add New Agent</h2>
                   <button onClick={() => setIsAddingAgent(false)} className="bg-white/10 text-gray-400 p-2 rounded-full hover:bg-white/20 hover:text-white transition-colors"><X size={20}/></button>
                 </div>
                 <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Agent Name</label>
                      <input value={aName} onChange={e=>setAName(e.target.value)} className="w-full bg-white/10 border border-white/20 p-3 rounded-xl focus:border-lime-500 outline-none font-bold text-white" placeholder="e.g. Ravi Kumar" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                      <input value={aPhone} onChange={e=>setAPhone(e.target.value)} className="w-full bg-white/10 border border-white/20 p-3 rounded-xl focus:border-lime-500 outline-none font-bold text-white" placeholder="e.g. 9876543210" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Access Key (PIN)</label>
                      <input value={aCreds} onChange={e=>setACreds(e.target.value)} className="w-full bg-white/10 border border-white/20 p-3 rounded-xl focus:border-lime-500 outline-none font-bold text-white" placeholder="e.g. 1234" />
                   </div>
                   <button onClick={handleAddAgent} className="w-full bg-lime-500 text-black font-extrabold py-4 rounded-xl active:scale-95 transition-transform mt-6">
                      Register Agent
                   </button>
                 </div>
               </motion.div>
            </div>
          )}
          {isAddingCategory && (
            <div key="add-category-modal" className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
               <motion.div initial={{ y: 50, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-gray-900 rounded-[2rem] shadow-2xl p-8 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto">
                 <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-extrabold text-white">Create Section</h2>
                   <button onClick={() => setIsAddingCategory(false)} className="bg-white/10 text-gray-400 p-2 rounded-full hover:bg-white/20 hover:text-white transition-colors"><X size={20}/></button>
                 </div>
                 <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Section Name</label>
                      <input value={catName} onChange={e=>setCatName(e.target.value)} className="w-full bg-white/10 border border-white/20 p-3 rounded-xl focus:border-pink-500 outline-none font-bold text-white" placeholder="e.g. Trending Now" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Display Order</label>
                         <input type="number" value={catOrder} onChange={e=>setCatOrder(e.target.value)} className="w-full bg-white/10 border border-white/20 p-3 rounded-xl focus:border-pink-500 outline-none font-bold text-white" />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Section Icon/Photo</label>
                         <div className="flex space-x-2">
                            <button onClick={() => categoryInputRef.current?.click()} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-colors border border-white/10"><UploadCloud size={20}/></button>
                            <input type="file" ref={categoryInputRef} onChange={handleCategoryUpload} className="hidden" />
                            {catPhoto && <img src={catPhoto} className="w-10 h-10 rounded-lg object-cover border border-white/20" />}
                         </div>
                      </div>
                   </div>
                   
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Add Products to Section</label>
                      <div className="bg-black/50 border border-white/10 rounded-2xl p-4 max-h-60 overflow-y-auto space-y-2">
                         {products.map(p => (
                            <label key={p.id} className="flex items-center space-x-3 cursor-pointer group">
                               <input 
                                 type="checkbox" 
                                 checked={catProductIds.includes(p.id)} 
                                 onChange={(e) => {
                                    if (e.target.checked) setCatProductIds([...catProductIds, p.id]);
                                    else setCatProductIds(catProductIds.filter(id => id !== p.id));
                                 }}
                                 className="w-4 h-4 rounded border-white/20 bg-white/10 text-pink-500 focus:ring-0"
                               />
                               <div className="flex-1">
                                  <p className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{p.name}</p>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">₹{p.price} • {merchants.find(m => m.id === p.merchantId)?.name}</p>
                               </div>
                            </label>
                         ))}
                      </div>
                   </div>

                   <button 
                     onClick={handleAddCategory} 
                     disabled={isSavingCat}
                     className={`w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-extrabold py-4 rounded-xl active:scale-95 transition-transform mt-6 shadow-lg shadow-pink-500/20 flex items-center justify-center ${isSavingCat ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                      {isSavingCat ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          SAVING TO DB...
                        </>
                      ) : 'Create Section'}
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
