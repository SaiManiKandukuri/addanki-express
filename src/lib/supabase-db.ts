import { supabase } from './supabase';
import type { Merchant, Agent, Product, Order, Banner, CustomerProfile, CartItem } from '@/store/useStore';

// ============================================
// Connection Test
// ============================================

export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('merchants').select('id').limit(1);
    if (error) {
      console.error('❌ Supabase connection test FAILED:', error.message, error);
      return false;
    }
    console.log('✅ Supabase connection OK — merchants table accessible, rows:', data?.length);
    return true;
  } catch (err) {
    console.error('❌ Supabase connection test EXCEPTION:', err);
    return false;
  }
}

// ============================================
// Debug logger for all DB operations
// ============================================

function logDbOp(op: string, table: string, detail?: any) {
  console.log(`🔵 DB ${op} → ${table}`, detail ?? '');
}

function logDbError(op: string, table: string, error: any) {
  console.error(`🔴 DB ${op} FAILED → ${table}:`, error?.message ?? error, error);
}

function logDbSuccess(op: string, table: string, detail?: any) {
  console.log(`🟢 DB ${op} OK → ${table}`, detail ?? '');
}

// ============================================
// Merchants
// ============================================

export async function fetchMerchants(): Promise<Merchant[]> {
  logDbOp('SELECT', 'merchants');
  const { data, error } = await supabase.from('merchants').select('*');
  if (error) { logDbError('SELECT', 'merchants', error); throw error; }
  logDbSuccess('SELECT', 'merchants', `${data?.length} rows`);
  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    rating: Number(row.rating),
    deliveryTime: row.delivery_time,
    isOffline: row.is_offline,
    credentials: row.credentials ?? undefined,
  }));
}

export async function upsertMerchant(merchant: Merchant): Promise<void> {
  const payload = {
    id: merchant.id,
    name: merchant.name,
    rating: merchant.rating,
    delivery_time: merchant.deliveryTime,
    is_offline: merchant.isOffline ?? false,
    credentials: merchant.credentials ?? null,
  };
  logDbOp('UPSERT', 'merchants', payload);
  const { data, error } = await supabase.from('merchants').upsert(payload).select();
  if (error) { logDbError('UPSERT', 'merchants', error); throw error; }
  logDbSuccess('UPSERT', 'merchants', data);
}

export async function updateMerchantFields(id: string, updates: Partial<Merchant>): Promise<void> {
  const mapped: Record<string, unknown> = {};
  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.rating !== undefined) mapped.rating = updates.rating;
  if (updates.deliveryTime !== undefined) mapped.delivery_time = updates.deliveryTime;
  if (updates.isOffline !== undefined) mapped.is_offline = updates.isOffline;
  if (updates.credentials !== undefined) mapped.credentials = updates.credentials;
  logDbOp('UPDATE', 'merchants', { id, mapped });
  const { data, error } = await supabase.from('merchants').update(mapped).eq('id', id).select();
  if (error) { logDbError('UPDATE', 'merchants', error); throw error; }
  logDbSuccess('UPDATE', 'merchants', data);
}

// ============================================
// Agents
// ============================================

export async function fetchAgents(): Promise<Agent[]> {
  logDbOp('SELECT', 'agents');
  const { data, error } = await supabase.from('agents').select('*');
  if (error) { logDbError('SELECT', 'agents', error); throw error; }
  logDbSuccess('SELECT', 'agents', `${data?.length} rows`);
  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    isOnline: row.is_online,
    phone: row.phone,
    credentials: row.credentials ?? undefined,
  }));
}

export async function updateAgentFields(id: string, updates: Partial<Agent>): Promise<void> {
  const mapped: Record<string, unknown> = {};
  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.isOnline !== undefined) mapped.is_online = updates.isOnline;
  if (updates.phone !== undefined) mapped.phone = updates.phone;
  if (updates.credentials !== undefined) mapped.credentials = updates.credentials;
  logDbOp('UPDATE', 'agents', { id, mapped });
  const { data, error } = await supabase.from('agents').update(mapped).eq('id', id).select();
  if (error) { logDbError('UPDATE', 'agents', error); throw error; }
  logDbSuccess('UPDATE', 'agents', data);
}

// ============================================
// Products
// ============================================

export async function fetchProducts(): Promise<Product[]> {
  logDbOp('SELECT', 'products');
  const { data, error } = await supabase.from('products').select('*');
  if (error) { logDbError('SELECT', 'products', error); throw error; }
  logDbSuccess('SELECT', 'products', `${data?.length} rows`);
  return (data || []).map(row => ({
    id: row.id,
    merchantId: row.merchant_id,
    name: row.name,
    price: row.price,
    mrp: row.mrp ?? undefined,
    category: row.category,
    inStock: row.in_stock,
    photoUrl: row.photo_url ?? undefined,
    description: row.description ?? undefined,
  }));
}

export async function insertProduct(product: Product): Promise<void> {
  const payload = {
    id: product.id,
    merchant_id: product.merchantId,
    name: product.name,
    price: product.price,
    mrp: product.mrp ?? null,
    category: product.category,
    in_stock: product.inStock,
    photo_url: product.photoUrl ?? null,
    description: product.description ?? null,
  };
  logDbOp('INSERT', 'products', payload);
  const { data, error } = await supabase.from('products').insert(payload).select();
  if (error) { logDbError('INSERT', 'products', error); throw error; }
  logDbSuccess('INSERT', 'products', data);
}

export async function updateProductFields(id: string, updates: Partial<Product>): Promise<void> {
  const mapped: Record<string, unknown> = {};
  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.price !== undefined) mapped.price = updates.price;
  if (updates.mrp !== undefined) mapped.mrp = updates.mrp;
  if (updates.category !== undefined) mapped.category = updates.category;
  if (updates.inStock !== undefined) mapped.in_stock = updates.inStock;
  if (updates.photoUrl !== undefined) mapped.photo_url = updates.photoUrl;
  if (updates.description !== undefined) mapped.description = updates.description;
  logDbOp('UPDATE', 'products', { id, mapped });
  const { data, error } = await supabase.from('products').update(mapped).eq('id', id).select();
  if (error) { logDbError('UPDATE', 'products', error); throw error; }
  logDbSuccess('UPDATE', 'products', data);
}

// ============================================
// Orders
// ============================================

export async function fetchOrders(): Promise<Order[]> {
  logDbOp('SELECT', 'orders');
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: true });
  if (error) { logDbError('SELECT', 'orders', error); throw error; }
  logDbSuccess('SELECT', 'orders', `${data?.length} rows`);
  return (data || []).map(row => ({
    id: row.id,
    items: row.items as CartItem[],
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
  }));
}

export async function insertOrder(order: Order): Promise<void> {
  const payload = {
    id: order.id,
    items: order.items,
    total: order.total,
    status: order.status,
    customer_landmark: order.customerLandmark,
    customer_address: order.customerAddress,
    delivery_otp: order.deliveryOTP,
    extra_stop_surcharge: order.extraStopSurcharge,
    merchant_ids: order.merchantIds,
    agent_id: order.agentId ?? null,
    agent_status: order.agentStatus ?? null,
    agent_assigned_at: order.agentAssignedAt ?? null,
  };
  logDbOp('INSERT', 'orders', payload);
  const { data, error } = await supabase.from('orders').insert(payload).select();
  if (error) { logDbError('INSERT', 'orders', error); throw error; }
  logDbSuccess('INSERT', 'orders', data);
}

export async function updateOrderFields(id: string, updates: Partial<Record<string, unknown>>): Promise<void> {
  logDbOp('UPDATE', 'orders', { id, updates });
  const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select();
  if (error) { logDbError('UPDATE', 'orders', error); throw error; }
  logDbSuccess('UPDATE', 'orders', data);
}

// ============================================
// Banners
// ============================================

export async function fetchBanners(): Promise<Banner[]> {
  logDbOp('SELECT', 'banners');
  const { data, error } = await supabase.from('banners').select('*');
  if (error) { logDbError('SELECT', 'banners', error); throw error; }
  logDbSuccess('SELECT', 'banners', `${data?.length} rows`);
  return (data || []).map(row => ({
    id: row.id,
    photoUrl: row.photo_url,
  }));
}

export async function insertBanner(banner: Banner): Promise<void> {
  const payload = { id: banner.id, photo_url: banner.photoUrl };
  logDbOp('INSERT', 'banners', payload);
  const { data, error } = await supabase.from('banners').insert(payload).select();
  if (error) { logDbError('INSERT', 'banners', error); throw error; }
  logDbSuccess('INSERT', 'banners', data);
}

export async function deleteBanner(id: string): Promise<void> {
  logDbOp('DELETE', 'banners', { id });
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) { logDbError('DELETE', 'banners', error); throw error; }
  logDbSuccess('DELETE', 'banners', { id });
}

// ============================================
// Customer Profiles
// ============================================

export async function fetchCustomerProfile(id: string = 'c1'): Promise<CustomerProfile | null> {
  logDbOp('SELECT', 'customer_profiles', { id });
  const { data, error } = await supabase.from('customer_profiles').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') { logDbSuccess('SELECT', 'customer_profiles', 'not found'); return null; }
    logDbError('SELECT', 'customer_profiles', error);
    throw error;
  }
  logDbSuccess('SELECT', 'customer_profiles', data);
  return {
    name: data.name,
    phone: data.phone,
    email: data.email,
    deliveryAddress: data.delivery_address,
  };
}

export async function upsertCustomerProfile(id: string, profile: CustomerProfile): Promise<void> {
  const payload = {
    id,
    name: profile.name,
    phone: profile.phone,
    email: profile.email,
    delivery_address: profile.deliveryAddress,
  };
  logDbOp('UPSERT', 'customer_profiles', payload);
  const { data, error } = await supabase.from('customer_profiles').upsert(payload).select();
  if (error) { logDbError('UPSERT', 'customer_profiles', error); throw error; }
  logDbSuccess('UPSERT', 'customer_profiles', data);
}
