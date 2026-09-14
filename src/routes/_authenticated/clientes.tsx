import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button, Card, EmptyState, Field, Input, Modal, Textarea } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { fetchCustomers, fetchOrders, type Customer } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/profix";

export const Route = createFileRoute("/_authenticated/clientes")({
  component: Clientes,
});

const EMPTY = { name: "", phone: "", email: "", document: "", address: "", notes: "" };

function Clientes() {
  const queryClient = useQueryClient();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(EMPTY);

  const { data: customers = [], isLoading } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });
  const { data: orders = [] } = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(t) || (c.phone ?? "").includes(t) || (c.document ?? "").includes(t),
    );
  }, [customers, term]);

  const save = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const owner_id = userData.user?.id;
      if (!owner_id) throw new Error("Sessão expirada");
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        document: form.document.trim() || null,
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
      };
      if (editing) {
        const { error } = await supabase.from("customers").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("customers").insert({ ...payload, owner_id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Cliente atualizado" : "Cliente cadastrado");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setOpen(false);
      setEditing(null);
      setForm(EMPTY);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar"),
  });

  function startEdit(c: Customer) {
    setEditing(c);
    setForm({
      name: c.name,
      phone: c.phone ?? "",
      email: c.email ?? "",
      document: c.document ?? "",
      address: c.address ?? "",
      notes: c.notes ?? "",
    });
    setOpen(true);
  }

  return (
    <AppShell
      title="Clientes"
      subtitle="Base de clientes da loja"
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setForm(EMPTY);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Novo cliente
        </Button>
      }
    >
      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome, telefone ou CPF"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : null}
      {!isLoading && filtered.length === 0 ? (
        <EmptyState title="Nenhum cliente encontrado" description="Cadastre o primeiro cliente da ProFix." />
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => {
          const own = orders.filter((o) => o.customer_id === c.id);
          const total = own.reduce((s, o) => s + Number(o.service_price), 0);
          return (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.phone || "sem telefone"}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => startEdit(c)}>
                  Editar
                </Button>
              </div>
              <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                {c.document ? <div>CPF/CNPJ: {c.document}</div> : null}
                {c.email ? <div>{c.email}</div> : null}
                {c.address ? <div>{c.address}</div> : null}
                <div>Cliente desde {formatDate(c.created_at)}</div>
                <div>
                  {own.length} serviço(s) · {formatMoney(total)}
                </div>
              </dl>
            </Card>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar cliente" : "Novo cliente"}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Telefone / WhatsApp">
              <Input
                required
                placeholder="(85) 99999-9999"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            <Field label="E-mail">
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="CPF / CNPJ">
              <Input value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} />
            </Field>
          </div>
          <Field label="Endereço">
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <Field label="Observações">
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Salvando..." : "Salvar cliente"}
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}
