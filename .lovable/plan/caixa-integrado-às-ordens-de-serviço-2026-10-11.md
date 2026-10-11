# Caixa integrado às ordens de serviço

## Objetivo

Quando uma OS for marcada como **"entregue"**, o valor do serviço entra automaticamente no caixa na data da entrega — sem lançamento manual.

## Mudanças

1. **Ficha da OS** (`src/routes/_authenticated/ordens.$id.tsx`):
   - Na troca de status para **"entregue"**, inserir automaticamente em `cash_movements` uma entrada com:
     - tipo: entrada
     - valor: valor do serviço da OS
     - descrição: número da OS + nome do cliente (ex.: "OS-01023 — Maria Silva")
     - categoria: "Serviço"
     - vínculo com a OS (`order_id`)
     - data: momento da entrega
   - **Sem duplicar**: antes de lançar, verificar se já existe entrada no caixa para aquela OS; se existir, não lançar de novo (protege contra status que vai e volta).

2. **Página de Caixa** (`src/routes/_authenticated/caixa.tsx`):
   - Os lançamentos automáticos aparecem na lista normalmente, identificados pela descrição com o número da OS. Nenhuma mudança visual necessária além de garantir a exibição da categoria "Serviço".

3. **Painel e Relatórios**: já leem `cash_movements`, então passam a refletir esses valores automaticamente — nada a alterar.

## Verificação

- Criar uma OS de teste, marcá-la como "entregue" e conferir a entrada no Caixa com valor e data corretos.
- Mudar o status para outro e voltar para "entregue": o valor não deve duplicar no caixa.
