import { createClient } from '@supabase/supabase-js';
const [email, name] = process.argv.slice(2);
if (
  !email ||
  !name ||
  !process.env.OWNER_INITIAL_PASSWORD ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
)
  throw new Error(
    'Usage: OWNER_INITIAL_PASSWORD=<strong password> node --env-file=.env.local scripts/provision-owner.mjs email name. Keep credentials out of source control.'
  );
if (process.env.OWNER_INITIAL_PASSWORD.length < 16)
  throw new Error('Use an initial password of at least 16 characters.');
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
const { data, error } = await db.auth.admin.createUser({
  email,
  password: process.env.OWNER_INITIAL_PASSWORD,
  email_confirm: true,
});
if (error) throw error;
const { error: profileError } = await db
  .from('profiles')
  .insert({ id: data.user.id, name, role: 'owner' });
if (profileError) {
  await db.auth.admin.deleteUser(data.user.id);
  throw profileError;
}
console.log('Approved owner account created. Change the initial password after sign-in.');
