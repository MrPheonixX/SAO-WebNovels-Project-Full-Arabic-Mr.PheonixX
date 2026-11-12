// Online accounts for the static (GitHub Pages) site, through Supabase.
// Both values are PUBLIC by design (they ship in every browser): what protects
// the data is Row Level Security in the database (see supabase-sao.sql), never
// this key. NEVER put a "service_role" key anywhere in this repository.
// This is the same Supabase project as the academy site; all SAO tables are
// prefixed "sao_" so nothing mixes with the academy data.
export const SUPABASE_URL = "https://nnlpgvcwazlzpfyvyntd.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ubHBndmN3YXpsenBmeXZ5bnRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNDEwNjAsImV4cCI6MjEwNzcxNzA2MH0.FcXt6DrMqdFBuR7oU_sr0UhZFKZ75FSvkLq1m4Jvp2c";
