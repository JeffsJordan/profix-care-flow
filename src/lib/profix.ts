export const DEVICE_TYPES = [
  "Celular",
  "Notebook",
  "Computador",
  "Console",
  "Placa de vídeo",
  "Placa-mãe",
  "Impressora",
] as const;

/** Checklist físico específico por tipo de aparelho. */
export const CHECKLIST_BY_DEVICE: Record<string, string[]> = {
  Impressora: [
    "Não liga",
    "Não imprime",
    "Papel atolando",
    "Não puxa papel",
    "Puxa várias folhas",
    "Impressão com falhas ou linhas",
    "Impressão borrada ou manchada",
    "Cores incorretas ou ausentes",
    "Cartucho ou toner não reconhecido",
    "Vazamento de tinta ou toner",
    "Cabeçote entupido",
    "Carro de impressão travado",
    "Ruído anormal",
    "Falha na conexão USB",
    "Falha na conexão Wi-Fi ou rede",
    "Scanner não funciona",
    "Alimentador de documentos com falha",
    "Impressão frente e verso com falha",
    "Erro no painel",
    "Carcaça ou bandeja danificada",
  ],
  Celular: [
    "Tela trincada",
    "Tela com manchas",
    "Touch não responde",
    "Carcaça amassada",
    "Tampa traseira quebrada",
    "Câmera traseira danificada",
    "Câmera frontal danificada",
    "Botões laterais com defeito",
    "Alto-falante sem som",
    "Microfone com defeito",
    "Conector de carga danificado",
    "Bateria estufada",
    "Biometria não funciona",
    "Sinais de oxidação",
    "Aparelho molhado",
    "Não liga",
    "Superaquecimento",
    "Parafusos faltando",
    "Bandeja de chip ausente",
  ],
  Notebook: [
    "Carcaça danificada",
    "Tampa/dobradiça quebrada",
    "Tela trincada",
    "Tela com manchas ou linhas",
    "Teclado com falhas",
    "Touchpad não responde",
    "Bateria viciada ou estufada",
    "Conector de energia danificado",
    "Cooler com ruído",
    "Superaquecimento",
    "Portas USB danificadas",
    "Sinais de oxidação",
    "Não liga",
    "HD/SSD com falhas",
    "Parafusos faltando",
    "Sem carregador",
  ],
  Computador: [
    "Gabinete danificado",
    "Não liga",
    "Sem vídeo",
    "Reinicia sozinho",
    "Superaquecimento",
    "Coolers com ruído",
    "Fonte queimada",
    "Sinais de oxidação",
    "Acúmulo de poeira",
    "HD/SSD com falhas",
    "Memória com falhas",
    "Portas USB danificadas",
    "Cabos/parafusos faltando",
  ],
  Console: [
    "Carcaça danificada",
    "Não liga",
    "Sem vídeo",
    "Leitor de disco não funciona",
    "Não lê jogos",
    "Superaquecimento",
    "Cooler com ruído",
    "Porta HDMI danificada",
    "Controle com defeito",
    "Travando durante o uso",
    "Sinais de oxidação",
    "Parafusos faltando",
    "Sem fonte/cabos",
  ],
  "Placa de vídeo": [
    "Sem vídeo",
    "Artefatos na imagem",
    "Travamentos em jogos",
    "Coolers travados ou com ruído",
    "Superaquecimento",
    "Componentes queimados",
    "Trilhas rompidas",
    "Conector PCIe danificado",
    "Conector de energia danificado",
    "Sinais de oxidação",
    "Pasta térmica seca",
    "Backplate/carcaça amassada",
    "BIOS corrompida",
  ],
  "Placa-mãe": [
    "Não liga",
    "Sem vídeo",
    "Sem POST (não dá sinal de boot)",
    "Capacitores estufados",
    "Componentes queimados",
    "Trilhas rompidas",
    "Socket com pinos tortos",
    "Slots de memória danificados",
    "Slot PCIe danificado",
    "Portas USB danificadas",
    "Sinais de oxidação",
    "Bateria CMOS descarregada",
    "Curto-circuito identificado",
  ],
};

/** Itens genéricos usados quando o tipo de aparelho ainda não foi escolhido. */
export const CHECKLIST_ITEMS = [
  "Não liga",
  "Carcaça quebrada",
  "Sinais de oxidação",
  "Aparelho molhado",
  "Superaquecimento",
  "Parafusos faltando",
];

export function checklistFor(deviceType: string | null | undefined) {
  if (!deviceType) return CHECKLIST_ITEMS;
  return CHECKLIST_BY_DEVICE[deviceType] ?? CHECKLIST_ITEMS;
}

/** Acessórios recebidos, não peças utilizadas no reparo. */
export const ACCESSORIES_BY_DEVICE: Record<string, string[]> = {
  Celular: ["Carregador", "Cabo USB", "Capa", "Película", "Chip SIM", "Cartão de memória", "Fone de ouvido", "Caixa original"],
  Notebook: ["Carregador / fonte", "Cabo de energia", "Mouse", "Bolsa / mochila", "Adaptador", "HD / SSD externo", "Pen drive", "Caixa original"],
  Computador: ["Cabo de energia", "Monitor", "Cabo HDMI / DisplayPort / VGA", "Teclado", "Mouse", "Adaptador Wi-Fi", "Caixas de som", "HD / SSD externo", "Pen drive"],
  Console: ["Fonte / cabo de energia", "Cabo HDMI", "Controle", "Cabo de carga do controle", "Jogo / mídia física", "Headset", "Base / suporte", "HD externo", "Caixa original"],
  "Placa de vídeo": ["Adaptador de energia", "Cabo de energia PCIe", "Cabo HDMI / DisplayPort", "Suporte da placa", "Parafusos", "Caixa original", "Embalagem antiestática"],
  "Placa-mãe": ["Espelho traseiro", "Cabos SATA", "Antenas Wi-Fi", "Processador", "Cooler", "Memória RAM", "SSD M.2", "Parafusos / espaçadores", "Caixa original", "Embalagem antiestática"],
  Impressora: ["Fonte / cabo de energia", "Cabo USB", "Cabo de rede", "Cartucho preto", "Cartucho colorido", "Toner", "Frascos de tinta", "Bandeja de papel", "Cabo telefônico", "Caixa original"],
};

export function accessoriesFor(deviceType: string | null | undefined) {
  return deviceType ? ACCESSORIES_BY_DEVICE[deviceType] ?? [] : [];
}

export const ORDER_STATUSES = [
  "aguardando aprovacao",
  "rejeitada",
  "recebido",
  "em andamento",
  "finalizado",
  "entregue",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const QUOTE_STATUSES = ["pendente", "aceito", "recusado"] as const;

export const STATUS_LABEL: Record<string, string> = {
  "aguardando aprovacao": "Aguardando aprovação",
  rejeitada: "Rejeitada",
  recebido: "Recebido",
  "em andamento": "Em andamento",
  finalizado: "Finalizado",
  entregue: "Entregue",
};

export const QUOTE_LABEL: Record<string, string> = {
  pendente: "Aguardando cliente",
  aceito: "Serviço contratado",
  recusado: "Orçamento recusado",
};

/** O status da OS é a fonte de verdade da situação do orçamento. */
export function quoteFromStatus(status: string) {
  if (status === "aguardando aprovacao") return "pendente";
  if (status === "rejeitada") return "recusado";
  return "aceito";
}

export function formatMoney(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function orderNumber(n: number | string) {
  return `OS-${String(n).padStart(5, "0")}`;
}

export function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

export function whatsappLink(phone: string, message: string) {
  const digits = onlyDigits(phone);
  const withCountry = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

/** Link público enviado ao cliente: cai na consulta por número da OS. */
export function publicOrderUrl() {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/consulta`;
}

/** Início do período (dia/semana/mês/ano) em horário local. */
export function periodStart(period: "dia" | "semana" | "mes" | "ano", ref = new Date()) {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  if (period === "semana") {
    const day = (d.getDay() + 6) % 7; // segunda = 0
    d.setDate(d.getDate() - day);
  } else if (period === "mes") {
    d.setDate(1);
  } else if (period === "ano") {
    d.setMonth(0, 1);
  }
  return d;
}

export const PERIOD_LABEL: Record<string, string> = {
  dia: "Hoje",
  semana: "Esta semana",
  mes: "Este mês",
  ano: "Este ano",
};

const UN = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const DEZ = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CEN = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

function ate999(n: number): string {
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const r = n % 100;
  const parts: string[] = [];
  if (c) parts.push(CEN[c] ?? "");
  if (r) {
    if (r < 20) parts.push(UN[r] ?? "");
    else parts.push([DEZ[Math.floor(r / 10)], UN[r % 10]].filter(Boolean).join(" e "));
  }
  return parts.join(" e ");
}

function inteiroExtenso(n: number): string {
  if (n === 0) return "zero";
  const milhoes = Math.floor(n / 1_000_000);
  const milhares = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;
  const parts: string[] = [];
  if (milhoes) parts.push(milhoes === 1 ? "um milhão" : `${ate999(milhoes)} milhões`);
  if (milhares) parts.push(milhares === 1 ? "mil" : `${ate999(milhares)} mil`);
  if (resto) parts.push(ate999(resto));
  if (parts.length > 1 && resto && (resto < 100 || resto % 100 === 0)) {
    const last = parts.pop();
    return `${parts.join(" ")} e ${last}`;
  }
  return parts.join(" ");
}

/** Valor em reais por extenso: 150.5 -> "cento e cinquenta reais e cinquenta centavos". */
export function moneyInWords(value: number) {
  const total = Math.round(Math.max(0, value) * 100);
  const reais = Math.floor(total / 100);
  const cents = total % 100;
  const parts: string[] = [];
  if (reais) parts.push(`${inteiroExtenso(reais)} ${reais === 1 ? "real" : "reais"}`);
  if (cents) parts.push(`${inteiroExtenso(cents)} ${cents === 1 ? "centavo" : "centavos"}`);
  return parts.length ? parts.join(" e ") : "zero reais";
}
