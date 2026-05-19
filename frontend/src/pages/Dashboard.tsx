import { useState, useEffect } from 'react';
import { Plus, Code, Server, Database, GitBranch, Pencil, Check, X } from 'lucide-react';
import axios from 'axios';
import { Typewriter } from '../components/Typewriter';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Landing } from './Landing';
import './Dashboard.css';

const LEVELS = ['Júnior', 'Pleno', 'Sênior', 'Especialista'];

export function Dashboard() {
  const isAuthenticated = !!localStorage.getItem('auth_token');
  const [devData, setDevData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Pleno');
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [editingLevel, setEditingLevel] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = () => {
    const token = localStorage.getItem('auth_token');
    axios.get('/api/devskills/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setDevData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const token = localStorage.getItem('auth_token');
    
    axios.post('/api/devskills/me/skills', { name: newSkillName, proficiencyLevel: newSkillLevel }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setDevData(res.data);
      setNewSkillName('');
      setShowAddSkill(false);
      toast.success("Habilidade adicionada!");
    }).catch(err => toast.error("Erro ao adicionar skill: " + (err.response?.data || err.message)));
  };

  const handleRemoveSkill = (devSkillId: number) => {
    const token = localStorage.getItem('auth_token');
    axios.delete(`/api/devskills/me/skills/${devSkillId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { fetchProfile(); toast.success("Habilidade removida!"); })
      .catch(err => toast.error("Erro ao remover: " + err.message));
  };

  const handleSaveSkillLevel = (ds: any) => {
    if (editingLevel === ds.proficiencyLevel) { setEditingSkillId(null); return; }
    const token = localStorage.getItem('auth_token');
    axios.put(`/api/devskills/me/skills/${ds.id}`, { proficiencyLevel: editingLevel }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      fetchProfile();
      setEditingSkillId(null);
      toast.success("Nível atualizado!");
    }).catch(err => toast.error("Erro ao atualizar nível."));
  };

  const getSkillIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('react') || n.includes('html') || n.includes('css')) return <Code />;
    if (n.includes('sql') || n.includes('mongo') || n.includes('data')) return <Database />;
    if (n.includes('git') || n.includes('docker') || n.includes('aws')) return <GitBranch />;
    return <Server />;
  };

  if (!isAuthenticated) {
    return <Landing />;
  }

  if (loading) return <LoadingSpinner text="Carregando Meu Radar..." />;

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center dashboard-header">
        <div>
          <h1 className="title-xl"><Typewriter text="Meu Radar" speed={80} /></h1>
          <p className="text-secondary">Gerencie suas competências e prepare-se para o mercado.</p>
        </div>
        <button onClick={() => setShowAddSkill(!showAddSkill)} className="btn btn-primary">
          <Plus size={20} />
          Adicionar Skill
        </button>
      </div>

      {showAddSkill && (
        <form onSubmit={handleAddSkill} className="glass-card mb-6 flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs text-secondary mb-1 block">Nome da Habilidade</label>
            <input type="text" className="glass-input w-full" value={newSkillName} onChange={e => setNewSkillName(e.target.value)} placeholder="Ex: Python, React, AWS" required />
          </div>
          <div>
            <label className="text-xs text-secondary mb-1 block">Nível de Proficiência</label>
            <select className="glass-input w-full" value={newSkillLevel} onChange={e => setNewSkillLevel(e.target.value)}>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>Salvar</button>
        </form>
      )}

      <div className="skills-grid">
        {devData?.skills?.length === 0 && (
          <p className="text-muted text-center py-8" style={{ gridColumn: '1 / -1' }}>Você ainda não adicionou nenhuma habilidade no seu radar.</p>
        )}
        
        {devData?.skills?.map((ds: any, index: number) => {
          const isEditing = editingSkillId === ds.id;
          const level = isEditing ? editingLevel : ds.proficiencyLevel;
          const progress = level === 'Júnior' ? 30 : level === 'Pleno' ? 60 : level === 'Sênior' ? 90 : 100;
          return (
            <div key={ds.id} className={`glass-card skill-card delay-${(index % 5 + 1) * 100}`}>
              <div className="skill-card-header">
                <div className="skill-icon">{getSkillIcon(ds.skill.name)}</div>
                <span className={`badge ${ds.proficiencyLevel === 'Sênior' || ds.proficiencyLevel === 'Especialista' ? 'primary' : 'success'}`}>
                  {ds.skill.category || 'Geral'}
                </span>
              </div>
              
              <h3 className="skill-name">{ds.skill.name}</h3>
              
              <div className="skill-progress-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nível</span>
                  <span style={{ color: 'var(--primary-light)', fontWeight: 600, fontSize: '0.875rem' }}>{ds.proficiencyLevel}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${progress}%`, transition: 'width 0.4s ease' }}></div>
                </div>

                {/* Edit row — always below the bar */}
                {isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                    <select
                      style={{ flex: 1, padding: '4px 8px', fontSize: '12px', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '6px' }}
                      value={editingLevel}
                      onChange={e => setEditingLevel(e.target.value)}
                    >
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <button
                      onClick={() => handleSaveSkillLevel(ds)}
                      style={{ color: '#68d391', fontSize: '18px', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
                      title="Salvar"
                    >✓</button>
                    <button
                      onClick={() => setEditingSkillId(null)}
                      style={{ color: '#fc8181', fontSize: '18px', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
                      title="Cancelar"
                    >✕</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      onClick={() => { setEditingSkillId(ds.id); setEditingLevel(ds.proficiencyLevel); }}
                      style={{ flex: 1, padding: '4px 8px', fontSize: '12px', color: '#a0aec0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      title="Editar nível"
                    >
                      <Pencil size={12} /> Editar
                    </button>
                    <button
                      onClick={() => handleRemoveSkill(ds.id)}
                      style={{ padding: '4px 10px', fontSize: '12px', color: '#fc8181', background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.2)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Remover"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
