import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Clock, PackageCheck, Wrench, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, statusTone } from "@/components/ui-kit";
import { Logo } from "@/components/Logo";
import { getPublicOrder, respondPublicQuote } from "@/lib/public-order.functions";
import { QUOTE_LABEL, STATUS_LABEL, formatDate, formatDateTime, formatMoney, orderNumber } from "@/lib/profix";

export const Route = createFileRoute("/os/$token")({
  loader: ({ params }) => getPublicOrder({ data: { token: params.token } }),
  head: () => ({
    meta: [
      { title: "Sua ordem de serviço — ProFix" },
      { name: "description", content: "Acompanhe o conserto do seu aparelho e aprove o orçamento da ProFix." },
      { property: "og:title", content: "Sua ordem de serviço — ProFix" },
      { property: "og:description", content: "Acompanhe o conserto do seu aparelho e aprove o orçamento." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PublicOrder,
  errorComponent: () => <Message text="Não foi possível carregar esta ordem de serviço." />,
  notFoundComponent: () => <Message text="Ordem de serviço não encontrada." />,
});

const FLOW = ["recebido", "em andamento", "finalizado", "entregue"];
const ICONS = [Clock, Wrench, CheckCircle2, PackageCheck];

function PublicOrder() {
  const order = Route.useLoaderData();
  const { token } = Route.useParams();
  const router = useRouter();
  const respond = useServerFn(respondPublicQuote);
  const [sending, setSending] = useState(false);

  if (!order) return <Message text="Ordem de serviço não encontrada." />;

  const deviceLine = [order.device_type, order.brand, order.model].filter(Boolean).join(" ");
  const currentIndex = FLOW.indexOf(order.status);

  async function decide(decision: "aceito" | "recusado") {
    setSending(true);
    try {
      const result = await respond({ data: { token, decision } });
      toast[result.ok ? "success" : "error"](result.message);
      await router.invalidate();
    } catch {
      toast.error("Não foi possível registrar sua resposta.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex justify-center">
          <Logo className="h-14" />
        </div>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">{orderNumber(order.number)}</h1>
              <p className="text-sm text-muted-foreground">
                {order.customer_name} · entrada em {formatDate(order.created_at)}
              </p>
            </div>
            <Badge tone={statusTone(order.status)}>{STATUS_LABEL[order.status] ?? order.status}</Badge>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <Line label="Aparelho" value={deviceLine} />
            <Line label="Problema relatado" value={order.reported_issue} />
            {order.diagnosis ? <Line label="Diagnóstico da assistência" value={order.diagnosis} /> : null}
            {order.checklist.length ? <Line label="Estado do aparelho" value={order.checklist.join(", ")} /> : null}
          </div>

          <div className="mt-6 rounded-xl border border-border bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Valor do serviço</p>
            <p className="text-3xl font-bold text-primary">{formatMoney(order.service_price)}</p>
          </div>

          <div className="mt-6">
            {order.quote_status === "pendente" ? (
              <div className="flex flex-wrap gap-3">
                <Button size="lg" disabled={sending} onClick={() => decide("aceito")}>
                  <CheckCircle2 className="h-5 w-5" /> Contratar serviço
                </Button>
                <Button variant="outline" size="lg" disabled={sending} onClick={() => decide("recusado")}>
                  <XCircle className="h-5 w-5" /> Não quero agora
                </Button>
              </div>
            ) : (
              <Badge tone={statusTone(order.quote_status)}>
                Orçamento {QUOTE_LABEL[order.quote_status] ?? order.quote_status}
              </Badge>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Acompanhamento do serviço</h2>
          <div className="space-y-4">
            {FLOW.map((s, i) => {
              const Icon = ICONS[i] ?? Clock;
              const done = i <= currentIndex;
              return (
                <div key={s} className="flex items-center gap-3">
                  <span
                    className={
                      done
                        ? "flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground"
                        : "flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground"
                    }
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className={done ? "font-semibold" : "text-muted-foreground"}>{STATUS_LABEL[s] ?? s}</span>
                </div>
              );
            })}
          </div>

          {order.events.length ? (
            <div className="mt-6 space-y-1 text-xs text-muted-foreground">
              {order.events.map((e, i) => (
                <p key={`${e.status}-${i}`}>
                  {formatDateTime(e.created_at)} — {STATUS_LABEL[e.status] ?? e.status}
                </p>
              ))}
            </div>
          ) : null}
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          ProFix Assistência Técnica · este link é exclusivo do seu atendimento.
        </p>
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p>{value}</p>
    </div>
  );
}

function Message({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-center text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
