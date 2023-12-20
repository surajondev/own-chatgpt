
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "SUPABASE_URL"
const supabaseAnon = "SUUPABASE_ANON_KEY"

export const supabase = createClient(supabaseUrl, supabaseAnon)