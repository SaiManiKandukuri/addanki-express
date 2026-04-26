import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Banner {
  id: string;
  photoUrl: string;
}

export interface CustomerProfile {
  name: string;
  phone: string;
  credentials?: string;
  email: string;
  deliveryAddress: string;
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
  mrp?: number; // Added Striked Price target
  category: 'Milk' | 'Meat' | 'Veggies' | 'Kirana' | 'Snacks';
  inStock: boolean;
  photoUrl?: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'DENIED';

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
  
  // Phase 8 telemetry
  agentId?: string;
  agentStatus?: 'PENDING' | 'ACCEPTED';
  agentAssignedAt?: number;
}

interface AppState {
  currentRole: UserRole;
  currentUserId: string | null;
  setRole: (role: UserRole, id?: string | null) => void;

  isTelugu: boolean;
  toggleLanguage: () => void;
  
  customerProfile: CustomerProfile;
  updateCustomerProfile: (updates: Partial<CustomerProfile>) => void;

  merchants: Merchant[];
  agents: Agent[];
  products: Product[];
  banners: Banner[];
  
  addBanner: (banner: Banner) => void;
  removeBanner: (id: string) => void;

  toggleProductStock: (id: string) => void;
  addProduct: (product: Product) => void;
  editProduct: (productId: string, updates: Partial<Product>) => void;
  addMerchant: (merchant: Merchant) => void;
  updateMerchant: (merchantId: string, updates: Partial<Merchant>) => void;
  toggleMerchantStatus: (merchantId: string) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  toggleAgentStatus: (agentId: string) => void;

  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  orders: Order[];
  placeOrder: (order: Omit<Order, 'id' | 'status' | 'agentId' | 'agentStatus' | 'agentAssignedAt'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  reassignAgent: (orderId: string, newAgentId: string) => void;
  acceptAgentOrder: (orderId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentRole: null,
      currentUserId: null,
      setRole: (role, id = null) => set({ currentRole: role, currentUserId: id }),

      isTelugu: false,
      toggleLanguage: () => set((state) => ({ isTelugu: !state.isTelugu })),

      customerProfile: {
         name: 'Sai Mani Kandukuri',
         phone: '9346701988',
         email: 'saimani@example.com',
         deliveryAddress: 'RTC Bus Stand, Addanki'
      },
      updateCustomerProfile: (updates) => set((state) => ({ customerProfile: { ...state.customerProfile, ...updates }})),

      agents: [
        { id: 'a1', name: 'Raju G.', isOnline: true, phone: '9876500001', credentials: 'pass_raju' },
        { id: 'a2', name: 'Subbu K.', isOnline: true, phone: '9876500002', credentials: 'pass_subbu' },
        { id: 'a3', name: 'Venkat', isOnline: false, phone: '9876500003', credentials: 'pass_venkat' },
      ],

      merchants: [
        { id: 'm1', name: 'Sangam Dairy', rating: 4.8, deliveryTime: '10 mins', isOffline: false, credentials: 'pass_sangam' },
        { id: 'm2', name: 'Sri Rama Supermarket', rating: 4.5, deliveryTime: '15 mins', isOffline: false, credentials: 'pass_srirama' },
        { id: 'm3', name: 'Kanna Meat Mart', rating: 4.7, deliveryTime: '20 mins', isOffline: false, credentials: 'pass_kanna' },
      ],
      
      products: [
        { id: 'p1', merchantId: 'm1', name: 'Fresh Milk (1L)', price: 60, mrp: 75, category: 'Milk', inStock: true, description: 'Daily fresh cow milk.' },
        { id: 'p4', merchantId: 'm1', name: 'Paneer (200g)', price: 90, mrp: 110, category: 'Milk', inStock: true },
        { id: 'p2', merchantId: 'm2', name: 'Toor Dal (1kg)', price: 160, mrp: 190, category: 'Kirana', inStock: true },
        { id: 'p6', merchantId: 'm2', name: 'Lays Magic Masala', price: 20, mrp: 20, category: 'Snacks', inStock: true },
        { id: 'p8', merchantId: 'm3', name: 'Tender Chicken (1kg)', price: 280, mrp: 320, category: 'Meat', inStock: true },
      ],
      
      banners: [],
      
      addBanner: (banner) => set((state) => ({ banners: [...state.banners, banner] })),
      removeBanner: (id) => set((state) => ({ banners: state.banners.filter(b => b.id !== id) })),

      toggleProductStock: (id) => 
        set((state) => ({ products: state.products.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p) })),
      addProduct: (product) => 
        set((state) => ({ products: [...state.products, product] })),
      editProduct: (productId, updates) => 
        set((state) => ({ products: state.products.map(p => p.id === productId ? { ...p, ...updates } : p) })),
      addMerchant: (merchant) => 
        set((state) => ({ merchants: [...state.merchants, merchant] })),
      updateMerchant: (merchantId, updates) => 
        set((state) => ({ merchants: state.merchants.map(m => m.id === merchantId ? { ...m, ...updates } : m) })),
      toggleMerchantStatus: (merchantId) => 
        set((state) => ({ merchants: state.merchants.map(m => m.id === merchantId ? { ...m, isOffline: !m.isOffline } : m) })),
      updateAgent: (agentId, updates) => 
        set((state) => ({ agents: state.agents.map(a => a.id === agentId ? { ...a, ...updates } : a) })),
      toggleAgentStatus: (agentId) => 
        set((state) => ({ agents: state.agents.map(a => a.id === agentId ? { ...a, isOnline: !a.isOnline } : a) })),

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

      orders: [],
      placeOrder: (orderData) => set((state) => {
        const onlineAgents = state.agents.filter(a => a.isOnline);
        const activeOrders = state.orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'DENIED');
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
        return { orders: [...state.orders, newOrder], cart: [] };
      }),
      updateOrderStatus: (orderId, newStatus) => set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      })),
      reassignAgent: (orderId, newAgentId) => set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, agentId: newAgentId, agentStatus: 'PENDING', agentAssignedAt: Date.now() } : o)
      })),
      acceptAgentOrder: (orderId) => set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, agentStatus: 'ACCEPTED' } : o)
      })),
    }),
    {
      name: 'addanki-express-mock-db-v3', // Schema upgrade
    }
  )
);
