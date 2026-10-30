import { createFileRoute, Link } from "@tanstack/react-router";
import { Cpu, FileText, Laptop, LogIn, Mail, MessageCircle, Printer, Search, Wrench } from "lucide-react";
import { LogoHome } from "@/components/Logo";
import { Button } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "ProFix Assistência Técnica — Reparos e manutenção" },
      {
        name: "description",
        content:
          "Assistência técnica ProFix para computadores, notebooks, celulares, videogames e impressoras. Peça um orçamento ou acompanhe sua ordem de serviço.",
      },
      { property: "og:title", content: "ProFix Assistência Técnica — Reparos e manutenção" },
      {
        property: "og:description",
        content: "Reparos, manutenção preventiva e upgrades. Fale com a ProFix ou consulte sua ordem de serviço.",
      },
    ],
  }),
  component: Home,
});

const WHATSAPP_URL = "https://wa.me/message/XVFH5T47U736O1";
const EMAIL = "profixassistenciatec@gmail.com";

const SERVICES = [
  { icon: Cpu, title: "Manutenção de PC", text: "Reparos em placas-mãe, placas de vídeo, fontes e diagnóstico completo de hardware." },
  { icon: Laptop, title: "Notebooks, Celulares e Videogames", text: "Troca de telas, baterias, conectores e reparos em consoles de videogame e portáteis." },
  { icon: Wrench, title: "Limpeza Preventiva & Upgrades", text: "Troca de pasta térmica, remoção de poeira e instalação de SSDs e memórias para mais desempenho." },
  { icon: Printer, title: "Impressoras & Periféricos", text: "Diagnóstico e reparos para travamentos, falhas de impressão e problemas em periféricos." },
];

function Home() {
  return (
    <div className="profix-home flex min-h-screen flex-col bg-background">
      <header className="relative z-10 border-b border-border/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-5 gap-y-3 px-5 py-4 text-xs text-muted-foreground sm:px-8">
          <a href={`mailto:${EMAIL}`} className="flex min-w-0 items-center gap-2 transition-colors hover:text-primary">
            <Mail className="h-4 w-4 shrink-0 text-primary" />
            <span className="break-all">{EMAIL}</span>
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors hover:text-primary">
            <MessageCircle className="h-4 w-4 text-primary" /> Fale com a gente no WhatsApp
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-5 pb-14 pt-8 sm:px-8 sm:pt-10">
        <section className="flex flex-col items-center text-center" aria-label="ProFix Assistência Técnica">
          <LogoHome className="h-auto w-60 max-w-full sm:w-72" />
          <h1 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            <span className="sr-only">ProFix Assistência Técnica. </span>
            Seu Aparelho em Boas Mãos.
            <span className="block text-brand-gradient">Volte ao que Importa.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Reparos e manutenção com cuidado, transparência e atenção a cada detalhe para devolver o desempenho do seu equipamento.
          </p>
          <div className="mt-8 grid w-full grid-cols-2 gap-3 lg:grid-cols-4">
            <Link to="/auth" className="min-w-0">
              <Button className="h-16 w-full px-3"><LogIn className="h-5 w-5 shrink-0" /><span>Entrar no sistema</span></Button>
            </Link>
            <Link to="/consulta" className="min-w-0">
              <Button variant="outline" className="h-16 w-full px-3"><Search className="h-5 w-5 shrink-0 text-primary" /><span>Consultar minha OS</span></Button>
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="min-w-0">
              <Button variant="outline" className="h-16 w-full px-3"><FileText className="h-5 w-5 shrink-0 text-primary" /><span>Pedir um orçamento</span></Button>
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="min-w-0">
              <Button variant="outline" className="h-16 w-full px-3"><MessageCircle className="h-5 w-5 shrink-0 text-primary" /><span>WhatsApp</span></Button>
            </a>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="Serviços da ProFix">
          {SERVICES.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-lg border border-border/50 bg-surface p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                <h2 className="text-sm font-bold sm:text-base">{title}</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/40 px-5 py-6 text-center text-xs text-muted-foreground">
        <p>© 2026 ProFix Assistência Técnica. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
