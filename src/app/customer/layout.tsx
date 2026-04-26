"use client";

import { useAppStore } from "@/store/useStore";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const cart = useAppStore(state => state.cart);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const pathname = usePathname();
  const isCheckout = pathname.includes('/checkout');
  
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (totalItems > 0) {
      setBounce(true);
      const t = setTimeout(() => setBounce(false), 300);
      return () => clearTimeout(t);
    }
  }, [totalItems, totalPrice]);

  return (
    <div className="relative min-h-screen bg-[var(--color-softcream)] pb-24">
      {children}
      
      {/* Floating Cart Button (Swiggy Style) with Feedback Animation */}
      {!isCheckout && totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <Link href="/customer/checkout" className="block">
              <motion.div 
                animate={bounce ? { scale: [1, 1.05, 1], y: [0, -5, 0] } : {}}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between w-full bg-[var(--color-primary)] text-white font-bold p-4 rounded-2xl shadow-[0_10px_30px_rgba(34,139,34,0.3)] active:scale-95 transition-transform border border-green-500"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <ShoppingCart size={24} />
                    <motion.div 
                      key={totalItems} 
                      initial={{ scale: 0, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black shadow-sm"
                    >
                      {totalItems}
                    </motion.div>
                  </div>
                  <div className="text-left flex flex-col ml-2">
                    <span className="text-[10px] text-green-100 uppercase tracking-widest font-black leading-none mb-1">Total Due</span>
                    <span className="text-lg font-black leading-none">₹{totalPrice}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <span className="text-sm font-black uppercase tracking-widest">Checkout</span>
                  <span className="text-lg font-bold leading-none">➔</span>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
