export const DEVICE_TYPES = [
  "Celular",
  "Notebook",
  "Computador",
  "Console",
  "Placa de vídeo",
  "Placa-mãe",
] as const;

export const CHECKLIST_ITEMS = [
  "Tela trincada",
  "Tela com manchas",
  "Touch não responde",
  "Carcaça quebrada",
  "Tampa/dobradiça danificada",
  "Câmera danificada",
  "Botões com defeito",
  "Alto-falante sem som",
  "Microfone com defeito",
  "Conector de carga danificado",
  "Bateria estufada",
  "Sinais de oxidação",
  "Parafusos faltando",
  "Não liga",
  "Superaquecimento",
  "Cooler com ruído",
  "Teclado com falhas",
  "Aparelho molhado",
];

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

export function publicOrderUrl(token: string) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/os/${token}`;
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
