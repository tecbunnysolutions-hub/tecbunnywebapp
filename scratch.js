const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:rIsMDeJHtOfDaA75@db.yzrznydkqcacjiwalmlw.supabase.co:5432/postgres' });
client.connect()
  .then(() => client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
  .then(r => console.log(r.rows.map(row => row.table_name)))
  .catch(console.error)
  .finally(() => client.end());
