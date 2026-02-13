import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://duhtilcvwowkacemsxhf.supabase.co'
const supabaseKey = 'sb_publishable_tz6db7lViGacqc-0Gq0lKQ_KA8Ozx9y'

export const supabase = createClient(supabaseUrl, supabaseKey)
