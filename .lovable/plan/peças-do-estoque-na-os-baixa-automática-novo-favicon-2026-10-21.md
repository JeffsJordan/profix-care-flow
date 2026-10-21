# Peças do estoque na OS + baixa automática + novo favicon

## O que muda para você

1. **Adicionar peças na OS a qualquer momento**
   - Na ficha da OS, novo bloco "Peças utilizadas": escolher uma peça cadastrada no estoque, a quantidade, e adicionar. Dá para remover enquanto a OS não estiver finalizada.
   - Cada peça mostra o preço de venda (o que o cliente paga) e o custo.
   - O bloco mostra: valor do serviço + peças = **total cobrado do cliente**.

2. **Cliente não vê as peças**
   - No link do cliente, na consulta e na mensagem de WhatsApp aparece só o **valor total** (serviço + peças), sem nome de peça nem valor separado.

3. **Ao finalizar/entregar a OS (uma única vez, sem duplicar)**
   - **Caixa – entrada:** valor total (ex.: serviço R$ 50 + peça R$ 50 = R$ 100).
   - **Caixa – saída:** valor da peça (R$ 50), descrição "Peça — OS-N — nome da peça", categoria "Peças".
   - **Estoque:** a quantidade da peça é baixada.
   - Se a OS for excluída, as entradas e saídas dela saem do caixa (já funciona assim) e as peças voltam ao estoque.

4. **Estoque:** cada peça mostra um histórico curto "Baixas por OS" (data, número da OS, quantidade).

5. **Recibo de pagamento:** passa a usar o valor total.

6. **Favicon:** troca para a logo redonda enviada.

## Detalhes técnicos

- `service_order_parts` já existe (name, quantity, unit_cost, part_id). Migração: adicionar `unit_price numeric default 0` e `stocked_out_at timestamptz` (marca que a baixa já ocorreu, evita repetição).
- `ordens.$id.tsx`: UI de peças; ao inserir/remover recalcula `parts_cost` na OS. Em `changeStatus` (finalizado/entregue): entrada = `service_price + soma(unit_price*qtd)`; saída = soma do valor da peça; decrementa `parts.quantity` só para itens com `stocked_out_at` nulo, depois marca a data. Exclusão devolve ao estoque os itens já baixados.
- `public-order.functions.ts` e `os.$token.tsx`: retornar apenas `total` calculado no servidor; nunca a lista de peças.
- `osMessage`, `recibo.tsx`, `metrics.ts`: usar o total.
- Favicon: `magick` → `public/favicon.png` 64×64, mantendo o link atual em `__root.tsx`.
- "Valor da peça na saída": uso o **preço de venda** cadastrado (como no seu exemplo, 50 entra e 50 sai). Se preferir que a saída seja o preço de custo, é só ajustar.
