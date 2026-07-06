// Shared Supabase client for the storefront.
// Uses the public "anon" key only — safe to expose in browser code.
// All access is governed by Row Level Security policies (see supabase/schema.sql):
//   - products: public read-only
//   - orders:   public insert-only (no read-back)
(function () {
  const SUPABASE_URL = 'https://nnuopsnjfhlootbtlpst.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5udW9wc25qZmhsb290YnRscHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMzQ1MTQsImV4cCI6MjA5ODkxMDUxNH0.-MkIfvrk01zoka57oSpU8jigZvAOAWEDMc7aUlf60GY';

  window.loacSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
