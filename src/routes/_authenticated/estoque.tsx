import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Button, Card, EmptyState, Field, Input, Modal } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { fetchParts, type Part } from "@/lib/data";
import { formatMoney } from "@/lib/profix";

export const Route = createFileRoute("/_authenticated/estoque")({
  component: Estoque,
});

const EMPTY = { name: "", sku: "", category: "", quantity: "0", min_quantity: "1", cost_price: "0", sale_price: "0" };

function Estoque() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Part | null>(null);
  const [form, setForm] = useState(EMPTY);

  const { data: parts = [], isLoading } = useQuery({ queryKey: ["parts"], queryFn: fetchParts });

  const save = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const owner_id = userData.user?.id;
      if (!owner_id) throw new Error("Sessão expirada");
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        category: form.category.trim() || null,
        quantity: Number(form.quantity) || 0,
        min_quantity: Number(form.min_quantity) || 0,
        cost_price: Number(form.cost_price) || 0,
        sale_price: Number(form.sale_price) || 0,
      };
      if (editing) {
        const { error } = await supabase.from("parts").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("parts").insert({ ...payload, owner_id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Peça salva");
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      setOpen(false);
      setEditing(null);
      setForm(EMPTY);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar"),
  });

  const adjust = useMutation({
    mutationFn: async ({ part, delta }: { part: Part; delta: number }) => {
      const next = Math.max(0, part.quantity + delta);
      const { error } = await supabase.from("parts").update({ quantity: next }).eq("id", part.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["parts"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao atualizar"),
  });

  const lowStock = parts.filter((p) => p.quantity <= p.min_quantity);
  const stockValue = parts.reduce((s, p) => s + Number(p.cost_price) * p.quantity, 0);

  return (
    <AppShell
      title="Estoque de peças"
      subtitle="Quantidades, custo e preço de venda"
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setForm(EMPTY);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Nova peça
        </Button>
      }
    >
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Itens cadastrados</p>
          <p className="mt-2 text-2xl font-bold">{parts.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Valor investido em estoque</p>
          <p className="mt-2 text-2xl font-bold">{formatMoney(stockValue)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Estoque baixo</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-bold">
            {lowStock.length}
            {lowStock.length ? <AlertTriangle className="h-5 w-5 text-warning" /> : null}
          </p>
        </Card>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : null}
      {!isLoading && parts.length === 0 ? (
        <EmptyState title="Nenhuma peça cadastrada" description="Cadastre as peças que você usa nos consertos." />
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {parts.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.sku ? `Cód. ${p.sku} · ` : ""}
                  {p.category ?? "sem categoria"}
                </p>
              </div>
              {p.quantity <= p.min_quantity ? <Badge tone="amber">Repor</Badge> : <Badge tone="green">Ok</Badge>}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => adjust.mutate({ part: p, delta: -1 })}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-14 text-center text-xl font-bold">{p.quantity}</span>
              <Button variant="outline" size="icon" onClick={() => adjust.mutate({ part: p, delta: 1 })}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => {
                  setEditing(p);
                  setForm({
                    name: p.name,
                    sku: p.sku ?? "",
                    category: p.category ?? "",
                    quantity: String(p.quantity),
                    min_quantity: String(p.min_quantity),
                    cost_price: String(p.cost_price),
                    sale_price: String(p.sale_price),
                  });
                  setOpen(true);
                }}
              >
                Editar
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Custo {formatMoney(p.cost_price)} · Venda {formatMoney(p.sale_price)}
            </p>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar peça" : "Nova peça"}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome da peça">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Código">
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </Field>
            <Field label="Categoria">
              <Input
                placeholder="Tela, bateria, conector..."
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </Field>
            <Field label="Quantidade">
              <Input
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </Field>
            <Field label="Estoque mínimo">
              <Input
                type="number"
                min={0}
                value={form.min_quantity}
                onChange={(e) => setForm({ ...form, min_quantity: e.target.value })}
              />
            </Field>
            <Field label="Custo (R$)">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={form.cost_price}
                onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
              />
            </Field>
            <Field label="Preço de venda (R$)">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={form.sale_price}
                onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
              />
            </Field>
          </div>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Salvando..." : "Salvar peça"}
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}
