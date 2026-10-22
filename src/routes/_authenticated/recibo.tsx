import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { FileDown, Printer, Search, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { Button, Card, Field, Input, Select } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { fetchOrderParts, partsTotal, type OrderWithCustomer } from "@/lib/data";
import { formatMoney, moneyInWords, onlyDigits, orderNumber, whatsappLink } from "@/lib/profix";

export const Route = createFileRoute("/_authenticated/recibo")({
  head: () => ({ meta: [{ title: "Recibo de pagamento — ProFix" }] }),
  component: ReciboPage,
});

const METHODS = ["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito", "Transferência"];

function ReciboPage() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<OrderWithCustomer | null>(null);
  const [method, setMethod] = useState("Pix");
  const [printing, setPrinting] = useState(false);

  const search = useMutation({
    mutationFn: async () => {
      const n = Number(onlyDigits(query));
      if (!n) throw new Error("Informe o número da OS");
      const { data, error } = await supabase
        .from("service_orders")
        .select("*, customer:customers(*)")
        .eq("number", n)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("OS não encontrada");
      const parts = await fetchOrderParts(data.id);
      const o = data as unknown as OrderWithCustomer;
      return { ...o, service_price: Number(o.service_price) + partsTotal(parts) };
    },
    onSuccess: setOrder,
    onError: (e) => {
      setOrder(null);
      toast.error(e instanceof Error ? e.message : "Erro ao buscar a OS");
    },
  });

  useEffect(() => {
    if (!printing) return;
    const t = setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 200);
    return () => clearTimeout(t);
  }, [printing]);

  const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const value = Number(order?.service_price ?? 0);
  const deviceLine = order ? [order.device_type, order.brand, order.model].filter(Boolean).join(" ") : "";
  const service = order ? order.diagnosis || order.reported_issue || "serviço técnico" : "";

  const message = order
    ? `*ProFix Assistência Técnica — Recibo de pagamento*\n` +
      `Recibo referente à ${orderNumber(order.number)}\n\n` +
      `Recebemos de *${order.customer?.name ?? ""}* a importância de *${formatMoney(value)}* ` +
      `(${moneyInWords(value)}), referente ao serviço em ${deviceLine}: ${service}.\n` +
      `Forma de pagamento: ${method}\n` +
      `Data: ${today}\n\nObrigado pela preferência!`
    : "";

  return (
    <AppShell title="Recibo de pagamento" subtitle="Informe o número da OS para gerar o recibo">
      <div className="no-print grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Card>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                search.mutate();
              }}
            >
              <Field label="Número da OS">
                <Input placeholder="Ex.: 1023 ou OS-01023" value={query} onChange={(e) => setQuery(e.target.value)} />
              </Field>
              <Button type="submit" className="w-full" disabled={search.isPending}>
                <Search className="h-4 w-4" /> {search.isPending ? "Buscando..." : "Gerar recibo"}
              </Button>
            </form>
          </Card>
          {order ? (
            <Card>
              <Field label="Forma de pagamento">
                <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                  {METHODS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </Select>
              </Field>
              <div className="mt-4 space-y-2">
                <a href={whatsappLink(order.customer?.phone ?? "", message)} target="_blank" rel="noreferrer">
                  <Button className="w-full">
                    <Send className="h-4 w-4" /> Enviar no WhatsApp
                  </Button>
                </a>
                <Button variant="outline" className="w-full" onClick={() => setPrinting(true)}>
                  <FileDown className="h-4 w-4" /> Baixar em PDF
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setPrinting(true)}>
                  <Printer className="h-4 w-4" /> Imprimir
                </Button>
                <p className="text-xs text-muted-foreground">
                  Para baixar, escolha “Salvar como PDF” na janela de impressão.
                </p>
              </div>
            </Card>
          ) : null}
        </div>

        {order ? (
          <div className="overflow-x-auto">
            <ReceiptDoc order={order} value={value} method={method} today={today} deviceLine={deviceLine} service={service} />
          </div>
        ) : (
          <Card>
            <p className="text-sm text-muted-foreground">O recibo aparecerá aqui depois de buscar a OS.</p>
          </Card>
        )}
      </div>

      {printing && order ? (
        <div className="print-area fixed inset-0 z-50 overflow-auto bg-white p-6">
          <ReceiptDoc order={order} value={value} method={method} today={today} deviceLine={deviceLine} service={service} />
        </div>
      ) : null}
    </AppShell>
  );
}

function ReceiptDoc({
  order,
  value,
  method,
  today,
  deviceLine,
  service,
}: {
  order: OrderWithCustomer;
  value: number;
  method: string;
  today: string;
  deviceLine: string;
  service: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[760px] rounded-lg border-2 border-[#0b2545] bg-white p-8 text-sm text-[#0b2545]">
      <div className="flex items-start justify-between gap-4 border-b-2 border-[#0b2545] pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-[#0b2545] p-2">
            <Logo className="h-10" />
          </div>
          <div>
            <p className="text-lg font-bold">ProFix Assistência Técnica</p>
            <p className="text-xs">Celulares · Notebooks · Computadores · Consoles</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tracking-widest">RECIBO</p>
          <p className="text-xs">Nº {orderNumber(order.number)}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <div className="rounded-md border-2 border-[#16a34a] px-4 py-2 text-right">
          <p className="text-[10px] uppercase tracking-wide">Valor</p>
          <p className="text-xl font-bold">{formatMoney(value)}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4 leading-relaxed">
        <p>
          Recebi(emos) de <strong className="border-b border-dotted border-[#0b2545]">{order.customer?.name ?? "—"}</strong>
          {order.customer?.document ? <>, CPF/CNPJ {order.customer.document}</> : null}, a importância de{" "}
          <strong>{formatMoney(value)}</strong> (<em>{moneyInWords(value)}</em>), referente ao serviço técnico
          realizado no aparelho <strong>{deviceLine}</strong>
          {order.serial_number ? <> (SN/IMEI {order.serial_number})</> : null}: {service}.
        </p>
        <p>
          Forma de pagamento: <strong>{method}</strong>
        </p>
        <p>Para maior clareza, firmo(amos) o presente recibo, dando plena e geral quitação do valor acima.</p>
      </div>

      <table className="mt-6 w-full border-collapse text-xs">
        <tbody>
          <tr>
            <td className="border border-[#0b2545]/40 p-2 font-semibold">Cliente</td>
            <td className="border border-[#0b2545]/40 p-2">{order.customer?.name}</td>
            <td className="border border-[#0b2545]/40 p-2 font-semibold">Telefone</td>
            <td className="border border-[#0b2545]/40 p-2">{order.customer?.phone}</td>
          </tr>
          <tr>
            <td className="border border-[#0b2545]/40 p-2 font-semibold">Ordem de serviço</td>
            <td className="border border-[#0b2545]/40 p-2">{orderNumber(order.number)}</td>
            <td className="border border-[#0b2545]/40 p-2 font-semibold">Aparelho</td>
            <td className="border border-[#0b2545]/40 p-2">{deviceLine}</td>
          </tr>
        </tbody>
      </table>

      <p className="mt-8 text-right">{today}</p>

      <div className="mt-12 flex justify-center">
        <div className="w-72 border-t border-[#0b2545] pt-1 text-center text-xs">
          ProFix Assistência Técnica
          <br />
          Assinatura do responsável
        </div>
      </div>
    </div>
  );
}
