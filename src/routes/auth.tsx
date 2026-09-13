import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button, Field, Input } from "@/components/ui-kit";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — ProFix Assistência Técnica" },
      { name: "description", content: "Acesso da equipe ProFix ao sistema de ordens de serviço." },
      { property: "og:title", content: "Entrar — ProFix Assistência Técnica" },
      { property: "og:description", content: "Acesso da equipe ProFix ao sistema." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/painel", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/painel" },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
        navigate({ to: "/painel", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/painel", replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível entrar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="circuit-top flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo className="h-24" />
        </div>
        <div className="panel p-6">
          <h1 className="text-xl font-bold">
            {mode === "login" ? "Entrar no sistema" : "Criar acesso"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Área exclusiva da equipe ProFix.
          </p>

          {checkEmail ? (
            <div className="mt-6 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm">
              Enviamos um e-mail de confirmação para <strong>{email}</strong>. Abra o link do e-mail
              para ativar o acesso e depois entre normalmente.
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <Field label="E-mail">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@profix.com"
                />
              </Field>
              <Field label="Senha">
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </Field>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar acesso"}
              </Button>
            </form>
          )}

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setCheckEmail(false);
            }}
            className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "login" ? "Ainda não tenho acesso — criar conta" : "Já tenho acesso — entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
