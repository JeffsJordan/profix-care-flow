# ProFix — Sistema de Assistência Técnica

Aplicativo web para gerenciar a loja: ordens de serviço, clientes, estoque de peças, caixa e relatórios. Visual azul marinho com verde em gradiente, seguindo a logo enviada.

## Identidade visual
- Fundo azul marinho profundo, texto claro, destaque em verde-menta com gradiente para azul-turquesa.
- Detalhes de "circuito" discretos no topo das páginas, como na logo.
- A logo enviada entra no cabeçalho e vira o ícone do site.

## Telas

1. **Painel inicial** — faturamento do dia/semana/mês, lucro bruto e líquido, aparelhos em bancada, orçamentos aceitos e recusados.
2. **Ordens de serviço** — dois botões em destaque: "Nova ordem de serviço" e "Ver ordens". Lista com busca, filtro por status e por cliente.
3. **Nova OS (por etapas)**
   - Cliente: cadastrar novo ou selecionar um já existente na base.
   - Tipo de aparelho: celular, notebook, computador, console, placa de vídeo, placa-mãe (+ marca, modelo, número de série).
   - Avaliação: fotos de como o aparelho chegou, defeito relatado, diagnóstico, checklist de avarias físicas (botões: tela trincada, carcaça quebrada, câmera danificada, botões, alto-falante, oxidação, etc.), peças usadas com custo e valor cobrado do serviço.
   - Senha do aparelho: PIN/senha digitada ou desenho do padrão em grade 3x3.
   - Revisão e finalização.
4. **Ficha da OS** — todos os dados, atualização de status (recebido, em andamento, finalizado, entregue) e ações: salvar em PDF, etiqueta adesiva, cupom térmico e enviar por WhatsApp.
5. **Clientes** — base de clientes com histórico de serviços.
6. **Estoque de peças** — quantidade, custo, preço de venda, alerta de estoque baixo; a saída é baixada automaticamente quando a peça entra numa OS.
7. **Caixa** — entradas e saídas, fechamento diário.
8. **Relatórios** — faturamento, custo de peças, lucro bruto e líquido, e taxa de aceitação de orçamentos nas visões diária, semanal, mensal e anual.

## Link do cliente (WhatsApp)
- Cada OS gera um link com código único e imprevisível; só quem tem o link acessa.
- Nessa página o cliente vê a OS, o orçamento e o status, e pode clicar em "Contratar serviço" ou "Recusar" — o que alimenta o relatório de aceitação.
- Botões seus para abrir o WhatsApp com a mensagem já escrita: envio da OS e aviso de mudança de status.

## Detalhes técnicos
- Lovable Cloud para banco de dados, login do dono da loja e armazenamento das fotos.
- Tabelas: clientes, aparelhos, ordens de serviço, itens/peças da OS, checklist, peças em estoque, movimentos de caixa, eventos de status. Acesso restrito ao usuário logado; a página pública do cliente lê apenas os dados daquela OS pelo código do link.
- PDF, etiqueta e cupom térmico gerados no navegador com layouts próprios (etiqueta pequena e cupom 80mm).
- WhatsApp via link `wa.me` com texto pré-preenchido (sem custo de API).

## Etapas de entrega
1. Design system, logo, login e estrutura de navegação.
2. Banco de dados e cadastro de clientes.
3. Fluxo de nova OS em etapas com fotos e senha do aparelho.
4. Ficha da OS, status e página pública do cliente com contratar/recusar.
5. PDF, etiqueta, cupom térmico e mensagens de WhatsApp.
6. Estoque de peças, caixa e relatórios com lucro bruto e líquido.
