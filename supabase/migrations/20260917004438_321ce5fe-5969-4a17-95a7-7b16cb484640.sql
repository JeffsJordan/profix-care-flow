UPDATE public.service_orders SET status = 'aguardando aprovacao' WHERE quote_status = 'pendente' AND status = 'recebido';
UPDATE public.service_orders SET status = 'rejeitada' WHERE quote_status = 'recusado' AND status IN ('recebido', 'aguardando aprovacao');
ALTER TABLE public.service_orders ALTER COLUMN status SET DEFAULT 'aguardando aprovacao';