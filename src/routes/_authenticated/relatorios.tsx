import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { Button, Card } from "@/components/ui-kit";
import { fetchCashMovements, fetchOrders } from "@/lib/data";
import { summarize, type Period } from "@/lib/metrics";
import { PERIOD_LABEL, formatMoney } from "@/lib/profix";

export const Route = createFileRoute("/_authenticated/relatorios")({
  component: Relatorios,
});

const PERIODS: Period[] = ["dia", "semana", "mes", "ano"];

function Relatorios() {
  const [period, setPeriod] = useState<Period>("mes");
  const { data: orders = [] } = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });
  const { data: movements = [] } = useQuery({ queryKey: ["cash"], queryFn: fetchCashMovements });

  const s = summarize(orders, movements, period);

  const financeData = [
    { nome: "Faturamento", valor: s.revenue },
    { nome: "Peças", valor: s.partsCost },
    { nome: "Despesas", valor: s.expenses },
    { nome: "Lucro líquido", valor: s.netProfit },
  ];

  const quoteData = [
    { nome: "Aceitos", valor: s.accepted, cor: "var(--color-chart-1)" },
    { nome: "Recusados", valor: s.rejected, cor: "var(--color-chart-4)" },
    { nome: "Aguardando", valor: s.pending, cor: "var(--color-chart-3)" },
  ];

  return (
    <AppShell title="Relatórios" subtitle="Faturamento, lucro e aproveitamento dos orçamentos">
      <div className="mb-6 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <Button key={p} variant={p === period ? "primary" : "outline"} size="sm" onClick={() => setPeriod(p)}>
            {PERIOD_LABEL[p]}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Faturamento bruto</p>
          <p className="mt-2 text-2xl font-bold">{formatMoney(s.revenue)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{s.servicesDone} serviço(s) concluído(s)</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Investido em peças</p>
          <p className="mt-2 text-2xl font-bold">{formatMoney(s.partsCost)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Outras despesas</p>
          <p className="mt-2 text-2xl font-bold">{formatMoney(s.expenses)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Lucro líquido</p>
          <p className="mt-2 text-2xl font-bold text-primary">{formatMoney(s.netProfit)}</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="mb-4 text-lg font-semibold">Dinheiro do período</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeData}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="nome" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  formatter={(v: number) => formatMoney(v)}
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="valor" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="mb-4 text-lg font-semibold">
            Orçamentos enviados: {s.quotesSent} · {s.acceptanceRate}% contratados
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={quoteData} dataKey="valor" nameKey="nome" innerRadius={60} outerRadius={100}>
                  {quoteData.map((entry) => (
                    <Cell key={entry.nome} fill={entry.cor} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
