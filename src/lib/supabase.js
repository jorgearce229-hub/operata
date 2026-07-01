import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://skwjfzugcehgkxywmdxb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrd2pmenVnY2VoZ2t4eXdtZHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NDc5MTIsImV4cCI6MjA5ODQyMzkxMn0.YLS2yD2hMJDWiLosBoZaTvlocownK9J5xBeKLir3ohc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const FREE_TRADE_LIMIT = 20
