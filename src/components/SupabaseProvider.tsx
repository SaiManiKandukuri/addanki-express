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

    // Try realtime (may fail on some Supabase plans/configs)
    let unsubscribeRealtime: (() => void) | null = null;
    try {
      unsubscribeRealtime = subscribeToRealtimeChanges();
    } catch (e) {
      console.warn('⚠️ Realtime subscription failed, using polling only:', e);
    }

    // Polling fallback — re-fetches all data every 3 seconds
    // This guarantees cross-device sync even if realtime WebSocket fails
    const poll = async () => {
      try {
        const [merchants, agents, products, orders, banners, profile] = await Promise.all([
          db.fetchMerchants(),
          db.fetchAgents(),
          db.fetchProducts(),
          db.fetchOrders(),
          db.fetchBanners(),
          db.fetchCustomerProfile('c1'),
        ]);

        // Only update if data actually changed (avoid unnecessary re-renders)
        const state = useAppStore.getState();
        
        const changed: Partial<Record<string, any>> = {};
        
        if (JSON.stringify(state.merchants) !== JSON.stringify(merchants)) {
          changed.merchants = merchants;
        }
        if (JSON.stringify(state.agents) !== JSON.stringify(agents)) {
          changed.agents = agents;
        }
        if (JSON.stringify(state.products) !== JSON.stringify(products)) {
          changed.products = products;
        }
        if (JSON.stringify(state.orders) !== JSON.stringify(orders)) {
          changed.orders = orders;
        }
        if (JSON.stringify(state.banners) !== JSON.stringify(banners)) {
          changed.banners = banners;
        }
        if (profile && JSON.stringify(state.customerProfile) !== JSON.stringify(profile)) {
          changed.customerProfile = profile;
        }

        if (Object.keys(changed).length > 0) {
          console.log('🔄 Poll: data changed, updating:', Object.keys(changed).join(', '));
          useAppStore.setState(changed);
        }
      } catch (err) {
        // Silent fail on poll errors — will retry next interval
      }
    };

    pollRef.current = setInterval(poll, POLL_INTERVAL);

    return () => {
      if (unsubscribeRealtime) unsubscribeRealtime();
      if (pollRef.current) clearInterval(pollRef.current);
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
