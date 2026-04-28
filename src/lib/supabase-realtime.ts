import { supabase } from './supabase';
import { useAppStore } from '@/store/useStore';
import type { Merchant, Agent, Product, Order, Banner, Category } from '@/store/useStore';

// ============================================
// Row → App type mappers (snake_case → camelCase)
// ============================================

function rowToMerchant(row: Record<string, any>): Merchant {
  return {
    id: row.id,
    name: row.name,
    rating: Number(row.rating),
    deliveryTime: row.delivery_time,
    isOffline: row.is_offline,
    credentials: row.credentials ?? undefined,
  };
}

function rowToAgent(row: Record<string, any>): Agent {
  return {
    id: row.id,
    name: row.name,
    isOnline: row.is_online,
    phone: row.phone,
    credentials: row.credentials ?? undefined,
  };
}

function rowToProduct(row: Record<string, any>): Product {
  return {
    id: row.id,
    merchantId: row.merchant_id,
    name: row.name,
    price: row.price,
    mrp: row.mrp ?? undefined,
    category: row.category,
    inStock: row.in_stock,
    photoUrl: row.photo_url ?? undefined,
    description: row.description ?? undefined,
  };
}

function rowToOrder(row: Record<string, any>): Order {
  return {
    id: row.id,
    items: row.items,
    total: row.total,
    status: row.status,
    customerLandmark: row.customer_landmark,
    customerAddress: row.customer_address,
    deliveryOTP: row.delivery_otp,
    extraStopSurcharge: row.extra_stop_surcharge,
    merchantIds: row.merchant_ids,
    agentId: row.agent_id ?? undefined,
    agentStatus: row.agent_status ?? undefined,
    agentAssignedAt: row.agent_assigned_at ?? undefined,
  };
}

function rowToBanner(row: Record<string, any>): Banner {
  return {
    id: row.id,
    photoUrl: row.photo_url,
  };
}

function rowToCategory(row: Record<string, any>): Category {
  return {
    id: row.id,
    name: row.name,
    photoUrl: row.photo_url ?? "",
    displayOrder: row.display_order ?? 0,
    productIds: row.product_ids ?? [],
    type: row.type ?? 'section',
    merchantId: row.merchant_id ?? undefined,
  };
}

// ============================================
// Subscribe to all tables with separate channels
// ============================================

export function subscribeToRealtimeChanges(): () => void {
  const store = useAppStore;
  const channels: ReturnType<typeof supabase.channel>[] = [];

  // --- Agents Channel ---
  const agentsChannel = supabase
    .channel('realtime-agents')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'agents' },
      (payload: any) => {
        console.log('🔄 RT agents:', payload.eventType, payload);
        const current = store.getState().agents;

        if (payload.eventType === 'INSERT') {
          const item = rowToAgent(payload.new);
          if (!current.find(a => a.id === item.id)) {
            store.setState({ agents: [...current, item] });
          }
        } else if (payload.eventType === 'UPDATE') {
          const item = rowToAgent(payload.new);
          store.setState({ agents: current.map(a => a.id === item.id ? item : a) });
        } else if (payload.eventType === 'DELETE') {
          const oldId = payload.old?.id;
          if (oldId) store.setState({ agents: current.filter(a => a.id !== oldId) });
        }
      }
    )
    .subscribe((status: string) => {
      console.log('📡 Agents channel:', status);
    });
  channels.push(agentsChannel);

  // --- Orders Channel ---
  const ordersChannel = supabase
    .channel('realtime-orders')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload: any) => {
        console.log('🔄 RT orders:', payload.eventType, payload);
        const current = store.getState().orders;

        if (payload.eventType === 'INSERT') {
          const item = rowToOrder(payload.new);
          if (!current.find(o => o.id === item.id)) {
            store.setState({ orders: [...current, item] });
          }
        } else if (payload.eventType === 'UPDATE') {
          const item = rowToOrder(payload.new);
          store.setState({ orders: current.map(o => o.id === item.id ? item : o) });
        } else if (payload.eventType === 'DELETE') {
          const oldId = payload.old?.id;
          if (oldId) store.setState({ orders: current.filter(o => o.id !== oldId) });
        }
      }
    )
    .subscribe((status: string) => {
      console.log('📡 Orders channel:', status);
    });
  channels.push(ordersChannel);

  // --- Products Channel ---
  const productsChannel = supabase
    .channel('realtime-products')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      (payload: any) => {
        console.log('🔄 RT products:', payload.eventType, payload);
        const current = store.getState().products;

        if (payload.eventType === 'INSERT') {
          const item = rowToProduct(payload.new);
          if (!current.find(p => p.id === item.id)) {
            store.setState({ products: [...current, item] });
          }
        } else if (payload.eventType === 'UPDATE') {
          const item = rowToProduct(payload.new);
          store.setState({ products: current.map(p => p.id === item.id ? item : p) });
        } else if (payload.eventType === 'DELETE') {
          const oldId = payload.old?.id;
          if (oldId) store.setState({ products: current.filter(p => p.id !== oldId) });
        }
      }
    )
    .subscribe((status: string) => {
      console.log('📡 Products channel:', status);
    });
  channels.push(productsChannel);

  // --- Merchants Channel ---
  const merchantsChannel = supabase
    .channel('realtime-merchants')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'merchants' },
      (payload: any) => {
        console.log('🔄 RT merchants:', payload.eventType, payload);
        const current = store.getState().merchants;

        if (payload.eventType === 'INSERT') {
          const item = rowToMerchant(payload.new);
          if (!current.find(m => m.id === item.id)) {
            store.setState({ merchants: [...current, item] });
          }
        } else if (payload.eventType === 'UPDATE') {
          const item = rowToMerchant(payload.new);
          store.setState({ merchants: current.map(m => m.id === item.id ? item : m) });
        } else if (payload.eventType === 'DELETE') {
          const oldId = payload.old?.id;
          if (oldId) store.setState({ merchants: current.filter(m => m.id !== oldId) });
        }
      }
    )
    .subscribe((status: string) => {
      console.log('📡 Merchants channel:', status);
    });
  channels.push(merchantsChannel);

  // --- Banners Channel ---
  const bannersChannel = supabase
    .channel('realtime-banners')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'banners' },
      (payload: any) => {
        console.log('🔄 RT banners:', payload.eventType, payload);
        const current = store.getState().banners;

        if (payload.eventType === 'INSERT') {
          const item = rowToBanner(payload.new);
          if (!current.find(b => b.id === item.id)) {
            store.setState({ banners: [...current, item] });
          }
        } else if (payload.eventType === 'UPDATE') {
          const item = rowToBanner(payload.new);
          store.setState({ banners: current.map(b => b.id === item.id ? item : b) });
        } else if (payload.eventType === 'DELETE') {
          const oldId = payload.old?.id;
          if (oldId) store.setState({ banners: current.filter(b => b.id !== oldId) });
        }
      }
    )
    .subscribe((status: string) => {
      console.log('📡 Banners channel:', status);
    });
  channels.push(bannersChannel);

  // --- Categories Channel ---
  const categoriesChannel = supabase
    .channel('realtime-categories')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'categories' },
      (payload: any) => {
        console.log('🔄 RT categories:', payload.eventType, payload);
        const current = useAppStore.getState().categories;

        if (payload.eventType === 'INSERT') {
          const item = rowToCategory(payload.new);
          if (!current.find(c => c.id === item.id)) {
            useAppStore.setState({ categories: [...current, item].sort((a,b) => a.displayOrder - b.displayOrder) });
          }
        } else if (payload.eventType === 'UPDATE') {
          const item = rowToCategory(payload.new);
          useAppStore.setState({ categories: current.map(c => c.id === item.id ? item : c).sort((a,b) => a.displayOrder - b.displayOrder) });
        } else if (payload.eventType === 'DELETE') {
          const oldId = payload.old?.id;
          if (oldId) useAppStore.setState({ categories: current.filter(c => c.id !== oldId) });
        }
      }
    )
    .subscribe();
  channels.push(categoriesChannel);

  // Return cleanup function
  return () => {
    channels.forEach(ch => supabase.removeChannel(ch));
  };
}
