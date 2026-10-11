# Corrigir o link da OS que pede login na Lovable

## Diagnóstico (confirmado)

O link enviado ao cliente é montado em `src/lib/profix.ts` (`publicOrderUrl`) usando o endereço que está aberto na sua tela. Como você usa o app pelo endereço de **pré-visualização** (`id-preview--....lovable.app`), o link sai com esse endereço — e a pré-visualização exige login na Lovable. Por isso o cliente cai numa tela de login.

As páginas do cliente (`/os/$token` e `/consulta`) já são públicas e não pedem login do app — o bloqueio é só do endereço de pré-visualização.

## Correção

1. **Publicar o aplicativo.** Ao publicar, o ProFix ganha um endereço público (`....lovable.app`) que qualquer pessoa abre sem login. Depois de publicado, os links gerados de dentro do app publicado já funcionam para o cliente.

2. **Fixar o endereço público nos links.** Mesmo assim, vou ajustar a geração do link para usar sempre o endereço público do app (e não o da pré-visualização). Assim, mesmo que você copie o link ou envie o WhatsApp a partir da pré-visualização, o cliente recebe o endereço certo:
   - Criar configuração `VITE_PUBLIC_APP_URL` com o endereço publicado.
   - `publicOrderUrl` passa a usar esse endereço quando existir, caindo no endereço atual só como alternativa.

3. **Verificação.** Abrir o link gerado numa janela anônima (sem login) e confirmar que a página da OS abre direto, com aprovação e acompanhamento de status.

## Observação

A publicação é o passo essencial: sem ela, não existe endereço público para o cliente abrir. Após aprovar, eu publico o app e aplico o ajuste do link.
