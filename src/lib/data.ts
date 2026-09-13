import { supabase } from "@/integrations/supabase/client";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  document: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
};

export type ServiceOrder = {
  id: string;
  number: number;
  customer_id: string;
  device_type: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  reported_issue: string;
  diagnosis: string | null;
  checklist: string[];
  photos: string[];
  password_type: string;
  password_value: string | null;
  service_price: number;
  parts_cost: number;
  status: string;
  quote_status: string;
  public_token: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  finished_at: string | null;
  quote_responded_at: string | null;
};

export type OrderWithCustomer = ServiceOrder & { customer: Customer | null };

export type Part = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  quantity: number;
  min_quantity: number;
  cost_price: number;
  sale_price: number;
};

export type CashMovement = {
  id: string;
  kind: string;
  amount: number;
  description: string;
  category: string | null;
  occurred_at: string;
  order_id: string | null;
};

export async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function fetchCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Customer[];
}

export async function fetchOrders() {
  const { data, error } = await supabase
    .from("service_orders")
    .select("*, customer:customers(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as OrderWithCustomer[];
}

export async function fetchOrder(id: string) {
  const { data, error } = await supabase
    .from("service_orders")
    .select("*, customer:customers(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as OrderWithCustomer | null;
}

export async function fetchOrderParts(orderId: string) {
  const { data, error } = await supabase
    .from("service_order_parts")
    .select("*")
    .eq("order_id", orderId);
  if (error) throw error;
  return (data ?? []) as { id: string; name: string; quantity: number; unit_cost: number; part_id: string | null }[];
}

export async function fetchStatusEvents(orderId: string) {
  const { data, error } = await supabase
    .from("order_status_events")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as { id: string; status: string; note: string | null; created_at: string }[];
}

export async function fetchParts() {
  const { data, error } = await supabase.from("parts").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as Part[];
}

export async function fetchCashMovements() {
  const { data, error } = await supabase
    .from("cash_movements")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as CashMovement[];
}

export async function signedPhotoUrls(paths: string[]) {
  if (!paths.length) return [];
  const { data, error } = await supabase.storage.from("os-fotos").createSignedUrls(paths, 3600);
  if (error) throw error;
  return (data ?? []).map((item) => item.signedUrl).filter(Boolean) as string[];
}
