# Link da OS sem login + caixa integrado às OS

## 1. Link da OS que pede login (diagnóstico confirmado)

O link enviado ao cliente usa o endereço de **pré-visualização** (`id-preview--....lovable.app`), que exige login na Lovable. As páginas do cliente (`/os/$token` e `/consulta`) já são públicas — o bloqueio é só do endereço de pré-visualização.

Correção:
- **Publicar o aplicativo**: ele ganha um endereço público permanente que qualquer pessoa abre sem login.
- **Fixar o endereço público nos links**: ajustar `publicOrderUrl` em `src/lib/profix.ts` para usar sempre o endereço publicado (configuração `VITE_PUBLIC_APP_URL`), mesmo quando você envia o WhatsApp a partir da pré-visualização.
- Verificar abrindo o link numa janela anônima: a OS deve abrir direto, com aprovação e acompanhamento de status.

## 2. Caixa integrado às ordens de serviço

Hoje o caixa é manual. Passa a ser automático na entrega:

- Ao mudar o status de uma OS para **"entregue"** (na ficha da OS, `ordens.$id.tsx`), o app lança automaticamente no caixa uma **entrada** com o valor do serviço, descrição com o número da OS e nome do cliente, categoria "Serviço", data do momento da entrega e vínculo com a OS (`order_id`).
- **Sem duplicar**: antes de lançar, o app verifica se já existe uma entrada no caixa para aquela OS; se existir, não lança de novo (caso o status vá e volte).
- A página de Caixa passa a mostrar esses lançamentos com a identificação da OS, e o saldo/faturamento já os considera (já considera, pois lê `cash_movements`).
- Relatórios e painel continuam usando as mesmas fontes, então refletem o valor automaticamente.

## Verificação

- Criar/concluir uma OS de teste, marcar como entregue e conferir a entrada no Caixa com valor e data corretos.
- Abrir o link da OS sem login após a publicação.
