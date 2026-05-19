import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabaseUrl = 'https://zxkphvaeeugcoxzsvpzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4a3BodmFlZXVnY294enN2cHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MzAzMjksImV4cCI6MjA5NDEwNjMyOX0.D7AWyc3gWeluYnyX2Xm0G626k4tpvygyJYBoFs3PDL4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = `testuser${Date.now()}@example.com`;
  console.log('Signing up:', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'Password123!'
  });
  
  if (error) {
    console.error('Signup error:', error.message);
    return;
  }
  
  const token = data.session?.access_token;
  if (!token) {
    console.log('No token! Email confirmation is probably required.');
    return;
  }
  
  console.log('Got token, calling API...');
  try {
    const res = await axios.get('http://localhost:8080/api/devskills/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('API Error:', err.response ? err.response.status : err.message);
    if (err.response) {
      console.error(err.response.data);
      console.error(err.response.headers);
    }
  }
}

run();
