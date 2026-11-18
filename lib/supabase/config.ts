export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// Supabase now calls this the "publishable" key; older projects call it the "anon" key. Either works.
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** False until the Supabase keys are filled in (.env.local locally, Environment Variables on Vercel). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
