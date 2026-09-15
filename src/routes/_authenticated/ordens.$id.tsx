import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Copy, FileText, Printer, Receipt, Send, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { PatternLock } from "@/components/PatternLock";
import { Badge, Button, Card, Field, Select, statusTone } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { fetchOrder, fetchOrderParts, fetchStatusEvents, signedPhotoUrls } from "@/lib/data";
import {
  ORDER_STATUSES,
  QUOTE_LABEL,
  STATUS_LABEL,
  formatDate,
  formatDateTime,
  formatMoney,
  orderNumber,
  publicOrderUrl,
  whatsappLink,
} from "@/lib/profix";

export const Route = createFileRoute("/_authenticated/ordens/$id")({
  component: OrderDetail,
});

type PrintMode = "os" | "etiqueta" | "cupom" | null;

function OrderDetail() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [printMode, setPrintMode] = useState<PrintMode>(null);

  const { data: order, isLoading } = useQuery({ queryKey: ["order", id], queryFn: () => fetchOrder(id) });
  const { data: usedParts = [] } = useQuery({ queryKey: ["order-parts", id], queryFn: () => fetchOrderParts(id) });
  const { data: events = [] } = useQuery({ queryKey: ["order-events", id], queryFn: () => fetchStatusEvents(id) });
  const { data: photoUrls = [] } = useQuery({
    queryKey: ["order-photos", id, order?.photos],
    queryFn: () => signedPhotoUrls(order?.photos ?? []),
    enabled: Boolean(order?.photos?.length),
  });

  useEffect(() => {
    if (!printMode) return;
    const timer = setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 250);
    return () => clearTimeout(timer);
  }, [printMode]);

  const changeStatus = useMutation({
    mutationFn: async (status: string) => {
      const { data: userData } = await supabase.auth.getUser();
      const owner_id = userData.user?.id;
      if (!owner_id || !order) throw new Error("Sessão expirada");
      const { error } = await supabase
        .from("service_orders")
        .update({ status, completed_at: status === "finalizado" ? new Date().toISOString() : order.completed_at })
        .eq("id", order.id);
      if (error) throw error;
      await supabase.from("order_status_events").insert({ owner_id, order_id: order.id, status });
    },
    onSuccess: () => {
      toast.success("Status atualizado");
      queryClient.invalidateQueries();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao atualizar"),
  });

  if (isLoading) {
    return (
      <AppShell title="Ordem de serviço">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </AppShell>
    );
  }

  if (!order) {
    return (
      <AppShell title="Ordem de serviço">
        <p className="text-sm text-muted-foreground">Ordem de serviço não encontrada.</p>
      </AppShell>
    );
  }

  const link = publicOrderUrl(order.public_token);
  const deviceLine = [order.device_type, order.brand, order.model].filter(Boolean).join(" ");

  const osMessage =
    `*ProFix Assistência Técnica*\n` +
    `Olá, ${order.customer?.name ?? ""}! Sua ordem de serviço ${orderNumber(order.number)} está pronta para conferência.\n\n` +
    `Aparelho: ${deviceLine}\n` +
    `Serviço: ${formatMoney(order.service_price)}\n\n` +
    `Veja os detalhes e aprove o orçamento neste link:\n${link}`;

  const statusMessage =
    `*ProFix* — atualização da ${orderNumber(order.number)}\n` +
    `Aparelho: ${deviceLine}\n` +
    `Status atual: *${STATUS_LABEL[order.status] ?? order.status}*\n\n` +
    `Acompanhe pelo link: ${link}`;

  return (
    <AppShell
      title={`${orderNumber(order.number)} · ${order.customer?.name ?? "Cliente"}`}
      subtitle={`${deviceLine} · entrada em ${formatDate(order.created_at)}`}
      actions={
        <Link to="/ordens">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        </Link>
      }
    >
      <div className="no-print grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(order.status)}>{STATUS_LABEL[order.status] ?? order.status}</Badge>
              <Badge tone={statusTone(order.quote_status)}>{QUOTE_LABEL[order.quote_status] ?? order.quote_status}</Badge>
            </div>
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <Info label="Cliente" value={order.customer?.name ?? "—"} />
              <Info label="Telefone" value={order.customer?.phone ?? "—"} />
              <Info label="Aparelho" value={deviceLine} />
              <Info label="Número de série / IMEI" value={order.serial_number ?? "—"} />
              <Info label="Avaria relatada" value={order.reported_issue || "—"} />
              <Info label="Diagnóstico" value={order.diagnosis || "—"} />
            </div>

            {order.checklist?.length ? (
              <div className="mt-5">
                <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Checklist físico</p>
                <div className="flex flex-wrap gap-2">
                  {order.checklist.map((item) => (
                    <Badge key={item} tone="amber">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-5">
              <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Senha do aparelho</p>
              {order.password_type === "desenho" ? (
                <PatternLock value={order.password_value ?? ""} readOnly />
              ) : (
                <p className="text-sm">
                  {order.password_type === "pin" ? order.password_value : "Sem senha"}
                </p>
              )}
            </div>

            {photoUrls.length ? (
              <div className="mt-5">
                <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Fotos da entrada</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {photoUrls.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer">
                      <img src={url} alt="Foto do aparelho" className="h-28 w-full rounded-lg object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold">Valores</h2>
            <div className="space-y-1 text-sm">
              <Row label="Valor do serviço" value={formatMoney(order.service_price)} />
              <Row label="Investido em peças" value={formatMoney(order.parts_cost)} />
              <Row
                label="Lucro líquido do serviço"
                value={formatMoney(Number(order.service_price) - Number(order.parts_cost))}
                strong
              />
            </div>
            {usedParts.length ? (
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p className="text-xs uppercase tracking-wide">Peças usadas</p>
                {usedParts.map((p) => (
                  <p key={p.id}>
                    {p.quantity}x {p.name} · {formatMoney(p.unit_cost * p.quantity)}
                  </p>
                ))}
              </div>
            ) : null}
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold">Histórico</h2>
            <div className="space-y-2 text-sm">
              {events.map((e) => (
                <div key={e.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <span>{STATUS_LABEL[e.status] ?? e.status}</span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(e.created_at)}</span>
                </div>
              ))}
              {events.length === 0 ? <p className="text-muted-foreground">Sem movimentações.</p> : null}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <Field label="Status do serviço">
              <Select value={order.status} onChange={(e) => changeStatus.mutate(e.target.value)}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </Select>
            </Field>
            <a href={whatsappLink(order.customer?.phone ?? "", statusMessage)} target="_blank" rel="noreferrer">
              <Button className="mt-3 w-full">
                <Send className="h-4 w-4" /> Avisar status no WhatsApp
              </Button>
            </a>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold">Enviar e imprimir</h2>
            <div className="space-y-2">
              <a href={whatsappLink(order.customer?.phone ?? "", osMessage)} target="_blank" rel="noreferrer">
                <Button className="w-full">
                  <Send className="h-4 w-4" /> Enviar OS no WhatsApp
                </Button>
              </a>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(link);
                  toast.success("Link do cliente copiado");
                }}
              >
                <Copy className="h-4 w-4" /> Copiar link do cliente
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setPrintMode("os")}>
                <FileText className="h-4 w-4" /> Salvar OS em PDF
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setPrintMode("etiqueta")}>
                <Tag className="h-4 w-4" /> Imprimir etiqueta adesiva
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setPrintMode("cupom")}>
                <Receipt className="h-4 w-4" /> Imprimir cupom térmico
              </Button>
              <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <Printer className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Na janela de impressão escolha “Salvar como PDF” para gerar o arquivo.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {printMode ? (
        <div className="print-area fixed inset-0 z-50 overflow-auto bg-white p-6 text-black">
          {printMode === "os" ? (
            <div className="mx-auto max-w-[720px] text-sm">
              <h1 className="text-2xl font-bold">ProFix Assistência Técnica</h1>
              <p className="mb-4">
                Ordem de serviço <strong>{orderNumber(order.number)}</strong> · {formatDate(order.created_at)}
              </p>
              <p>
                <strong>Cliente:</strong> {order.customer?.name} — {order.customer?.phone}
              </p>
              <p>
                <strong>Aparelho:</strong> {deviceLine} {order.serial_number ? `· SN ${order.serial_number}` : ""}
              </p>
              <p>
                <strong>Avaria relatada:</strong> {order.reported_issue}
              </p>
              <p>
                <strong>Diagnóstico:</strong> {order.diagnosis || "—"}
              </p>
              <p>
                <strong>Checklist:</strong> {order.checklist?.join(", ") || "—"}
              </p>
              <p>
                <strong>Valor do serviço:</strong> {formatMoney(order.service_price)}
              </p>
              <p className="mt-6">Acompanhe pelo link: {link}</p>
              <p className="mt-10">___________________________________</p>
              <p>Assinatura do cliente</p>
            </div>
          ) : null}

          {printMode === "etiqueta" ? (
            <div className="w-[62mm] border border-black p-2 text-[10px] leading-tight">
              <p className="text-sm font-bold">ProFix · {orderNumber(order.number)}</p>
              <p>{order.customer?.name}</p>
              <p>{order.customer?.phone}</p>
              <p>{deviceLine}</p>
              <p>
                Senha: {order.password_type === "none" ? "—" : order.password_value}
              </p>
              <p>Entrada: {formatDate(order.created_at)}</p>
            </div>
          ) : null}

          {printMode === "cupom" ? (
            <div className="w-[80mm] text-[11px] leading-tight">
              <p className="text-center text-sm font-bold">PROFIX ASSISTÊNCIA TÉCNICA</p>
              <p className="text-center">{orderNumber(order.number)}</p>
              <p>--------------------------------</p>
              <p>Cliente: {order.customer?.name}</p>
              <p>Tel: {order.customer?.phone}</p>
              <p>Aparelho: {deviceLine}</p>
              <p>Avaria: {order.reported_issue}</p>
              <p>--------------------------------</p>
              <p>Serviço: {formatMoney(order.service_price)}</p>
              <p>Status: {STATUS_LABEL[order.status]}</p>
              <p>--------------------------------</p>
              <p className="break-all">{link}</p>
              <p className="text-center">Obrigado pela preferência!</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5">{value}</p>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <p className={`flex justify-between ${strong ? "border-t border-border pt-2 font-semibold text-primary" : ""}`}>
      <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </p>
  );
}
