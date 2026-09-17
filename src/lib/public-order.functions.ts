import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const tokenSchema = z.object({ token: z.string().min(10).max(100) });

export type PublicOrder = {
  number: number;
  device_type: string;
  brand: string | null;
  model: string | null;
  reported_issue: string;
  diagnosis: string | null;
  checklist: string[];
  service_price: number;
  status: string;
  quote_status: string;
  created_at: string;
  customer_name: string | null;
  events: { status: string; created_at: string }[];
};

export const getPublicOrder = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }): Promise<PublicOrder | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("service_orders")
      .select(
        "id, number, device_type, brand, model, reported_issue, diagnosis, checklist, service_price, status, quote_status, created_at, customers(name)",
      )
      .eq("public_token", data.token)
      .maybeSingle();
    if (error || !order) return null;

    const { data: events } = await supabaseAdmin
      .from("order_status_events")
      .select("status, created_at")
      .eq("order_id", (order as { id: string }).id)
      .order("created_at", { ascending: true });

    const row = order as unknown as PublicOrder & { customers: { name: string } | null };
    return {
      number: row.number,
      device_type: row.device_type,
      brand: row.brand,
      model: row.model,
      reported_issue: row.reported_issue,
      diagnosis: row.diagnosis,
      checklist: row.checklist ?? [],
      service_price: Number(row.service_price),
      status: row.status,
      quote_status: row.quote_status,
      created_at: row.created_at,
      customer_name: row.customers?.name ?? null,
      events: (events ?? []).map((e) => ({ status: String(e.status), created_at: String(e.created_at) })),
    };
  });

export const respondPublicQuote = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    tokenSchema.extend({ decision: z.enum(["aceito", "recusado"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("service_orders")
      .select("id, owner_id, quote_status")
      .eq("public_token", data.token)
      .maybeSingle();
    if (error || !order) throw new Error("Ordem de serviço não encontrada");

    const row = order as unknown as { id: string; owner_id: string; quote_status: string };
    if (row.quote_status !== "pendente") {
      return { ok: false, message: "Este orçamento já foi respondido." };
    }

    const nextStatus = data.decision === "aceito" ? "recebido" : "rejeitada";

    const { error: updateError } = await supabaseAdmin
      .from("service_orders")
      .update({
        quote_status: data.decision,
        status: nextStatus,
        quote_responded_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    if (updateError) throw new Error("Não foi possível registrar a resposta");

    await supabaseAdmin.from("order_status_events").insert({
      owner_id: row.owner_id,
      order_id: row.id,
      status: nextStatus,
      note: data.decision === "aceito" ? "Serviço contratado pelo cliente" : "Orçamento recusado pelo cliente",
    });

    return { ok: true, message: data.decision === "aceito" ? "Serviço contratado!" : "Orçamento recusado." };
  });
