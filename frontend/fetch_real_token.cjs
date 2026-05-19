const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabaseUrl = 'https://zxkphvaeeugcoxzsvpzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4a3BodmFlZXVnY294enN2cHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MzAzMjksImV4cCI6MjA5NDEwNjMyOX0.D7AWyc3gWeluYnyX2Xm0G626k4tpvygyJYBoFs3PDL4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = `costa.thalles${Date.now()}@gmail.com`;
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
    console.log('No token! Session is null. Email confirmation is probably required.');
    return;
  }
  
  console.log('Got real token from Supabase!');
  
  // Decode header to see algorithm
  const parts = token.split('.');
  const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
  console.log('Token Header:', header);
  
  // Try to verify with the secret
  const base64Secret = 'MSyINcYK/vpGCNv6VlmPHfYFT/gqZF16NI+IcZpU5EEgesV0nxaPNel6Zut0denix+U3PRYWqIxiFNGr4ITOiQ==';
  const secretBuffer = Buffer.from(base64Secret, 'base64');
  
  try {
    const decoded = jwt.verify(token, secretBuffer);
    console.log('Verification SUCCESS. Token payload:', decoded);
  } catch (err) {
    console.error('Verification FAILED against the legacy secret:', err.message);
  }
}

run();
