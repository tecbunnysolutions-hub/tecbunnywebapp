create table if not exists public.order_idempotency_keys (
  idempotency_key text primary key,
  customer_id text,
  order_id text,
  created_at timestamptz not null default now()
);

create index if not exists order_idempotency_keys_order_id_idx
  on public.order_idempotency_keys (order_id);

alter table public.order_idempotency_keys enable row level security;

revoke all on table public.order_idempotency_keys from anon, authenticated;
grant all on table public.order_idempotency_keys to service_role;