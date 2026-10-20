# Logo nova na tela inicial + ícone do navegador

## O que muda

- A **tela inicial** passa a mostrar a logo que você enviou (ProFix em verde/ciano com subtítulo e a fileira de ícones técnicos).
- O **ícone da aba do navegador** (favicon) passa a sair desta mesma logo.
- As telas **Acesso**, **Consultar minha OS** e **OS do cliente** continuam com a logo atual, como você escolheu.

## Como será feito

1. **Subir a nova imagem** para o armazenamento de mídia do projeto, criando um ponteiro `src/assets/profix-logo-escuro.png.asset.json` (a imagem fica no CDN, não no repositório).
2. **`src/components/Logo.tsx`**: adicionar uma exportação nova (`LogoHome`) que usa essa imagem, mantendo o componente `Logo` exatamente como está.
3. **`src/routes/index.tsx`**: trocar o `<Logo className="h-28" />` do topo da tela inicial por `<LogoHome className="h-28" />`.
4. **Favicon**: recortar a faixa com a marca "ProFix" da nova logo, redimensionar para um quadrado de 64×64 com preenchimento transparente (sem esticar nem achatar) e gravar em `public/favicon.png`, substituindo o atual. O arquivo raiz já aponta para `/favicon.png`, então não precisa mexer em mais nada.
5. **Nada é apagado**: a logo antiga continua no projeto porque ainda é usada nas outras três telas.

## Verificação

- Typecheck (`bunx tsgo --noEmit`) sem erros.
- Abrir a tela inicial no navegador e conferir pela captura que a logo exibida é a nova, e que `/auth` e `/consulta` seguem com a antiga.
- Conferir o `public/favicon.png` gerado: quadrado, marca centralizada e legível em tamanho pequeno.

## Detalhes técnicos

- A imagem enviada é PNG 758×368 com transparência real (cerca de 47% dos pixels são totalmente transparentes — confirmado no arquivo), então ela se apoia direto sobre o fundo azul marinho escuro do app, onde o branco e o verde/ciano ficam legíveis.
- Por ser 2:1, a logo ocupa cerca de 224px de largura com a altura atual (`h-28`), sem deformação.
- Para o favicon, a faixa inferior com os 5 ícones e o subtítulo fino não é legível em 16–32px, por isso o recorte usa só a marca "ProFix".
- Nenhuma tela, dado ou fluxo do cliente é alterado.
