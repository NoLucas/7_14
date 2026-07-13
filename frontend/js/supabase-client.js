const SUPABASE_URL = "https://apgzznzonepygfndeyjv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_tfwuWe3OXgCn0ZvKvSh0xQ_Ga6H3fqN";

let _supabaseClient = null;

function getSupabaseClient() {
  if (!_supabaseClient) {
    _supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  }
  return _supabaseClient;
}
