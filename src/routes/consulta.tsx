import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Search } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button, Card, Field, Input } from "@/components/ui-kit";
import { findPublicOrder } from "@/lib/public-order.functions";
import { onlyDigits } from "@/lib/profix";

export const Route = createFileRoute("/consulta")({
  head: () => ({
    meta: [
      { title: "Consultar minha OS — ProFix Assistência Técnica" },
      { name: "description", content: "Acompanhe o conserto do seu aparelho na ProFix com o número da OS e seu nome." },
      { property: "og:title", content: "Consultar minha OS — ProFix" },
      { property: "og:description", content: "Informe o número da OS e seu nome para acompanhar seu conserto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Consulta,
});

function Consulta() {
  const navigate = useNavigate();
  const find = useServerFn(findPublicOrder);
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const n = Number(onlyDigits(number));
    if (!n || name.trim().length < 2) {
      setError("Informe o número da OS e seu nome.");
      return;
    }
    setLoading(true);
    try {
      const { token } = await find({ data: { number: n, name } });
      if (!token) setError("Não encontramos uma OS com esse número e nome. Confira os dados.");
      else navigate({ to: "/os/$token", params: { token } });
    } catch {
      setError("Não foi possível consultar agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo className="h-14" />
        </div>
        <Card>
          <h1 className="text-xl font-bold">Consultar minha ordem de serviço</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Digite o número da OS que você recebeu e o seu nome.
          </p>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <Field label="Número da OS">
              <Input placeholder="Ex.: 1023 ou OS-01023" value={number} onChange={(e) => setNumber(e.target.value)} />
            </Field>
            <Field label="Seu nome">
              <Input placeholder="Nome usado no cadastro" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              <Search className="h-4 w-4" /> {loading ? "Buscando..." : "Ver minha OS"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
