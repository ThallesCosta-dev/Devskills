import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, UserPlus } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';
import './Register.css';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }
    
    // Real Supabase Registration
    const generatedUsername = email.split('@')[0] + Math.floor(Math.random() * 1000);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          username: generatedUsername,
          full_name: name
        }
      }
    });

    if (error) {
      toast.error("Erro ao criar conta: " + error.message);
      return;
    }

    if (data.user && data.session) {
      localStorage.setItem('auth_token', data.session.access_token);
      localStorage.setItem('user_email', email);
      window.location.href = '/';
    } else {
      toast.success("Conta criada! Verifique seu e-mail.");
      window.location.href = '/login';
    }
  };

  return (
    <div className="register-container animate-fade-in">
      <div className="glass-card register-card">
        <div className="register-header">
          <Terminal size={40} className="text-primary-light mb-4" />
          <h1 className="title-xl mb-2">Criar Conta</h1>
          <p className="text-secondary">Junte-se à comunidade DevSkills</p>
        </div>

        <form onSubmit={handleRegister} className="register-form">
          <div className="form-group">
            <label>Nome Completo</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Confirmar Senha</label>
            <input 
              type="password" 
              className="glass-input" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4">
            <UserPlus size={18} /> Cadastrar
          </button>
        </form>

        <div className="register-footer">
          <p className="text-secondary text-sm">
            Já tem uma conta? <Link to="/login" className="text-primary-light">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
