import { create } from 'zustand';
import * as db from '@/lib/supabase-db';

export interface Banner {
  id: string;
  photoUrl: string;
}

export interface Category {
  id: string;
  name: string;
  photoUrl: string;
  displayOrder: number;
  productIds: string[];
  type: 'section' | 'category';
  merchantId?: string;
}

export interface CustomerProfile {
  id?: string;
  name: string;
  phone: string;
  credentials?: string;
  email: string;
  deliveryAddress: string;
  isBlocked?: boolean;
}

export type UserRole = 'customer' | 'merchant' | 'agent' | 'admin' | null;

export interface Merchant {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  isOffline?: boolean;
  credentials?: string;
}

export interface Agent {
  id: string;
  name: string;
  isOnline: boolean;
  phone: string;
  credentials?: string;
}

export interface Product {
  id: string;
  merchantId: string;
  name: string;
  price: number;
  mrp?: number;
  category: string;
  inStock: boolean;
  photoUrl?: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'DENIED' | 'CANCELLED' | 'RETURN_REQUESTED';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  customerLandmark: string;
  customerAddress: string;
  deliveryOTP: string;
  extraStopSurcharge: number;
  merchantIds: string[];
  
  agentId?: string;
  agentStatus?: 'PENDING' | 'ACCEPTED';
  agentAssignedAt?: number;
}

interface AppState {
  // Hydration
  isHydrated: boolean;
  hydrate: () => Promise<void>;

  currentRole: UserRole;
  currentUserId: string | null;
  setRole: (role: UserRole, id?: string | null) => void;

  isTelugu: boolean;
  toggleLanguage: () => void;
  
  customerProfile: CustomerProfile;
  updateCustomerProfile: (updates: Partial<CustomerProfile>) => void;
  allCustomers: CustomerProfile[];
  toggleCustomerBlock: (id: string) => void;

  merchants: Merchant[];
  agents: Agent[];
  products: Product[];
  banners: Banner[];
  categories: Category[];
  
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  removeCategory: (id: string) => void;

  addBanner: (banner: Banner) => void;
  removeBanner: (id: string) => void;

  toggleProductStock: (id: string) => void;
  addProduct: (product: Product) => void;
  editProduct: (productId: string, updates: Partial<Product>) => void;
  addMerchant: (merchant: Merchant) => void;
  updateMerchant: (merchantId: string, updates: Partial<Merchant>) => void;
  toggleMerchantStatus: (merchantId: string) => void;
  
  addAgent: (agent: Agent) => void;
  removeAgent: (id: string) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  toggleAgentStatus: (agentId: string) => void;

  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  orders: Order[];
  placeOrder: (order: Omit<Order, 'id' | 'status' | 'agentId' | 'agentStatus' | 'agentAssignedAt'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string) => void;
  requestReturn: (orderId: string) => void;
  reassignAgent: (orderId: string, newAgentId: string) => void;
  acceptAgentOrder: (orderId: string) => void;
}

export const useAppStore = create<AppState>()(
  (set, get) => ({
    // ---- Hydration ----
    isHydrated: false,
    hydrate: async () => {
      try {
        const connected = await db.testConnection();
        if (!connected) {
          console.error('🔴 Supabase connection failed — app will run with empty data');
          set({ isHydrated: true });
          return;
        }

        const [merchants, agents, products, orders, banners, profile, allCustomers, categories] = await Promise.all([
          db.fetchMerchants(),
          db.fetchAgents(),
          db.fetchProducts(),
          db.fetchOrders(),
          db.fetchBanners(),
          db.fetchCustomerProfile('c1'),
          db.fetchAllCustomerProfiles(),
          db.fetchCategories(),
        ]);
        console.log('✅ Hydration complete:', { merchants: merchants.length, agents: agents.length, products: products.length, orders: orders.length, banners: banners.length, categories: categories.length });
        set({
          merchants,
          agents,
          products,
          orders,
          banners,
          categories: categories.sort((a, b) => a.displayOrder - b.displayOrder),
          allCustomers,
          customerProfile: profile || {
            name: 'Guest',
            phone: '',
            email: '',
            deliveryAddress: '',
          },
          isHydrated: true,
        });
      } catch (err) {
        console.error('🔴 Supabase hydration failed:', err);
        set({ isHydrated: true });
      }
    },

    // ---- Auth / Role ----
    currentRole: null,
    currentUserId: null,
    setRole: (role, id = null) => set({ currentRole: role, currentUserId: id }),

    // ---- Language ----
    isTelugu: false,
    toggleLanguage: () => set((state) => ({ isTelugu: !state.isTelugu })),

    // ---- Customer Profile ----
    customerProfile: {
       name: 'Guest',
       phone: '',
       email: '',
       deliveryAddress: '',
    },
    updateCustomerProfile: (updates) => {
      const newProfile = { ...get().customerProfile, ...updates };
      set({ customerProfile: newProfile });
      db.upsertCustomerProfile('c1', newProfile).catch(console.error);
    },

    // ---- All Customers (Admin) ----
    allCustomers: [],
    toggleCustomerBlock: (id) => {
      const customer = get().allCustomers.find(c => c.id === id);
      if (!customer) return;
      const isBlocked = !customer.isBlocked;
      set(s => ({ allCustomers: s.allCustomers.map(c => c.id === id ? { ...c, isBlocked } : c) }));
      db.updateCustomerBlock(id, isBlocked).catch(console.error);
    },

    // ---- Categories ----
    categories: [],
    addCategory: (cat) => {
      set(s => ({ categories: [...s.categories, cat].sort((a, b) => a.displayOrder - b.displayOrder) }));
      db.upsertCategory(cat).catch(console.error);
    },
    updateCategory: (id, updates) => {
      set(s => ({ categories: s.categories.map(c => c.id === id ? { ...c, ...updates } : c).sort((a, b) => a.displayOrder - b.displayOrder) }));
      db.updateCategoryFields(id, updates).catch(console.error);
    },
    removeCategory: (id) => {
      set(s => ({ categories: s.categories.filter(c => c.id !== id) }));
      db.deleteCategory(id).catch(console.error);
    },

    // ---- Merchants ----
    merchants: [],
    addMerchant: (merchant) => {
      set((state) => ({ merchants: [...state.merchants, merchant] }));
      db.upsertMerchant(merchant).catch(console.error);
    },
    updateMerchant: (merchantId, updates) => {
      set((state) => ({
        merchants: state.merchants.map(m => m.id === merchantId ? { ...m, ...updates } : m)
      }));
      db.updateMerchantFields(merchantId, updates).catch(console.error);
    },
    toggleMerchantStatus: (merchantId) => {
      const merchant = get().merchants.find(m => m.id === merchantId);
      if (!merchant) return;
      const newOffline = !merchant.isOffline;
      set((state) => ({
        merchants: state.merchants.map(m => m.id === merchantId ? { ...m, isOffline: newOffline } : m)
      }));
      db.updateMerchantFields(merchantId, { isOffline: newOffline }).catch(console.error);
    },

    // ---- Agents ----
    agents: [],
    addAgent: (agent) => {
      set((state) => ({ agents: [...state.agents, agent] }));
      db.insertAgent(agent).catch(console.error);
    },
    removeAgent: (id) => {
      set((state) => ({ agents: state.agents.filter(a => a.id !== id) }));
      db.deleteAgent(id).catch(console.error);
    },
    updateAgent: (agentId, updates) => {
      set((state) => ({
        agents: state.agents.map(a => a.id === agentId ? { ...a, ...updates } : a)
      }));
      db.updateAgentFields(agentId, updates).catch(console.error);
    },
    toggleAgentStatus: (agentId) => {
      const agent = get().agents.find(a => a.id === agentId);
      if (!agent) return;
      const newOnline = !agent.isOnline;
      set((state) => ({
        agents: state.agents.map(a => a.id === agentId ? { ...a, isOnline: newOnline } : a)
      }));
      db.updateAgentFields(agentId, { isOnline: newOnline }).catch(console.error);
    },

    // ---- Products ----
    products: [],
    toggleProductStock: (id) => {
      const product = get().products.find(p => p.id === id);
      if (!product) return;
      const newStock = !product.inStock;
      set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, inStock: newStock } : p)
      }));
      db.updateProductFields(id, { inStock: newStock }).catch(console.error);
    },
    addProduct: (product) => {
      set((state) => ({ products: [...state.products, product] }));
      db.insertProduct(product).catch(console.error);
    },
    editProduct: (productId, updates) => {
      set((state) => ({
        products: state.products.map(p => p.id === productId ? { ...p, ...updates } : p)
      }));
      db.updateProductFields(productId, updates).catch(console.error);
    },

    // ---- Banners ----
    banners: [],
    addBanner: (banner) => {
      set((state) => ({ banners: [...state.banners, banner] }));
      db.insertBanner(banner).catch(console.error);
    },
    removeBanner: (id) => {
      set((state) => ({ banners: state.banners.filter(b => b.id !== id) }));
      db.deleteBanner(id).catch(console.error);
    },

    // ---- Cart (client-only, no DB) ----
    cart: [],
    addToCart: (product) => set((state) => {
      const existing = state.cart.find(item => item.id === product.id);
      if (existing) {
        return { cart: state.cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) };
      }
      return { cart: [...state.cart, { ...product, quantity: 1 }] };
    }),
    removeFromCart: (productId) => set((state) => {
      const existing = state.cart.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return { cart: state.cart.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item) };
      }
      return { cart: state.cart.filter(item => item.id !== productId) };
    }),
    clearCart: () => set({ cart: [] }),

    // ---- Orders ----
    orders: [],
    placeOrder: (orderData) => {
      const state = get();
      const onlineAgents = state.agents.filter(a => a.isOnline);
      const activeOrders = state.orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'DENIED' && o.status !== 'CANCELLED');
      const busyAgentIds = activeOrders.map(o => o.agentId).filter(Boolean);
      
      const freeAgents = onlineAgents.filter(a => !busyAgentIds.includes(a.id));
      const sortedFreeAgents = [...freeAgents].sort((a,b) => state.agents.findIndex(ag=>ag.id===a.id) - state.agents.findIndex(ag=>ag.id===b.id));

      const assignedAgent = sortedFreeAgents.length > 0 ? sortedFreeAgents[0].id : (onlineAgents.length > 0 ? onlineAgents[0].id : undefined);

      const newOrder: Order = {
        ...orderData,
        id: Math.random().toString(36).substring(7),
        status: 'PENDING',
        agentId: assignedAgent,
        agentStatus: assignedAgent ? 'PENDING' : undefined,
        agentAssignedAt: assignedAgent ? Date.now() : undefined
      };

      set({ orders: [...state.orders, newOrder], cart: [] });
      db.insertOrder(newOrder).catch(console.error);
    },
    updateOrderStatus: (orderId, newStatus) => {
      set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      }));
      db.updateOrderFields(orderId, { status: newStatus }).catch(console.error);
    },
    cancelOrder: (orderId) => {
      set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' as OrderStatus } : o)
      }));
      db.updateOrderFields(orderId, { status: 'CANCELLED' }).catch(console.error);
    },
    requestReturn: (orderId) => {
      set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, status: 'RETURN_REQUESTED' as OrderStatus } : o)
      }));
      db.updateOrderFields(orderId, { status: 'RETURN_REQUESTED' }).catch(console.error);
    },
    reassignAgent: (orderId, newAgentId) => {
      const now = Date.now();
      set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, agentId: newAgentId, agentStatus: 'PENDING' as const, agentAssignedAt: now } : o)
      }));
      db.updateOrderFields(orderId, {
        agent_id: newAgentId,
        agent_status: 'PENDING',
        agent_assigned_at: now,
      }).catch(console.error);
    },
    acceptAgentOrder: (orderId) => {
      set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, agentStatus: 'ACCEPTED' as const } : o)
      }));
      db.updateOrderFields(orderId, { agent_status: 'ACCEPTED' }).catch(console.error);
    },
  })
);
