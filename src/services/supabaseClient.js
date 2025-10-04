
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mxbcoccpfwbimvgsbykf.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseKey) {
  console.error('VITE_SUPABASE_KEY is required in .env file')
}

export const supabase = createClient(supabaseUrl, supabaseKey)