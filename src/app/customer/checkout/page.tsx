"use client";

import { useAppStore } from "@/store/useStore";
import { ArrowLeft, MapPin, QrCode, ShoppingCart, CheckCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useAnimation, useMotionValue, useTransform, AnimatePresence } from "framer-motion";

export default function CheckoutPage() {
  const cart = useAppStore(state => state.cart);
  const placeOrder = useAppStore(state => state.placeOrder);
  const addToCart = useAppStore(state => state.addToCart);
  const removeFromCart = useAppStore(state => state.removeFromCart);
  const router = useRouter();

  const [address, setAddress] = useState("RTC Bus Stand");
  const [landmark, setLandmark] = useState("");
  const [paymentOption, setPaymentOption] = useState<"UPI" | "COD">("UPI");
  const [tip, setTip] = useState<number>(0);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const dragControls = useAnimation();
  const dragX = useMotionValue(0);
  const swipeTextOpacity = useTransform(dragX, [0, 150], [1, 0]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const merchantIds = Array.from(new Set(cart.map(i => i.merchantId)));
  const extraStopSurcharge = merchantIds.length > 1 ? 5 : 0;
  const deliveryFee = subtotal < 99 ? 19 : subtotal < 199 ? 9 : 0;
  
  const total = subtotal + extraStopSurcharge + deliveryFee + tip;

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 180) {
      // Trigger success animation
      setOrderSuccess(true);
      setTimeout(() => {
        handlePlaceOrder();
      }, 2000);
    } else {
      dragControls.start({ x: 0 });
    }
  };

  const handlePlaceOrder = () => {
    placeOrder({
      items: cart,
      total,
      customerAddress: address,
      customerLandmark: landmark,
      deliveryOTP: Math.floor(1000 + Math.random() * 9000).toString(),
      extraStopSurcharge,
      merchantIds
    });
    router.push(`/customer/tracking`);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-softcream)] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--color-primary)] opacity-10 blur-[80px] rounded-full"></div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-full shadow-lg border border-gray-100 text-gray-400 mb-6 relative z-10">
          <ShoppingCart size={64} strokeWidth={1.5} />
        </motion.div>
        <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Your Cart is Empty</motion.h2>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-gray-500 font-medium mb-8">Looks like you haven't added anything to your basket yet.</motion.p>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="relative z-10 w-full max-w-xs">
          <Link href="/customer" className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(34,139,34,0.3)] active:scale-95 transition-transform">
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative pb-40">
      
      {/* Success Confetti Overlay */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-green-500 z-[100] flex flex-col items-center justify-center overflow-hidden"
          >
             {/* Simple simulated confetti using multiple floating divs */}
             {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ top: '100%', left: `${Math.random() * 100}%`, rotate: 0, opacity: 1 }}
                  animate={{ top: '-10%', left: `${Math.random() * 100}%`, rotate: 360, opacity: 0 }}
                  transition={{ duration: 1.5 + Math.random(), ease: "easeOut" }}
                  className="absolute w-3 h-3 rounded-full bg-white/80"
                />
             ))}
             <motion.div 
               initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ duration: 0.8 }}
               className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.5)] mb-6"
             >
               <CheckCircle size={64} className="text-green-500" />
             </motion.div>
             <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-4xl font-black text-white tracking-tighter">Order Confirmed!</motion.h2>
             <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-green-100 font-bold mt-2 uppercase tracking-widest text-sm">Processing Ticket...</motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/80 backdrop-blur-md p-5 shadow-sm z-10 sticky top-0 flex items-center border-b border-gray-100">
        <Link href="/customer" className="mr-4 text-gray-800 bg-gray-50 p-2 rounded-full active:scale-95">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Checkout</h1>
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* Bill Details */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="font-extrabold text-gray-900 mb-5 tracking-tight text-lg">Bill Summary</h2>
          <div className="space-y-4 text-sm text-gray-600 font-medium">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center mb-1">
                <div className="flex flex-col">
                  <span className="flex items-center text-gray-900 font-bold">{item.name}</span>
                  <div className="flex items-center mt-2 space-x-1">
                    <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center font-black active:scale-95 text-gray-600">-</button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <button onClick={() => addToCart(item)} className="w-7 h-7 bg-green-50 text-[var(--color-primary)] rounded-lg flex items-center justify-center font-black active:scale-95">+</button>
                  </div>
                </div>
                <span className="font-mono font-bold">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-center">
              <span>Item Total</span>
              <span className="font-mono font-bold">₹{subtotal}</span>
            </div>
            {extraStopSurcharge > 0 && (
              <div className="flex justify-between items-center text-[var(--color-alert)] font-bold">
                <span>Multi-Store Extra Stop Fee</span>
                <span className="font-mono">₹{extraStopSurcharge}</span>
              </div>
            )}
            
            <div className={`flex justify-between items-center font-bold ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-600'}`}>
              <span>Delivery Fee {deliveryFee === 0 ? '(Free over ₹199)' : ''}</span>
              <span className="font-mono">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>

            {subtotal < 99 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 text-red-700 p-3 rounded-xl text-xs mt-3 text-center font-bold border border-red-100 shadow-inner">
                Add ₹{99 - subtotal} more to drop Delivery Fee from ₹19 to ₹9!
              </div>
            )}
            
            {subtotal >= 99 && subtotal < 199 && (
              <div className="bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 p-3 rounded-xl text-xs mt-3 text-center font-black uppercase tracking-widest border border-orange-200 shadow-inner">
                Add Items worth ₹{199 - subtotal} more to unlock FREE Delivery!
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 flex justify-between items-center font-black text-xl text-gray-900 mt-2">
              <span>Grand Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>

        {/* Tipping UI */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
           <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">💝</span>
              <div>
                <h2 className="font-extrabold text-gray-900 tracking-tight">Tip your Rider</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">100% of the tip goes to the agent</p>
              </div>
           </div>
           <div className="flex space-x-3">
              {[0, 10, 20, 30].map(amt => (
                 <button 
                   key={amt} 
                   onClick={() => setTip(amt)}
                   className={`flex-1 py-3 rounded-xl font-black text-sm transition-all border ${tip === amt ? 'bg-green-50 border-[var(--color-primary)] text-[var(--color-primary)]' : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'}`}
                 >
                   {amt === 0 ? 'No Tip' : `₹${amt}`}
                 </button>
              ))}
           </div>
        </div>

        {/* Address & Landmark */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="font-extrabold text-gray-900 flex items-center mb-5 tracking-tight text-lg">
            <MapPin size={20} className="mr-2 text-[var(--color-primary)]" />
            Drop-off Vector
          </h2>
          <div className="space-y-5">
            <div>
              <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-2">Delivery Area</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold text-gray-900 focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-[var(--color-primary)] font-black uppercase tracking-widest flex justify-between block mb-2">
                Local Landmark (Required) <span className="text-red-500 text-lg leading-none">*</span>
              </label>
              <input 
                type="text" 
                value={landmark} 
                onChange={e => setLandmark(e.target.value)} 
                placeholder="e.g. Near Siva Temple, Beside SBI ATM"
                className="w-full border-2 border-green-200 bg-green-50 rounded-xl p-4 font-bold text-green-900 placeholder-green-700/40 focus:outline-none focus:border-[var(--color-primary)] transition-colors shadow-inner" 
              />
            </div>
          </div>
        </div>

        {/* Payment Intent Tray */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="font-extrabold text-gray-900 mb-4 tracking-tight text-lg">Payment Method</h2>
          
          <div className="space-y-3">
            <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentOption === 'UPI' ? 'border-[var(--color-primary)] bg-green-50 shadow-sm' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}>
              <input type="radio" value="UPI" checked={paymentOption === 'UPI'} onChange={() => setPaymentOption('UPI')} className="mr-4 w-5 h-5 accent-[var(--color-primary)]" />
              <span className="font-black text-gray-900">UPI Fast Pay</span>
            </label>
            
            {paymentOption === 'UPI' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden pl-10 pr-4 pb-4">
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div className="border border-gray-200 bg-white p-3 rounded-xl flex flex-col items-center justify-center text-xs text-gray-600 active:bg-gray-50 uppercase font-black tracking-widest text-[10px] shadow-sm cursor-pointer hover:border-gray-300 transition-all">
                    <div className="w-10 h-10 bg-blue-100 rounded-full mb-2 flex items-center justify-center text-lg font-black text-blue-600">G</div>
                    GPay
                  </div>
                  <div className="border border-gray-200 bg-white p-3 rounded-xl flex flex-col items-center justify-center text-xs text-gray-600 active:bg-gray-50 uppercase font-black tracking-widest text-[10px] shadow-sm cursor-pointer hover:border-gray-300 transition-all">
                    <div className="w-10 h-10 bg-purple-100 rounded-full mb-2 flex items-center justify-center text-lg font-black text-purple-600">P</div>
                    PhonePe
                  </div>
                  <div className="border border-gray-200 bg-white p-3 rounded-xl flex flex-col items-center justify-center text-xs text-gray-600 active:bg-gray-50 uppercase font-black tracking-widest text-[10px] shadow-sm cursor-pointer hover:border-gray-300 transition-all">
                    <div className="w-10 h-10 bg-gray-900 rounded-full mb-2 flex items-center justify-center"><QrCode className="text-white" size={20}/></div>
                    QR Code
                  </div>
                </div>
              </motion.div>
            )}

            <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentOption === 'COD' ? 'border-[var(--color-primary)] bg-green-50 shadow-sm' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}>
              <input type="radio" value="COD" checked={paymentOption === 'COD'} onChange={() => setPaymentOption('COD')} className="mr-4 w-5 h-5 accent-[var(--color-primary)]" />
              <span className="font-black text-gray-900">Cash on Delivery</span>
            </label>
          </div>
        </div>
      </div>

      {/* Premium Swipe-to-Order Bottom Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-5 z-50 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto relative h-16 bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
          
          <motion.div style={{ opacity: swipeTextOpacity }} className="absolute text-gray-400 font-black uppercase tracking-widest text-xs pointer-events-none z-0">
             {landmark.trim() ? `Swipe to Pay ₹${total}` : 'Enter Landmark First'}
          </motion.div>
          
          <div className="absolute left-0 top-0 bottom-0 w-full z-10 pointer-events-none">
             {landmark.trim() && (
               <motion.div 
                 style={{ width: dragX }} 
                 className="absolute left-0 top-0 bottom-0 bg-[var(--color-primary)] rounded-l-2xl shadow-[0_0_20px_rgba(34,139,34,0.5)]"
               />
             )}
          </div>

          <motion.div 
            drag={landmark.trim() ? "x" : false}
            dragConstraints={{ left: 0, right: 280 }} // approximate width to boundary
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            animate={dragControls}
            style={{ x: dragX }}
            className={`absolute left-1 top-1 bottom-1 w-14 rounded-xl flex items-center justify-center z-20 shadow-md transition-colors ${landmark.trim() ? 'bg-white cursor-grab active:cursor-grabbing' : 'bg-gray-200 cursor-not-allowed opacity-50'}`}
          >
             <ChevronRight size={24} className={landmark.trim() ? "text-[var(--color-primary)]" : "text-gray-400"} />
          </motion.div>

        </div>
      </div>
    </div>
  );
}
