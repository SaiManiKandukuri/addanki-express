"use client";

import { useAppStore, Order } from "@/store/useStore";
import { CheckCircle2, Circle, Clock, Home, Package, MapPin, ArrowLeft, AlertTriangle, X, ShoppingBag, Store, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function TrackingPage() {
  const orders = useAppStore(state => state.orders);
  const merchants = useAppStore(state => state.merchants);
  const cancelOrder = useAppStore(state => state.cancelOrder);
  const isTelugu = useAppStore(state => state.isTelugu);
  const t = (en: string, te: string) => isTelugu ? te : en;
  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'DENIED' && o.status !== 'CANCELLED' && o.status !== 'RETURN_REQUESTED');

  const [hasLocationAccess, setHasLocationAccess] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  useEffect(() => {
     if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
           () => setHasLocationAccess(true),
           () => setHasLocationAccess(false)
        );
     }
  }, []);
  
  if (activeOrders.length === 0) {
    const hasDenied = orders.some(o => o.status === 'DENIED');
    if (hasDenied) {
      return (
        <div className="min-h-screen bg-[var(--color-softcream)] flex flex-col p-4 max-w-md mx-auto justify-center items-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-6 border border-red-200">
             <AlertTriangle size={48} />
          </motion.div>
          <h1 className="text-3xl font-black text-gray-900 text-center mb-2 tracking-tight">{t("Order Denied", "ఆర్డర్‌ను తిరస్కరించారు")}</h1>
          <p className="text-gray-500 text-center font-medium mb-8 px-6 leading-relaxed text-sm">
            {t("The merchant is currently overwhelmed and unable to accept new tickets. Please try another nearby store from the main hub.", "ప్రస్తుతం వ్యాపారి ఎక్కువ బిజీగా ఉన్నారు. దయచేసి మరొక దుకాణాన్ని ప్రయత్నించండి.")}
          </p>
          <Link href="/customer" className="bg-gray-900 text-white font-bold uppercase tracking-widest w-full max-w-xs py-4 rounded-xl text-center shadow-lg active:scale-95 transition-transform text-xs">
            {t("Return Home", "హోమ్‌కు వెళ్ళండి")}
          </Link>
        </div>
      );
    }
    return <div className="p-4 text-center mt-20">{t("No active tracking queues found.", "క్యూలో యాక్టివ్ ఆర్డర్ లేదు")} <Link href="/customer" className="text-blue-500 font-bold underline">{t("Go Home", "హోమ్‌కు వెళ్ళండి")}</Link></div>;
  }

  const steps = [
    { status: 'PENDING', title: t('Order Placed', 'ఆర్డర్ ఉంచబడింది'), icon: Clock },
    { status: 'PREPARING', title: t('Preparing', 'తయారీ'), icon: Package },
    { status: 'OUT_FOR_DELIVERY', title: t('Out for Delivery', 'డెలివరీకి సిద్ధం'), icon: MapPin },
    { status: 'DELIVERED', title: t('Arrived', 'వచ్చింది'), icon: Home }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-softcream)] flex flex-col p-4 max-w-md mx-auto space-y-6">
      <div className="flex items-center">
         <Link href="/customer" className="p-3 bg-white rounded-full shadow-sm active:scale-95 border border-gray-100 mr-4">
           <ArrowLeft size={18} />
         </Link>
         <h1 className="text-xl font-black text-gray-900 tracking-tight">{t("Live Tracking", "లైవ్ ట్రాకింగ్")}</h1>
      </div>
      
      {!hasLocationAccess && (
         <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex flex-col mb-2">
            <p className="text-xs font-bold text-orange-800 uppercase tracking-widest mb-1">{t("GPS Requested", "GPS రిక్వెస్ట్")}</p>
            <p className="text-sm text-orange-700 font-medium">{t("Enable browser location permissions to show exact delivery maps.", "సరైన రూట్ పొందడానికి బ్రౌజర్‌లో లోకేషన్ పర్మిషన్ యివ్వండి.")}</p>
         </div>
      )}

      {activeOrders.map(activeOrder => {
         let rawStatusIndex = steps.findIndex(s => s.status === activeOrder.status);
         if (activeOrder.status === 'READY_FOR_PICKUP') rawStatusIndex = 1;
         const currentStep = rawStatusIndex === -1 ? 0 : rawStatusIndex; 
         const isExpanded = expandedOrder === activeOrder.id;
         const canCancel = activeOrder.status === 'PENDING' || activeOrder.status === 'PREPARING';

         return (
            <motion.div key={activeOrder.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{t("Reference", "రిఫరెన్స్ #")} #{activeOrder.id}</p>
                   <p className="font-extrabold text-gray-900">{t("Destination:", "గమ్యం:")} {activeOrder.customerLandmark}</p>
                 </div>
                 <div className="bg-[var(--color-secondary)]/10 border border-dashed border-[var(--color-secondary)] px-3 py-1.5 rounded-xl text-center">
                   <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{t("Identity Code", "OTP కోడ్")}</p>
                   <p className="text-xl font-black tracking-widest text-gray-900">{activeOrder.deliveryOTP}</p>
                 </div>
               </div>

               {/* Map Widget */}
               {(() => {
                  const markerPositions = [
                     { x: 15, y: 15 },
                     { x: 15, y: 15 },
                     { x: 50, y: 50 },
                     { x: 85, y: 85 }
                  ];
                  const pos = markerPositions[currentStep] || markerPositions[0];
                  const etaMins = Math.max(0, (3 - currentStep) * 5 + 2);

                  return (
                    <div className="w-full h-48 bg-gray-50 rounded-2xl border border-gray-200 mb-6 relative overflow-hidden flex items-center justify-center isolate">
                       {currentStep < 3 && (
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl px-3 py-2 shadow-sm z-20 flex items-center space-x-2">
                             <Clock size={14} className="text-[var(--color-primary)] animate-pulse" />
                             <div>
                                <p className="text-[8px] uppercase tracking-widest font-black text-gray-400 leading-none">Est. Arrival</p>
                                <p className="font-extrabold text-gray-900 text-sm leading-none mt-0.5">{etaMins} mins</p>
                             </div>
                          </div>
                       )}

                       <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path d="M15,15 Q35,55 85,85" fill="none" stroke="#228b22" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
                       </svg>
                       
                       <div className="absolute top-[10%] left-[10%] flex flex-col items-center">
                          <div className="p-2 bg-yellow-400 rounded-full text-black shadow-lg shadow-yellow-400/20"><Package size={16}/></div>
                          <span className="text-[9px] font-extrabold tracking-widest uppercase mt-1 text-gray-900 bg-white/80 px-2 rounded backdrop-blur-sm">{t("Store", "దుకాణం")}</span>
                       </div>
                       
                       <div className="absolute bottom-[10%] right-[10%] flex flex-col items-center">
                          <div className="p-2 bg-[var(--color-primary)] rounded-full text-white shadow-lg shadow-green-600/20"><Home size={16}/></div>
                          <span className="text-[9px] font-extrabold tracking-widest uppercase mt-1 text-gray-900 bg-white/80 px-2 rounded backdrop-blur-sm">{t("You", "మీరు")}</span>
                       </div>

                       <motion.div 
                          className="absolute z-10"
                          animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                          style={{ transform: 'translate(-50%, -50%)' }}
                       >
                          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse absolute -inset-3"></div>
                          <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center relative z-10">
                             <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                       </motion.div>
                    </div>
                  );
               })()}

               {/* Progress Steps */}
               <div className="relative pl-6 space-y-10">
                 <div className="absolute left-[34px] top-6 bottom-6 w-1 bg-gray-100 rounded-full"></div>
                 
                 <motion.div 
                   className="absolute left-[34px] top-6 w-1 bg-[var(--color-primary)] rounded-full"
                   initial={{ height: 0 }}
                   animate={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
                   transition={{ duration: 0.8, ease: "easeInOut" }}
                 />

                 {steps.map((step, idx) => {
                   const isCompleted = currentStep >= idx;
                   const isActive = currentStep === idx;
                   const Icon = step.icon;

                   return (
                     <div key={step.status} className={`relative flex items-center ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                       <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center bg-white transition-colors duration-500 border-[3px] border-white
                         ${isCompleted ? 'text-[var(--color-primary)]' : 'text-gray-200'}
                       `}>
                         {isCompleted ? <CheckCircle2 size={24} className="fill-current text-white overflow-visible bg-green-500 rounded-full" /> : <div className="w-3 h-3 rounded-full bg-gray-200" />}
                       </div>
                       
                       <div className="ml-6 flex items-center space-x-4">
                         <motion.div 
                           initial={false}
                           animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                           className={`p-3 rounded-xl shadow-sm ${isActive ? 'bg-green-50 text-[var(--color-primary)]' : 'bg-gray-50 text-gray-500'}`}
                         >
                           <Icon size={20} />
                         </motion.div>
                         <div>
                           <h3 className={`font-extrabold pt-1 ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>{step.title}</h3>
                           {isActive && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-[var(--color-primary)] font-black uppercase tracking-widest mt-1">{t("Telemetry Live...", "లైవ్ ప్రసారం...")}</motion.p>}
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>

               {/* ====== Order Items Section ====== */}
               <div className="mt-6 border-t border-gray-100 pt-4">
                  <button 
                    onClick={() => setExpandedOrder(isExpanded ? null : activeOrder.id)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center space-x-2">
                       <ShoppingBag size={16} className="text-[var(--color-primary)]" />
                       <span className="text-sm font-bold text-gray-900">{activeOrder.items.length} {t("items", "ఐటమ్‌లు")} · ₹{activeOrder.total}</span>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-3 space-y-3">
                          {activeOrder.items.map(item => {
                            const merchantName = merchants.find(m => m.id === item.merchantId)?.name || 'Store';
                            return (
                              <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <div className="flex items-center space-x-3 min-w-0">
                                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100 shrink-0 overflow-hidden">
                                    {item.photoUrl ? <img src={item.photoUrl} className="w-full h-full object-cover" /> : <Package size={16} className="text-gray-300" />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{item.quantity}x {item.name}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                      <Store size={10} className="mr-1" /> {merchantName}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm font-extrabold text-[var(--color-primary)] shrink-0 ml-2">₹{item.price * item.quantity}</p>
                              </div>
                            );
                          })}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">{t("Total", "మొత్తం")}</span>
                            <span className="text-lg font-extrabold text-gray-900">₹{activeOrder.total}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>

               {/* ====== Cancel Order Button ====== */}
               {canCancel && (
                 <div className="mt-4">
                   {cancelConfirm === activeOrder.id ? (
                     <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                       <p className="text-sm font-bold text-red-800 mb-3">{t("Are you sure you want to cancel this order?", "మీరు ఈ ఆర్డర్‌ని రద్దు చేయాలనుకుంటున్నారా?")}</p>
                       <div className="flex space-x-3">
                         <button onClick={() => { cancelOrder(activeOrder.id); setCancelConfirm(null); }} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform text-sm">
                           {t("Yes, Cancel", "అవును, రద్దు")}
                         </button>
                         <button onClick={() => setCancelConfirm(null)} className="flex-1 bg-white text-gray-700 font-bold py-3 rounded-xl border border-gray-200 active:scale-95 transition-transform text-sm">
                           {t("Keep Order", "ఆర్డర్ ఉంచండి")}
                         </button>
                       </div>
                     </div>
                   ) : (
                     <button onClick={() => setCancelConfirm(activeOrder.id)} className="w-full text-red-500 bg-red-50 border border-red-100 font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform">
                       {t("Cancel Order", "ఆర్డర్ రద్దు చేయండి")}
                     </button>
                   )}
                 </div>
               )}
            </motion.div>
         )
      })}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
           to {
              stroke-dashoffset: -100;
           }
        }
      `}} />
    </div>
  );
}
