import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronLeft, ChevronRight, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { PatternLock } from "@/components/PatternLock";
import { Badge, Button, Card, Field, Input, Select, Textarea } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { fetchCustomers, fetchParts, type Part } from "@/lib/data";
import { CHECKLIST_ITEMS, DEVICE_TYPES, formatMoney, orderNumber } from "@/lib/profix";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/ordens/nova")({
  component: NovaOS,
});

const STEPS = ["Cliente", "Aparelho", "Avaliação", "Senha", "Revisão"];

type UsedPart = { part_id: string | null; name: string; quantity: number; unit_cost: number };

function NovaOS() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);

  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });
  const { data: parts = [] } = useQuery({ queryKey: ["parts"], queryFn: fetchParts });

  // etapa 1
  const [customerId, setCustomerId] = useState("");
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "", document: "", address: "" });
  const [customerMode, setCustomerMode] = useState<"existente" | "novo">("existente");
  const [search, setSearch] = useState("");

  // etapa 2
  const [device, setDevice] = useState({ device_type: "", brand: "", model: "", serial_number: "" });

  // etapa 3
  const [reportedIssue, setReportedIssue] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [checklist, setChecklist] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [usedParts, setUsedParts] = useState<UsedPart[]>([]);
  const [servicePrice, setServicePrice] = useState("");

  // etapa 4
  const [passwordType, setPasswordType] = useState("none");
  const [passwordValue, setPasswordValue] = useState("");

  const partsCost = usedParts.reduce((s, p) => s + p.unit_cost * p.quantity, 0);
  const selectedCustomer = customers.find((c) => c.id === customerId);
  const filteredCustomers = customers.filter((c) =>
    (c.name + " " + (c.phone ?? "")).toLowerCase().includes(search.trim().toLowerCase()),
  );

  async function uploadPhotos(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Sessão expirada");
      const paths: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${uid}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("os-fotos").upload(path, file, { upsert: false });
        if (error) throw error;
        paths.push(path);
      }
      setPhotos((prev) => [...prev, ...paths]);
      toast.success("Fotos anexadas");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível anexar as fotos");
    } finally {
      setUploading(false);
    }
  }

  function addPart(part: Part) {
    setUsedParts((prev) =>
      prev.some((p) => p.part_id === part.id)
        ? prev
        : [...prev, { part_id: part.id, name: part.name, quantity: 1, unit_cost: Number(part.cost_price) }],
    );
  }

  const create = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const owner_id = userData.user?.id;
      if (!owner_id) throw new Error("Sessão expirada");

      let finalCustomerId = customerId;
      if (customerMode === "novo") {
        const { data, error } = await supabase
          .from("customers")
          .insert({
            owner_id,
            name: newCustomer.name.trim(),
            phone: newCustomer.phone.trim(),
            email: newCustomer.email.trim() || null,
            document: newCustomer.document.trim() || null,
            address: newCustomer.address.trim() || null,
          })
          .select("id")
          .single();
        if (error) throw error;
        finalCustomerId = data.id;
      }
      if (!finalCustomerId) throw new Error("Selecione ou cadastre o cliente");

      const { data: order, error: orderError } = await supabase
        .from("service_orders")
        .insert({
          owner_id,
          customer_id: finalCustomerId,
          status: "aguardando aprovacao",
          quote_status: "pendente",
          device_type: device.device_type,
          brand: device.brand.trim() || null,
          model: device.model.trim() || null,
          serial_number: device.serial_number.trim() || null,
          reported_issue: reportedIssue.trim(),
          diagnosis: diagnosis.trim() || null,
          checklist,
          photos,
          password_type: passwordType,
          password_value: passwordType === "none" ? null : passwordValue,
          service_price: Number(servicePrice) || 0,
          parts_cost: partsCost,
        })
        .select("id, number")
        .single();
      if (orderError) throw orderError;

      if (usedParts.length) {
        const { error } = await supabase.from("service_order_parts").insert(
          usedParts.map((p) => ({
            owner_id,
            order_id: order.id,
            part_id: p.part_id,
            name: p.name,
            quantity: p.quantity,
            unit_cost: p.unit_cost,
          })),
        );
        if (error) throw error;
        for (const used of usedParts) {
          if (!used.part_id) continue;
          const stock = parts.find((p) => p.id === used.part_id);
          if (!stock) continue;
          await supabase
            .from("parts")
            .update({ quantity: Math.max(0, stock.quantity - used.quantity) })
            .eq("id", used.part_id);
        }
      }

      await supabase.from("order_status_events").insert({
        owner_id,
        order_id: order.id,
        status: "aguardando aprovacao",
        note: "OS criada, aguardando aprovação do cliente",
      });

      return order as { id: string; number: number };
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries();
      toast.success(`${orderNumber(order.number)} criada com sucesso`);
      navigate({ to: "/ordens/$id", params: { id: order.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao criar a ordem de serviço"),
  });

  function canAdvance() {
    if (step === 0) {
      return customerMode === "existente" ? Boolean(customerId) : newCustomer.name.trim() && newCustomer.phone.trim();
    }
    if (step === 1) return Boolean(device.device_type);
    if (step === 2) return reportedIssue.trim().length > 0;
    return true;
  }

  return (
    <AppShell title="Nova ordem de serviço" subtitle={`Etapa ${step + 1} de ${STEPS.length}: ${STEPS[step]}`}>
      <div className="mb-6 flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
              i === step
                ? "border-primary bg-primary/15 text-primary"
                : i < step
                  ? "border-primary/40 text-primary/80"
                  : "border-border text-muted-foreground",
            )}
          >
            {i < step ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
            {label}
          </div>
        ))}
      </div>

      <Card>
        {step === 0 ? (
          <div className="space-y-5">
            <div className="flex gap-2">
              <Button
                variant={customerMode === "existente" ? "primary" : "outline"}
                size="sm"
                onClick={() => setCustomerMode("existente")}
              >
                Cliente já cadastrado
              </Button>
              <Button
                variant={customerMode === "novo" ? "primary" : "outline"}
                size="sm"
                onClick={() => setCustomerMode("novo")}
              >
                Cadastrar novo cliente
              </Button>
            </div>

            {customerMode === "existente" ? (
              <div>
                <Field label="Buscar cliente">
                  <Input
                    placeholder="Nome ou telefone"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Field>
                <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCustomerId(c.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
                        customerId === c.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-surface hover:bg-surface-strong",
                      )}
                    >
                      <span>
                        <span className="block font-medium">{c.name}</span>
                        <span className="block text-xs text-muted-foreground">{c.phone}</span>
                      </span>
                      {customerId === c.id ? <Badge tone="green">Selecionado</Badge> : null}
                    </button>
                  ))}
                  {filteredCustomers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum cliente encontrado. Use “Cadastrar novo cliente”.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome completo">
                  <Input
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  />
                </Field>
                <Field label="Telefone / WhatsApp">
                  <Input
                    placeholder="(85) 99999-9999"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  />
                </Field>
                <Field label="E-mail">
                  <Input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  />
                </Field>
                <Field label="CPF / CNPJ">
                  <Input
                    value={newCustomer.document}
                    onChange={(e) => setNewCustomer({ ...newCustomer, document: e.target.value })}
                  />
                </Field>
                <Field label="Endereço" className="sm:col-span-2">
                  <Input
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  />
                </Field>
              </div>
            )}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tipo de aparelho
              </p>
              <div className="flex flex-wrap gap-2">
                {DEVICE_TYPES.map((t) => (
                  <Button
                    key={t}
                    variant={device.device_type === t ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setDevice({ ...device, device_type: t })}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Marca">
                <Input value={device.brand} onChange={(e) => setDevice({ ...device, brand: e.target.value })} />
              </Field>
              <Field label="Modelo">
                <Input value={device.model} onChange={(e) => setDevice({ ...device, model: e.target.value })} />
              </Field>
              <Field label="Número de série / IMEI">
                <Input
                  value={device.serial_number}
                  onChange={(e) => setDevice({ ...device, serial_number: e.target.value })}
                />
              </Field>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Fotos de como o aparelho chegou
              </p>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm hover:bg-surface-strong">
                <Upload className="h-4 w-4" />
                {uploading ? "Enviando..." : "Anexar fotos"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => uploadPhotos(e.target.files)}
                />
              </label>
              {photos.length ? (
                <p className="mt-2 text-sm text-muted-foreground">{photos.length} foto(s) anexada(s)</p>
              ) : null}
            </div>

            <Field label="Avaria informada pelo cliente">
              <Textarea
                value={reportedIssue}
                onChange={(e) => setReportedIssue(e.target.value)}
                placeholder="O que o cliente relatou"
              />
            </Field>

            <Field label="Diagnóstico técnico">
              <Textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="O que foi identificado na bancada"
              />
            </Field>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Checklist físico do aparelho
              </p>
              <div className="flex flex-wrap gap-2">
                {CHECKLIST_ITEMS.map((item) => {
                  const active = checklist.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setChecklist((prev) => (active ? prev.filter((i) => i !== item) : [...prev, item]))
                      }
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-surface text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Peças usadas no conserto
              </p>
              <div className="flex flex-wrap gap-2">
                {parts.map((p) => (
                  <Button key={p.id} variant="outline" size="sm" onClick={() => addPart(p)}>
                    {p.name} · {formatMoney(p.cost_price)}
                  </Button>
                ))}
                {parts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma peça no estoque ainda.</p>
                ) : null}
              </div>
              {usedParts.length ? (
                <div className="mt-3 space-y-2">
                  {usedParts.map((used, index) => (
                    <div
                      key={`${used.part_id}-${index}`}
                      className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2"
                    >
                      <span className="flex-1 text-sm font-medium">{used.name}</span>
                      <Input
                        className="w-20"
                        type="number"
                        min={1}
                        value={used.quantity}
                        onChange={(e) =>
                          setUsedParts((prev) =>
                            prev.map((p, i) =>
                              i === index ? { ...p, quantity: Math.max(1, Number(e.target.value) || 1) } : p,
                            ),
                          )
                        }
                      />
                      <Input
                        className="w-28"
                        type="number"
                        step="0.01"
                        min={0}
                        value={used.unit_cost}
                        onChange={(e) =>
                          setUsedParts((prev) =>
                            prev.map((p, i) => (i === index ? { ...p, unit_cost: Number(e.target.value) || 0 } : p)),
                          )
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setUsedParts((prev) => prev.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <p className="text-sm text-muted-foreground">
                    Custo total em peças: <strong>{formatMoney(partsCost)}</strong>
                  </p>
                </div>
              ) : null}
            </div>

            <Field label="Valor do serviço cobrado (R$)" className="max-w-xs">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
              />
            </Field>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <Field label="Tipo de senha do aparelho" className="max-w-xs">
              <Select
                value={passwordType}
                onChange={(e) => {
                  setPasswordType(e.target.value);
                  setPasswordValue("");
                }}
              >
                <option value="none">Sem senha</option>
                <option value="pin">PIN / senha digitada</option>
                <option value="desenho">Desenho (padrão)</option>
              </Select>
            </Field>
            {passwordType === "pin" ? (
              <Field label="PIN ou senha" className="max-w-xs">
                <Input value={passwordValue} onChange={(e) => setPasswordValue(e.target.value)} />
              </Field>
            ) : null}
            {passwordType === "desenho" ? (
              <PatternLock value={passwordValue} onChange={setPasswordValue} />
            ) : null}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4 text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Cliente</p>
                <p className="font-semibold">
                  {customerMode === "novo" ? newCustomer.name : (selectedCustomer?.name ?? "—")}
                </p>
                <p className="text-muted-foreground">
                  {customerMode === "novo" ? newCustomer.phone : (selectedCustomer?.phone ?? "")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Aparelho</p>
                <p className="font-semibold">
                  {device.device_type} {device.brand} {device.model}
                </p>
                <p className="text-muted-foreground">{device.serial_number || "sem número de série"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Avaria relatada</p>
                <p>{reportedIssue || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Diagnóstico</p>
                <p>{diagnosis || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Checklist</p>
                <p>{checklist.length ? checklist.join(", ") : "nenhuma avaria marcada"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Senha</p>
                <p>
                  {passwordType === "none"
                    ? "Sem senha"
                    : passwordType === "pin"
                      ? `PIN: ${passwordValue || "—"}`
                      : `Desenho: ${passwordValue || "—"}`}
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="flex justify-between">
                <span>Valor do serviço</span>
                <strong>{formatMoney(Number(servicePrice) || 0)}</strong>
              </p>
              <p className="flex justify-between text-muted-foreground">
                <span>Custo em peças</span>
                <span>{formatMoney(partsCost)}</span>
              </p>
              <p className="mt-1 flex justify-between border-t border-border pt-2">
                <span>Lucro previsto</span>
                <strong className="text-primary">{formatMoney((Number(servicePrice) || 0) - partsCost)}</strong>
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4" /> Voltar
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => {
                if (!canAdvance()) {
                  toast.error("Preencha os dados desta etapa para continuar");
                  return;
                }
                setStep((s) => s + 1);
              }}
            >
              Continuar <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => create.mutate()} disabled={create.isPending}>
              {create.isPending ? "Salvando..." : "Finalizar ordem de serviço"}
            </Button>
          )}
        </div>
      </Card>
    </AppShell>
  );
}
