"use client";

import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/store/useStore";
import * as db from "@/lib/supabase-db";
import { subscribeToRealtimeChanges } from "@/lib/supabase-realtime";

const POLL_INTERVAL = 3000; // 3 seconds

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAppStore(state => state.hydrate);
  const isHydrated = useAppStore(state => state.isHydrated);
  const [showLoader, setShowLoader] = useState(true);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Step 1: Hydrate from Supabase on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Step 2: Once hydrated, start realtime + polling
  useEffect(() => {
    if (!isHydrated) return;

    // Try realtime (primary sync)
    let unsubscribeRealtime: (() => void) | null = null;
    try {
      unsubscribeRealtime = subscribeToRealtimeChanges();
    } catch (e) {
      console.warn('⚠️ Realtime subscription failed:', e);
    }

    // Lightweight Polling (Fallback for critical data only)
    // We only poll Orders frequently. Everything else is handled by Realtime.
    const pollCritical = async () => {
      try {
        const [orders, profile] = await Promise.all([
          db.fetchOrders(),
          db.fetchCustomerProfile('c1'),
        ]);

        const state = useAppStore.getState();
        const changed: Partial<Record<string, any>> = {};
        
        // Simple length/ID check is much faster than JSON.stringify
        if (state.orders.length !== orders.length || (orders.length > 0 && state.orders[0]?.id !== orders[0]?.id)) {
           changed.orders = orders;
        }
        
        if (profile && state.customerProfile?.name !== profile.name) {
           changed.customerProfile = profile;
        }

        if (Object.keys(changed).length > 0) {
          useAppStore.setState(changed);
        }
      } catch (err) { /* silent fail */ }
    };

    // Deep Sync (Run once every 60 seconds as a safety net)
    const deepSync = async () => {
       try {
          const [merchants, agents, products, categories] = await Promise.all([
             db.fetchMerchants(),
             db.fetchAgents(),
             db.fetchProducts(),
             db.fetchCategories(),
          ]);
          useAppStore.setState({ 
             merchants, agents, products, 
             categories: categories.sort((a,b) => a.displayOrder - b.displayOrder) 
          });
       } catch (e) {}
    };

    pollRef.current = setInterval(pollCritical, 10000); // 10 seconds for orders
    const deepSyncInterval = setInterval(deepSync, 60000); // 1 minute for everything else

    return () => {
      if (unsubscribeRealtime) unsubscribeRealtime();
      if (pollRef.current) clearInterval(pollRef.current);
      clearInterval(deepSyncInterval);
    };
  }, [isHydrated]);

  // Step 3: Smooth loader transition
  useEffect(() => {
    if (isHydrated) {
      const t = setTimeout(() => setShowLoader(false), 300);
      return () => clearTimeout(t);
    }
  }, [isHydrated]);

  if (showLoader) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #fefce8 100%)',
        zIndex: 9999,
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #4ade80, #16a34a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(34,139,34,0.3)',
          marginBottom: 24,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <p style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 800,
          fontSize: 18,
          color: '#1a1a1a',
          letterSpacing: '-0.02em',
        }}>
          Addanki Mart
        </p>
        <p style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 700,
          fontSize: 10,
          color: '#9ca3af',
          letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          marginTop: 8,
        }}>
          Syncing with cloud...
        </p>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.08); opacity: 0.85; }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
