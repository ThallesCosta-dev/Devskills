import { createClient } from '@supabase/supabase-js';

// Essas chaves DEVEM vir de variáveis de ambiente.
// Substitua o 'SUA_ANON_KEY' pela chave real que você pegou no painel do Supabase.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zxkphvaeeugcoxzsvpzs.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4a3BodmFlZXVnY294enN2cHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MzAzMjksImV4cCI6MjA5NDEwNjMyOX0.D7AWyc3gWeluYnyX2Xm0G626k4tpvygyJYBoFs3PDL4';

export const supabase = createClient(supabaseUrl, supabaseKey);
