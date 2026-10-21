ALTER TABLE public.service_order_parts ADD COLUMN IF NOT EXISTS unit_price numeric NOT NULL DEFAULT 0;
ALTER TABLE public.service_order_parts ADD COLUMN IF NOT EXISTS stocked_out_at timestamptz;