import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownCircle, ArrowUpCircle, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button, Card, EmptyState, Field, Input, Modal, Select } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { fetchCashMovements, fetchOrders } from "@/lib/data";
import { summarize } from "@/lib/metrics";
import { formatDateTime, formatMoney } from "@/lib/profix";

export const Route = createFileRoute("/_authenticated/caixa")({
  component: Caixa,
});

type PeriodType = "tudo" | "dia" | "semana" | "mes" | "ano";

function weekRange(ref: string): [Date, Date] | null {
  if (!ref) return null;
  const d = new Date(`${ref}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return [start, end];
}

function Caixa() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ kind: "entrada", amount: "", description: "", category: "" });
  const [periodType, setPeriodType] = useState<PeriodType>("tudo");
  const [dayFilter, setDayFilter] = useState("");
  const [weekRef, setWeekRef] = useState("");
  const [monthFilter, setMonthFilter] = useState(() => new Date().toISOString().slice(0, 7));
  const [year, setYear] = useState(() => String(new Date().getFullYear()));

  const { data: movements = [], isLoading } = useQuery({ queryKey: ["cash"], queryFn: fetchCashMovements });
  const { data: orders = [] } = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });

  const day = summarize(orders, movements, "dia");
  const month = summarize(orders, movements, "mes");

  const filtered = useMemo(
    () =>
      movements.filter((m) => {
        const d = new Date(m.occurred_at);
        if (periodType === "dia" && dayFilter) {
          const [y = 0, mo = 0, da = 0] = dayFilter.split("-").map(Number);
          return d.getFullYear() === y && d.getMonth() + 1 === mo && d.getDate() === da;
        }
        if (periodType === "semana" && weekRef) {
          const range = weekRange(weekRef);
          if (!range) return true;
          const only = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          return only >= range[0] && only <= range[1];
        }
        if (periodType === "mes" && monthFilter) {
          const [y = 0, mo = 0] = monthFilter.split("-").map(Number);
          return d.getFullYear() === y && d.getMonth() + 1 === mo;
        }
        if (periodType === "ano" && year) return d.getFullYear() === Number(year);
        return true;
      }),
    [movements, periodType, dayFilter, weekRef, monthFilter, year],
  );

  const filteredIn = useMemo(() => filtered.filter((m) => m.kind === "entrada").reduce((s, m) => s + Number(m.amount), 0), [filtered]);
  const filteredOut = useMemo(() => filtered.filter((m) => m.kind === "saida").reduce((s, m) => s + Number(m.amount), 0), [filtered]);

  const periodLabel = useMemo(() => {
    if (periodType === "tudo") return "todo o período";
    if (periodType === "dia") return dayFilter ? `dia ${new Date(`${dayFilter}T12:00:00`).toLocaleDateString("pt-BR")}` : "escolha o dia";
    if (periodType === "semana") {
      const range = weekRange(weekRef);
      return range ? `semana de ${range[0].toLocaleDateString("pt-BR")} a ${range[1].toLocaleDateString("pt-BR")}` : "escolha um dia da semana";
    }
    if (periodType === "mes") {
      if (!monthFilter) return "escolha o mês";
      const [y = 0, mo = 0] = monthFilter.split("-").map(Number);
      return new Date(y, mo - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    }
    return year ? `ano de ${year}` : "escolha o ano";
  }, [periodType, dayFilter, weekRef, monthFilter, year]);

  const save = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const owner_id = userData.user?.id;
      if (!owner_id) throw new Error("Sessão expirada");
      const { error } = await supabase.from("cash_movements").insert({
        owner_id,
        kind: form.kind,
        amount: Number(form.amount) || 0,
        description: form.description.trim(),
        category: form.category.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Movimento registrado");
      queryClient.invalidateQueries({ queryKey: ["cash"] });
      setOpen(false);
      setForm({ kind: "entrada", amount: "", description: "", category: "" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao registrar"),
  });

  return (
    <AppShell
      title="Caixa"
      subtitle="Entradas e saídas de dinheiro da loja"
      actions={
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Novo movimento
        </Button>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Entradas de hoje</p>
          <p className="mt-2 text-2xl font-bold text-primary">{formatMoney(day.cashIn)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Saídas de hoje</p>
          <p className="mt-2 text-2xl font-bold text-destructive">{formatMoney(day.expenses)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Saldo de hoje</p>
          <p className="mt-2 text-2xl font-bold">{formatMoney(day.cashBalance)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Saldo do mês</p>
          <p className="mt-2 text-2xl font-bold">{formatMoney(month.cashBalance)}</p>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Pesquisar por período">
            <Select value={periodType} onChange={(e) => setPeriodType(e.target.value as PeriodType)}>
              <option value="tudo">Todo o período</option>
              <option value="dia">Dia</option>
              <option value="semana">Semana</option>
              <option value="mes">Mês</option>
              <option value="ano">Ano</option>
            </Select>
          </Field>
          {periodType === "dia" ? (
            <Field label="Dia">
              <Input type="date" value={dayFilter} onChange={(e) => setDayFilter(e.target.value)} />
            </Field>
          ) : null}
          {periodType === "semana" ? (
            <Field label="Semana (escolha um dia dela)">
              <Input type="date" value={weekRef} onChange={(e) => setWeekRef(e.target.value)} />
            </Field>
          ) : null}
          {periodType === "mes" ? (
            <Field label="Mês">
              <Input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} />
            </Field>
          ) : null}
          {periodType === "ano" ? (
            <Field label="Ano">
              <Input type="number" min={2000} max={2100} value={year} onChange={(e) => setYear(e.target.value)} />
            </Field>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-border pt-4 text-sm">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{periodLabel}</span>
          <span>Entradas: <strong className="text-primary">{formatMoney(filteredIn)}</strong></span>
          <span>Saídas: <strong className="text-destructive">{formatMoney(filteredOut)}</strong></span>
          <span>Saldo: <strong>{formatMoney(filteredIn - filteredOut)}</strong></span>
          <span className="text-xs text-muted-foreground">{filtered.length} lançamento(s)</span>
        </div>
      </Card>

      {isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : null}
      {!isLoading && movements.length === 0 ? (
        <EmptyState title="Nenhum movimento registrado" description="As entradas de serviços finalizados também podem ser lançadas aqui." />
      ) : null}

      <div className="space-y-2">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3"
          >
            <div className="flex items-center gap-3">
              {m.kind === "entrada" ? (
                <ArrowUpCircle className="h-5 w-5 text-primary" />
              ) : (
                <ArrowDownCircle className="h-5 w-5 text-destructive" />
              )}
              <div>
                <p className="font-medium">{m.description || (m.kind === "entrada" ? "Entrada" : "Saída")}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(m.occurred_at)}
                  {m.category ? ` · ${m.category}` : ""}
                </p>
              </div>
            </div>
            <span className={m.kind === "entrada" ? "font-semibold text-primary" : "font-semibold text-destructive"}>
              {m.kind === "entrada" ? "+" : "-"} {formatMoney(m.amount)}
            </span>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Novo movimento de caixa">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tipo">
              <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </Select>
            </Field>
            <Field label="Valor (R$)">
              <Input
                required
                type="number"
                step="0.01"
                min={0}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Descrição">
            <Input
              required
              placeholder="Pagamento de serviço, compra de peças, aluguel..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field label="Categoria">
            <Input
              placeholder="Serviços, peças, despesa fixa..."
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </Field>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Salvando..." : "Registrar"}
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}
