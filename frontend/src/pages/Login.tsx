import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, LogIn } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Erro ao fazer login: " + error.message);
      return;
    }

    if (data.session) {
      localStorage.setItem('auth_token', data.session.access_token);
      localStorage.setItem('user_email', email);
      window.location.href = '/';
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="glass-card login-card">
        <div className="login-header">
          <Terminal size={40} className="text-primary-light mb-4" />
          <h1 className="title-xl mb-2">Entrar</h1>
          <p className="text-secondary">Acesse sua conta no DevSkills</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>E-mail</label>
            <input 
              type="email" 
              className="glass-input" 
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Senha</label>
            <input 
              type="password" 
              className="glass-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4">
            <LogIn size={18} /> Entrar
          </button>
        </form>

        <div className="login-footer">
          <p className="text-secondary text-sm">
            Ainda não tem conta? <Link to="/register" className="text-primary-light">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
