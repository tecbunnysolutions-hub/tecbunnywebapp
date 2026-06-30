import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createServiceClient } from '../src/lib/supabase/server';

async function run() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('orders')
    .select(
      [
        'id',
        'customer_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'status',
        'type',
        'subtotal',
        'gst_amount',
        'discount_amount',
        'shipping_amount',
        'total',
        'delivery_address',
        'pickup_store',
        'notes',
        'payment_method',
        'payment_status',
        'payment_reference',
        'items',
        'created_at',
        'updated_at'
      ].join(', ')
    )
    .limit(1);

  if (error) {
    console.log('Postgres Query Error:', error.message, error.code, error.details);
  } else {
    console.log('Query succeeded, data length:', data?.length);
  }
}

run();
