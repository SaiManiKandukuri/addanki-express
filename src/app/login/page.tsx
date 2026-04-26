"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, UserRole } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Store, User, ShoppingBag, Map, ArrowRight, ShieldCheck, Lock } from "lucide-react";

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");
  const [step, setStep] = useState<"identity" | "verify">("identity");
  
  // Customer inputs
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  
  // Non-customer inputs
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [pin, setPin] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const setRole = useAppStore(state => state.setRole);
  const merchants = useAppStore(state => state.merchants);
  const agents = useAppStore(state => state.agents);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (selectedRole === "customer" && phone.length === 10) {
      setStep("verify");
    } else if (selectedRole === "merchant" && selectedUserId) {
      setStep("verify");
    } else if (selectedRole === "agent" && selectedUserId) {
      setStep("verify");
    } else if (selectedRole === "admin") {
      setStep("verify");
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (selectedRole === "customer") {
      if (otp === "1234") {
        setRole("customer", "c1"); // generic customer ID
        router.push("/customer");
      } else {
        setErrorMsg("Invalid OTP. Try 1234.");
      }
    } else if (selectedRole === "merchant") {
      const m = merchants.find(m => m.id === selectedUserId);
      if (m && m.credentials === pin) {
        setRole("merchant", m.id);
        router.push("/merchant");
      } else {
        setErrorMsg("Invalid Access Key.");
      }
    } else if (selectedRole === "agent") {
      const a = agents.find(a => a.id === selectedUserId);
      if (a && a.credentials === pin) {
        setRole("agent", a.id);
        router.push("/agent");
      } else {
        setErrorMsg("Invalid Access Key.");
      }
    } else if (selectedRole === "admin") {
      if (pin === "0000") { // Admin master pin
        setRole("admin");
        router.push("/admin");
      } else {
        setErrorMsg("Invalid Master PIN.");
      }
    }
  };

  const roleOptions: { id: UserRole, title: string, icon: any, desc: string }[] = [
    { id: "customer", title: "Customer", icon: ShoppingBag, desc: "Order groceries & essentials" },
    { id: "merchant", title: "Merchant", icon: Store, desc: "Manage store & sales" },
    { id: "agent", title: "Delivery Agent", icon: Map, desc: "Pickup & drop orders" },
    { id: "admin", title: "God View", icon: ShieldCheck, desc: "Platform operations tracking" }
  ];

  const renderIdentityForm = () => {
    return (
      <motion.form 
        key="identity"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        onSubmit={handleContinue} 
        className="space-y-6"
      >
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select Identity</label>
          <div className="grid grid-cols-2 gap-3">
            {roleOptions.map(role => {
              const Icon = role.icon;
              const isActive = selectedRole === role.id;
              return (
                <div 
                  key={role.id}
                  onClick={() => { setSelectedRole(role.id); setStep("identity"); setSelectedUserId(""); setPin(""); setOtp(""); setErrorMsg(""); }}
                  className={`cursor-pointer border p-3 rounded-xl transition-all flex flex-col items-center text-center ${
                    isActive 
                      ? 'bg-green-50 border-[var(--color-primary)] text-[var(--color-primary)]' 
                      : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-[var(--color-primary)] mb-2' : 'mb-2'} />
                  <h3 className="font-bold text-sm">{role.title}</h3>
                </div>
              )
            })}
          </div>
        </div>
        
        {selectedRole === "customer" && (
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Mobile Number</label>
            <div className="flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-[var(--color-primary)] transition-colors">
              <span className="flex items-center px-4 bg-gray-100 text-gray-600 font-bold border-r border-gray-200">+91</span>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                className="flex-1 min-w-0 bg-transparent text-gray-900 px-4 py-4 focus:outline-none font-medium placeholder-gray-400"
                placeholder="9876543210"
              />
            </div>
          </div>
        )}

        {selectedRole === "merchant" && (
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select Store</label>
            <select 
               value={selectedUserId} 
               onChange={(e) => setSelectedUserId(e.target.value)}
               className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:outline-none focus:border-[var(--color-primary)] font-bold text-gray-900 appearance-none"
            >
               <option value="" disabled>Choose your store...</option>
               {merchants.map(m => (
                 <option key={m.id} value={m.id}>{m.name}</option>
               ))}
            </select>
          </div>
        )}

        {selectedRole === "agent" && (
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select Agent Profile</label>
            <select 
               value={selectedUserId} 
               onChange={(e) => setSelectedUserId(e.target.value)}
               className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:outline-none focus:border-[var(--color-primary)] font-bold text-gray-900 appearance-none"
            >
               <option value="" disabled>Choose your profile...</option>
               {agents.map(a => (
                 <option key={a.id} value={a.id}>{a.name} ({a.phone})</option>
               ))}
            </select>
          </div>
        )}

        <button 
          type="submit"
          disabled={(selectedRole === "customer" && phone.length !== 10) || ((selectedRole === "merchant" || selectedRole === "agent") && !selectedUserId)}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-extrabold py-4 px-4 rounded-xl hover:shadow-lg hover:shadow-green-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center mt-4"
        >
          Continue <ArrowRight size={18} className="ml-2" />
        </button>
      </motion.form>
    );
  };

  const renderVerifyForm = () => {
    return (
      <motion.form 
        key="verify"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 20, opacity: 0 }}
        onSubmit={handleVerify} 
        className="space-y-6"
      >
        <div className="text-center mb-6">
          {selectedRole === "customer" ? (
             <>
               <p className="text-gray-600 font-medium">Enter code sent to +91 {phone.replace(/(\d{5})(\d{5})/, '$1 $2')}</p>
               <div className="mt-4 bg-green-50 border border-green-100 text-[var(--color-primary)] px-4 py-2 rounded-lg text-sm inline-block">Demo OTP is <strong className="text-gray-900">1234</strong></div>
             </>
          ) : selectedRole === "admin" ? (
             <>
               <p className="text-gray-600 font-medium">Enter Master Administrator PIN</p>
               <div className="mt-4 bg-green-50 border border-green-100 text-[var(--color-primary)] px-4 py-2 rounded-lg text-sm inline-block">Master PIN is <strong className="text-gray-900">0000</strong></div>
             </>
          ) : (
             <>
               <p className="text-gray-600 font-medium">Enter your confidential Access Key</p>
             </>
          )}
        </div>
        
        {errorMsg && (
           <div className="bg-red-50 text-red-600 p-3 rounded-xl text-center text-sm font-bold border border-red-100">
              {errorMsg}
           </div>
        )}
        
        <div className="flex justify-center">
          {selectedRole === "customer" ? (
             <input 
               type="tel" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} maxLength={4}
               className="block w-full bg-gray-50 text-center text-4xl tracking-[1em] text-gray-900 font-bold py-5 rounded-2xl border border-gray-200 focus:border-[var(--color-primary)] outline-none transition-colors"
               placeholder="••••" autoFocus
             />
          ) : (
             <div className="relative w-full">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Lock size={20} /></div>
               <input 
                 type="password" value={pin} onChange={(e) => setPin(e.target.value)}
                 className="block w-full bg-gray-50 text-center text-2xl tracking-[0.5em] text-gray-900 font-bold py-4 rounded-2xl border border-gray-200 focus:border-[var(--color-primary)] outline-none transition-colors px-12"
                 placeholder="Enter Key..." autoFocus
               />
             </div>
          )}
        </div>

        <button 
          type="submit"
          disabled={(selectedRole === "customer" && otp.length !== 4) || (selectedRole !== "customer" && pin.length < 3)}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-extrabold py-4 px-4 rounded-xl hover:shadow-lg hover:shadow-green-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center mt-2"
        >
          Verify Identity <ShieldCheck size={18} className="ml-2" />
        </button>
        
        <button 
          type="button"
          onClick={() => { setStep("identity"); setErrorMsg(""); }}
          className="w-full text-gray-400 text-sm font-bold py-2 hover:text-gray-700 transition-colors"
        >
          Go Back
        </button>
      </motion.form>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-softcream)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-200/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-200/50 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ y: 30, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/80 backdrop-blur-3xl border border-gray-100 rounded-[2rem] shadow-2xl overflow-hidden text-gray-900 p-8">
          
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-green-500/30 mb-4"
            >
              <Store size={36} className="text-white" />
            </motion.div>
            <h1 className="text-4xl font-extrabold tracking-tight">Addanki <span className="text-[var(--color-primary)]">Express</span></h1>
            <p className="text-gray-500 mt-2 font-medium tracking-wide">Hyperlocal Engine</p>
          </div>
          
          <AnimatePresence mode="wait">
            {step === "identity" ? renderIdentityForm() : renderVerifyForm()}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
