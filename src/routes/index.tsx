import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Package, ShieldCheck, Wallet } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProFix Assistência Técnica — Gestão da loja" },
      {
        name: "description",
        content:
          "ProFix: ordens de serviço, estoque de peças, caixa e relatórios de lucro para assistência técnica de celulares, computadores, notebooks e consoles.",
      },
      { property: "og:title", content: "ProFix Assistência Técnica — Gestão da loja" },
      {
        property: "og:description",
        content: "Controle de ordens de serviço, peças, caixa e faturamento da ProFix.",
      },
    ],
  }),
  component: Home,
});

const HIGHLIGHTS = [
  { icon: ClipboardList, title: "Ordens de serviço", text: "Cadastro em etapas, fotos, checklist e senha do aparelho." },
  { icon: Package, title: "Estoque de peças", text: "Baixa automática das peças usadas em cada conserto." },
  { icon: Wallet, title: "Caixa e faturamento", text: "Lucro bruto e líquido por dia, semana, mês e ano." },
  { icon: ShieldCheck, title: "Link do cliente", text: "O cliente acompanha o status e contrata pelo WhatsApp." },
];

function Home() {
  return (
    <div className="circuit-top min-h-screen bg-background">
      <div className="relative z-10 mx-auto max-w-5xl px-5 py-16">
        <div className="flex flex-col items-center text-center">
          <Logo className="h-28" />
          <h1 className="mt-8 max-w-2xl text-3xl font-bold leading-tight lg:text-5xl">
            A sua assistência técnica <span className="text-brand-gradient">organizada</span> de
            ponta a ponta
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Entrada e saída de aparelhos, orçamentos aceitos e recusados, peças, caixa e lucro real
            de cada serviço — tudo em um só lugar.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/auth">
              <Button size="lg">Entrar no sistema</Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2">
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="panel p-5">
              <Icon className="h-6 w-6 text-primary" />
              <h2 className="mt-3 text-lg font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
