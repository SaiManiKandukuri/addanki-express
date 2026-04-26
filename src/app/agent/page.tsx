"use client";

import { useAppStore, Order } from "@/store/useStore";
import { useEffect, useState } from "react";
import { LogOut, MapPin, Truck, Phone, Navigation, ArrowRight, ShieldCheck, Home, BellRing, Target, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AgentDashboard() {
  const myAgentId = useAppStore(state => state.currentUserId) || "a1"; 
  const agents = useAppStore(state => state.agents);
  const myAgent = agents.find(a => a.id === myAgentId);
  const allOrders = useAppStore(state => state.orders);
  
  const setRole = useAppStore(state => state.setRole);
  const updateOrderStatus = useAppStore(state => state.updateOrderStatus);
  const acceptAgentOrder = useAppStore(state => state.acceptAgentOrder);
  const toggleAgentStatus = useAppStore(state => state.toggleAgentStatus);
  const reassignAgent = useAppStore(state => state.reassignAgent);

  const [enteredOtp, setEnteredOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [hasLocationAccess, setHasLocationAccess] = useState(false);

  const assignedOrder = allOrders.find(o => o.agentId === myAgentId && o.status !== 'DELIVERED' && o.status !== 'DENIED');

  useEffect(() => {
     if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
           () => setHasLocationAccess(true),
           () => setHasLocationAccess(false)
        );
     }
  }, []);

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    let timer: NodeJS.Timeout | null = null;
    let vibInterval: NodeJS.Timeout | null = null;
    
    if (assignedOrder && assignedOrder.agentStatus === 'PENDING') {
      const timeSinceAssigned = Math.floor((Date.now() - (assignedOrder.agentAssignedAt || 0)) / 1000);
      let rem = 60 - timeSinceAssigned;
      
      if (rem <= 0) {
        reassignAgent(assignedOrder.id, "a2");
      } else {
        setTimeLeft(rem);
        audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
        audio.loop = true;
        audio.play().catch(()=>{});
        
        if ('vibrate' in navigator) {
           vibInterval = setInterval(() => {
              navigator.vibrate([200, 100, 200, 100, 500, 1000]);
           }, 2500);
        }

        timer = setInterval(() => {
           const timePassed = Math.floor((Date.now() - (assignedOrder.agentAssignedAt || 0)) / 1000);
           if (60 - timePassed <= 0) {
              reassignAgent(assignedOrder.id, "a2");
           } else {
              setTimeLeft(60 - timePassed);
           }
        }, 1000);
      }
    }
    
    return () => {
      if (audio) { audio.pause(); audio.currentTime = 0; }
      if (timer) clearInterval(timer);
      if (vibInterval) clearInterval(vibInterval);
    }
  }, [assignedOrder, reassignAgent]);

  const verifyOTPAndDeliver = () => {
    if (enteredOtp === assignedOrder?.deliveryOTP) {
       updateOrderStatus(assignedOrder.id, 'DELIVERED');
       setEnteredOtp("");
    }
  };

  const navToMap = () => {
    if (!assignedOrder) return;
    window.open(`https://maps.google.com/?q=${encodeURIComponent(assignedOrder.customerLandmark)}`, '_blank');
  };

  const myWallet = allOrders.filter(o=>o.status === 'DELIVERED').length * 20;

  return (
    <div className="min-h-screen bg-black text-white font-sans max-w-md mx-auto relative overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-6 border-b border-white/10 z-10 relative">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-lime-500 rounded-full flex items-center justify-center font-black text-black">A1</div>
          <div>
            <h1 className="font-black tracking-tight text-white">{myAgent?.name}</h1>
            <button onClick={() => toggleAgentStatus(myAgentId)} className="flex items-center space-x-1 uppercase tracking-widest text-[10px] font-bold mt-1">
               <span className={`w-2 h-2 rounded-full ${myAgent?.isOnline ? 'bg-lime-500' : 'bg-red-500'}`}></span>
               <span className="text-gray-400">{myAgent?.isOnline ? 'Online Sync' : 'Offline'}</span>
            </button>
          </div>
        </div>
        <button onClick={() => setRole(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"><LogOut size={16}/></button>
      </div>

      <AnimatePresence>
        {assignedOrder && assignedOrder.agentStatus === 'PENDING' && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute inset-0 bg-lime-400/95 backdrop-blur-md z-50 flex flex-col p-8 justify-center items-center text-black">
             <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-lime-600 mb-8 p-6 ring-8 ring-lime-300">
               <BellRing size={50} className="animate-bounce" />
             </div>
             <h2 className="text-4xl font-black uppercase text-center tracking-tighter">New Drop</h2>
             <p className="font-bold text-center mt-2 text-lime-900">Destination: {assignedOrder.customerLandmark}</p>
             <div className="text-[100px] font-black tracking-tighter mt-4 leading-none">{timeLeft}</div>
             <p className="font-bold uppercase tracking-widest text-xs mt-2 text-lime-900">Seconds to Accept</p>
             
             <button onClick={() => acceptAgentOrder(assignedOrder.id)} className="w-full mt-10 bg-black text-lime-400 font-extrabold uppercase py-6 rounded-3xl text-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] active:scale-95 transition-transform tracking-widest">
                Accept Ticket
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-6 z-10 relative">
        {assignedOrder && assignedOrder.agentStatus === 'ACCEPTED' ? (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-[2rem] p-5 border border-white/10 relative overflow-hidden shadow-2xl">
              {!hasLocationAccess && (
                 <div className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center p-4 text-center backdrop-blur-sm">
                    <Navigation size={32} className="text-orange-500 mb-3" />
                    <p className="text-white font-extrabold uppercase tracking-widest text-xs">GPS Disconnected</p>
                    <p className="text-gray-400 text-[10px] mt-1 font-bold">Please allow location permissions to compute dynamic delivery mapping routes.</p>
                 </div>
              )}
              <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <svg className="absolute inset-0 w-full h-full z-10">
                <path d="M 40 180 C 100 180, 120 120, 150 100 S 200 40, 260 40" stroke="#a3e635" strokeWidth="4" strokeDasharray="10 10" fill="none">
                  <animate attributeName="stroke-dashoffset" from="40" to="0" dur="1s" repeatCount="indefinite" />
                </path>
              </svg>
              <div className="h-64 relative w-full mb-2">
                 <div className="absolute z-20 top-[160px] left-[20px] bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)] border-4 border-gray-900">
                   <Target size={20} className="text-white" />
                 </div>
                 <div className="absolute z-20 top-[80px] left-[130px] bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.6)] border-4 border-gray-900">
                   <Package size={20} className="text-black" />
                 </div>
                 <div className="absolute z-20 top-[20px] left-[240px] bg-lime-500 w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(132,204,22,0.6)] border-4 border-gray-900">
                   <MapPin size={20} className="text-black" />
                 </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex justify-between items-center z-20">
                 <div>
                   <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Target Dest</p>
                   <p className="text-white font-extrabold truncate w-40">{assignedOrder.customerLandmark}</p>
                 </div>
                 <button onClick={navToMap} className="bg-lime-500 text-black px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-lime-400">Launch Nav</button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-4">OTP Verification Gate</h3>
              <div className="flex bg-black border-[3px] border-white/10 rounded-2xl overflow-hidden focus-within:border-lime-500 transition-colors shadow-inner">
                 <input 
                   type="tel"
                   value={enteredOtp}
                   onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                   maxLength={4}
                   className="flex-1 bg-transparent text-center text-4xl tracking-[0.5em] text-white font-black py-4 outline-none placeholder-white/10"
                   placeholder="••••"
                 />
              </div>
              <button 
                onClick={verifyOTPAndDeliver}
                disabled={enteredOtp.length !== 4}
                className="w-full mt-4 bg-lime-500 disabled:opacity-50 text-black font-extrabold uppercase disabled:bg-gray-800 disabled:text-gray-500 tracking-widest p-4 rounded-2xl transition-all"
              >
                Close Ticket
              </button>
            </div>
            
             <button onClick={()=>updateOrderStatus(assignedOrder.id, 'OUT_FOR_DELIVERY')} className="w-full text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest py-2 border border-white/10 rounded-xl hover:bg-white/5">
                Mark Carrier Out
             </button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-40 grayscale">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
               <Navigation size={40} className="text-white/50" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-widest">System Standby</h2>
            <p className="text-sm font-bold mt-2">Waiting for next dispatch pulse...</p>
          </div>
        )}
      </div>

       <div className="bg-black border-t border-white/10 p-6 z-10 flex flex-col justify-between items-start space-y-4">
         <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rider Analytics / Revenue Dashboard</p>
         </div>
         <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
               <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Sweeps Done</p>
               <p className="text-white font-extrabold text-2xl">{allOrders.filter(o=>o.status==='DELIVERED').length}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl shadow-inner">
               <p className="text-[10px] uppercase text-green-500 font-bold tracking-widest">Net Cash Earned</p>
               <p className="text-lime-400 font-extrabold text-2xl">₹{myWallet}</p>
            </div>
         </div>
       </div>

    </div>
  );
}
