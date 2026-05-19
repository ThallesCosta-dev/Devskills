const jwt = require('jsonwebtoken');
const axios = require('axios');

// Decode the base64 secret exactly like Spring Boot does
const base64Secret = 'MSyINcYK/vpGCNv6VlmPHfYFT/gqZF16NI+IcZpU5EEgesV0nxaPNel6Zut0denix+U3PRYWqIxiFNGr4ITOiQ==';
const secretBuffer = Buffer.from(base64Secret, 'base64');

// Create a mock token similar to Supabase
const payload = {
  aud: 'authenticated',
  exp: Math.floor(Date.now() / 1000) + (60 * 60),
  sub: '12345678-1234-1234-1234-123456789abc',
  email: 'mockuser@example.com',
  role: 'authenticated'
};

const token = jwt.sign(payload, secretBuffer, { algorithm: 'HS256' });

console.log('Generated token:', token);

async function run() {
  try {
    const res = await axios.get('http://localhost:8080/api/devskills/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('API Error:', err.response ? err.response.status : err.message);
  }
}

run();
