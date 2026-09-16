import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, Button, Card, EmptyState, statusTone } from "@/components/ui-kit";
import { fetchCashMovements, fetchOrders } from "@/lib/data";
import { openOrders, summarize } from "@/lib/metrics";
import {
  QUOTE_LABEL,
  STATUS_LABEL,
  formatDate,
  formatMoney,
  orderNumber,
  quoteFromStatus,
} from "@/lib/profix";

export const Route = createFileRoute("/_authenticated/painel")({
  component: Painel,
});

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}

function Painel() {
  const { data: orders = [], isLoading } = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });
  const { data: movements = [] } = useQuery({ queryKey: ["cash"], queryFn: fetchCashMovements });

  const day = summarize(orders, movements, "dia");
  const week = summarize(orders, movements, "semana");
  const month = summarize(orders, movements, "mes");
  const bench = openOrders(orders);

  return (
    <AppShell
      title="Painel"
      subtitle="Resumo do movimento da loja"
      actions={
        <Link to="/ordens/nova">
          <Button>
            <Plus className="h-4 w-4" /> Nova ordem de serviço
          </Button>
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Faturamento hoje" value={formatMoney(day.revenue)} hint={`${day.servicesDone} serviço(s) concluído(s)`} />
        <Metric label="Faturamento da semana" value={formatMoney(week.revenue)} />
        <Metric label="Faturamento do mês" value={formatMoney(month.revenue)} />
        <Metric
          label="Lucro líquido do mês"
          value={formatMoney(month.netProfit)}
          hint={`Peças: ${formatMoney(month.partsCost)} · Despesas: ${formatMoney(month.expenses)}`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Metric label="Orçamentos enviados no mês" value={String(month.quotesSent)} />
        <Metric
          label="Aceitos no mês"
          value={String(month.accepted)}
          hint={`${month.acceptanceRate}% de aprovação`}
        />
        <Metric label="Recusados no mês" value={String(month.rejected)} hint={`${month.pending} aguardando resposta`} />
      </div>

      <div className="panel mt-6 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Aparelhos na bancada ({bench.length})</h2>
          <Link to="/ordens" className="text-sm text-primary hover:underline">
            Ver todas <ArrowRight className="inline h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : null}
          {!isLoading && bench.length === 0 ? (
            <EmptyState title="Nenhum aparelho em atendimento" description="Crie uma nova ordem de serviço para começar." />
          ) : null}
          {bench.slice(0, 8).map((o) => (
            <Link
              key={o.id}
              to="/ordens/$id"
              params={{ id: o.id }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-strong"
            >
              <div>
                <p className="font-semibold">
                  {orderNumber(o.number)} · {o.customer?.name ?? "Cliente"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {o.device_type} {o.brand ?? ""} {o.model ?? ""} · entrada {formatDate(o.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={statusTone(quoteFromStatus(o.status))}>
                  {QUOTE_LABEL[quoteFromStatus(o.status)]}
                </Badge>
                <Badge tone={statusTone(o.status)}>{STATUS_LABEL[o.status]}</Badge>
                <span className="text-sm font-semibold">{formatMoney(o.service_price)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
