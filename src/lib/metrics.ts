import type { CashMovement, OrderWithCustomer } from "./data";
import { periodStart, quoteFromStatus } from "./profix";

export type Period = "dia" | "semana" | "mes" | "ano";

export function isConcluded(o: OrderWithCustomer) {
  return o.status === "finalizado" || o.status === "entregue";
}

export function summarize(
  orders: OrderWithCustomer[],
  movements: CashMovement[],
  period: Period,
) {
  const start = periodStart(period);
  const inPeriod = (iso: string) => new Date(iso) >= start;

  const created = orders.filter((o) => inPeriod(o.created_at));
  const billed = orders.filter(
    (o) =>
      isConcluded(o) &&
      quoteFromStatus(o.status) === "aceito" &&
      inPeriod(o.finished_at ?? o.updated_at),
  );

  const revenue = billed.reduce((s, o) => s + Number(o.service_price), 0);
  const partsCost = billed.reduce((s, o) => s + Number(o.parts_cost), 0);

  const cashIn = movements
    .filter((m) => m.kind === "entrada" && inPeriod(m.occurred_at))
    .reduce((s, m) => s + Number(m.amount), 0);
  const expenses = movements
    .filter((m) => m.kind === "saida" && inPeriod(m.occurred_at))
    .reduce((s, m) => s + Number(m.amount), 0);

  const quotesSent = created.length;
  const accepted = created.filter((o) => quoteFromStatus(o.status) === "aceito").length;
  const rejected = created.filter((o) => quoteFromStatus(o.status) === "recusado").length;
  const pending = created.filter((o) => quoteFromStatus(o.status) === "pendente").length;

  return {
    revenue,
    partsCost,
    grossProfit: revenue,
    netProfit: revenue - partsCost - expenses,
    expenses,
    cashIn,
    cashBalance: cashIn - expenses,
    servicesDone: billed.length,
    quotesSent,
    accepted,
    rejected,
    pending,
    acceptanceRate: quotesSent ? Math.round((accepted / quotesSent) * 100) : 0,
  };
}

export function openOrders(orders: OrderWithCustomer[]) {
  return orders.filter((o) => o.status === "recebido" || o.status === "em andamento");
}
