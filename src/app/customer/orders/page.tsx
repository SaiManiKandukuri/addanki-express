"use client";

import { useAppStore } from "@/store/useStore";
import { ArrowLeft, Package, Store, CheckCircle2, XCircle, RotateCcw, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function OrderHistoryPage() {
  const orders = useAppStore(state => state.orders);
  const merchants = useAppStore(state => state.merchants);
  const requestReturn = useAppStore(state => state.requestReturn);
  const isTelugu = useAppStore(state => state.isTelugu);
  const t = (en: string, te: string) => isTelugu ? te : en;

  const pastOrders = orders.filter(o => 
    o.status === 'DELIVERED' || o.status === 'CANCELLED' || o.status === 'RETURN_REQUESTED' || o.status === 'DENIED'
  ).reverse();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED': return { text: t('Delivered', 'డెలివరీ అయింది'), color: 'bg-green-50 text-green-600 border-green-200', icon: CheckCircle2 };
      case 'CANCELLED': return { text: t('Cancelled', 'రద్దు'), color: 'bg-red-50 text-red-500 border-red-200', icon: XCircle };
      case 'RETURN_REQUESTED': return { text: t('Return Requested', 'రిటర్న్ అభ్యర్థన'), color: 'bg-orange-50 text-orange-500 border-orange-200', icon: RotateCcw };
      case 'DENIED': return { text: t('Denied', 'తిరస్కరించబడింది'), color: 'bg-gray-100 text-gray-500 border-gray-200', icon: XCircle };
      default: return { text: status, color: 'bg-gray-50 text-gray-500 border-gray-200', icon: Package };
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-softcream)] flex flex-col max-w-md mx-auto">
      <div className="sticky top-0 z-20 bg-white/70 backdrop-blur-3xl border-b border-gray-100 px-5 py-4 flex items-center">
        <Link href="/customer" className="p-3 bg-white rounded-full shadow-sm active:scale-95 border border-gray-100 mr-4">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">{t("Order History", "ఆర్డర్ హిస్టరీ")}</h1>
      </div>

      <div className="flex-1 p-5 space-y-4">
        {pastOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={40} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{t("No orders yet", "ఇంకా ఆర్డర్‌లు లేవు")}</h2>
            <p className="text-gray-500 font-medium mb-6">{t("Your order history will appear here", "మీ ఆర్డర్ హిస్టరీ ఇక్కడ కనిపిస్తుంది")}</p>
            <Link href="/customer" className="bg-[var(--color-primary)] text-white font-bold px-8 py-3 rounded-xl active:scale-95 transition-transform shadow-lg shadow-green-500/20">
              {t("Start Shopping", "షాపింగ్ ప్రారంభించండి")}
            </Link>
          </div>
        ) : (
          pastOrders.map((order, idx) => {
            const badge = getStatusBadge(order.status);
            const BadgeIcon = badge.icon;
            return (
              <motion.div 
                key={order.id} 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">#{order.id}</p>
                    <p className="text-lg font-extrabold text-gray-900 mt-0.5">₹{order.total}</p>
                  </div>
                  <div className={`flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${badge.color}`}>
                    <BadgeIcon size={12} className="mr-1" /> {badge.text}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map(item => {
                    const merchantName = merchants.find(m => m.id === item.merchantId)?.name || 'Store';
                    return (
                      <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-gray-100 shrink-0 overflow-hidden">
                            {item.photoUrl ? <img src={item.photoUrl} className="w-full h-full object-cover" /> : <Package size={14} className="text-gray-300" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{item.quantity}x {item.name}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                              <Store size={9} className="mr-1" /> {merchantName}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-extrabold text-gray-600 shrink-0 ml-2">₹{item.price * item.quantity}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-bold">{t("To:", "గమ్యం:")} {order.customerLandmark}</span>
                </div>

                {order.status === 'DELIVERED' && (
                  <button 
                    onClick={() => requestReturn(order.id)}
                    className="w-full mt-4 flex items-center justify-center bg-orange-50 text-orange-600 border border-orange-100 font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform"
                  >
                    <RotateCcw size={14} className="mr-2" /> {t("Request Return", "రిటర్న్ అభ్యర్థన")}
                  </button>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
