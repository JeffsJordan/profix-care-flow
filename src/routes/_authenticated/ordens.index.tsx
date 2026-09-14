import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge, Button, EmptyState, Input, Select, statusTone } from "@/components/ui-kit";
import { fetchOrders } from "@/lib/data";
import {
  ORDER_STATUSES,
  QUOTE_LABEL,
  QUOTE_STATUSES,
  STATUS_LABEL,
  formatDate,
  formatMoney,
  orderNumber,
} from "@/lib/profix";

export const Route = createFileRoute("/_authenticated/ordens/")({
  component: Ordens,
});

function Ordens() {
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("todos");
  const [quote, setQuote] = useState("todos");
  const { data: orders = [], isLoading } = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "todos" && o.status !== status) return false;
      if (quote !== "todos" && o.quote_status !== quote) return false;
      if (!t) return true;
      return (
        String(o.number).includes(t) ||
        (o.customer?.name ?? "").toLowerCase().includes(t) ||
        (o.model ?? "").toLowerCase().includes(t) ||
        o.device_type.toLowerCase().includes(t)
      );
    });
  }, [orders, term, status, quote]);

  return (
    <AppShell
      title="Ordens de serviço"
      subtitle="Todas as OS registradas na loja"
      actions={
        <Link to="/ordens/nova">
          <Button size="lg">
            <Plus className="h-5 w-5" /> Nova ordem de serviço
          </Button>
        </Link>
      }
    >
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por número, cliente ou aparelho"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todos">Todos os status</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
        <Select value={quote} onChange={(e) => setQuote(e.target.value)}>
          <option value="todos">Todos os orçamentos</option>
          {QUOTE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {QUOTE_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : null}
      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma ordem de serviço"
          description="Clique em “Nova ordem de serviço” para cadastrar o primeiro aparelho."
        />
      ) : null}

      <div className="space-y-2">
        {filtered.map((o) => (
          <div
            key={o.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-4"
          >
            <div className="min-w-48">
              <p className="font-semibold">
                {orderNumber(o.number)} · {o.customer?.name ?? "Cliente"}
              </p>
              <p className="text-xs text-muted-foreground">
                {o.device_type} {o.brand ?? ""} {o.model ?? ""} · entrada {formatDate(o.created_at)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(o.quote_status)}>{QUOTE_LABEL[o.quote_status]}</Badge>
              <Badge tone={statusTone(o.status)}>{STATUS_LABEL[o.status]}</Badge>
              <span className="text-sm font-semibold">{formatMoney(o.service_price)}</span>
              <Link to="/ordens/$id" params={{ id: o.id }}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" /> Abrir
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
