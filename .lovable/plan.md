# Status das OS: novos estágios, aviso no WhatsApp e painel por status

## O que muda

### 1. Novos status da ordem de serviço
A OS passa a ter estes estágios, na ordem do fluxo da loja:

1. Aguardando aprovação
2. Rejeitada
3. Recebido
4. Em andamento
5. Finalizado
6. Entregue (mantido, usado no caixa/relatórios quando o aparelho sai da loja)

As OS já existentes continuam com o status atual, sem perder nada.

### 2. Relatórios acompanham o status automaticamente
- OS em "Aguardando aprovação" contam como orçamento aguardando resposta.
- OS em "Rejeitada" contam como recusadas.
- OS em "Recebido", "Em andamento", "Finalizado" ou "Entregue" contam como serviço aprovado.

Ou seja, você muda só o status e os números de aprovados/recusados, faturamento e lucro se ajustam sozinhos.

### 3. Aviso de status no WhatsApp, sem link
- Ao trocar o status na ficha da OS, aparece em destaque o botão "Enviar atualização pelo WhatsApp", já com a mensagem pronta (loja, número da OS, aparelho e o novo status).
- A mensagem não leva mais nenhum link do aplicativo — nem no aviso de status, nem no envio da OS. O aplicativo fica de uso interno da loja.
- A página de acompanhamento por link continua existindo no sistema, mas você simplesmente não envia mais o endereço ao cliente.

### 4. Painel de OS agrupadas por status
Na tela de Ordens de serviço, uma faixa de botões no topo separa as OS por estágio, com a quantidade em cada um:

```text
[ Todas 24 ] [ Aguardando aprovação 5 ] [ Rejeitada 2 ] [ Recebido 7 ] [ Em andamento 6 ] [ Finalizado 3 ] [ Entregue 1 ]
```

Clicar em um botão mostra só as OS daquele estágio. A busca por número, cliente ou aparelho continua funcionando junto.

## Detalhes técnicos

- `src/lib/profix.ts`: `ORDER_STATUSES` passa a `["aguardando aprovacao", "rejeitada", "recebido", "em andamento", "finalizado", "entregue"]` com `STATUS_LABEL` correspondente; `statusTone` ganha tons para os novos valores (âmbar para aguardando, vermelho para rejeitada).
- `src/lib/metrics.ts`: `quote_status` deixa de ser a fonte de verdade — deriva de `status` (`aguardando aprovacao` → pendente, `rejeitada` → recusado, demais → aceito) via helper `quoteFromStatus`; `summarize` e a listagem passam a usá-lo.
- `src/routes/_authenticated/ordens.$id.tsx`: a mutação de status também grava `quote_status` derivado, registra o evento em `order_status_events` e marca `finished_at`; após a troca, estado local destaca o botão de WhatsApp. `statusMessage` e `osMessage` perdem a linha com o link (`publicOrderUrl` deixa de ser usado nas mensagens; botão "copiar link" permanece apenas para uso interno).
- `src/routes/_authenticated/ordens.index.tsx`: substitui o `Select` de status por chips com contagem por status derivada da lista carregada; mantém busca e filtro de orçamento coerentes com o status derivado.
- Migração leve: `UPDATE service_orders SET status = 'aguardando aprovacao' WHERE quote_status = 'pendente' AND status = 'recebido'` para alinhar as OS antigas ao novo fluxo (opcional, aplicada uma vez).
