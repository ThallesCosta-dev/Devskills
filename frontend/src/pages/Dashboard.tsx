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
                <div className="flex justify-between text-muted text-sm mb-2">
                  <span>Nível</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <select
                        className="glass-input"
                        style={{ padding: '2px 6px', fontSize: '12px' }}
                        value={editingLevel}
                        onChange={e => setEditingLevel(e.target.value)}
                      >
                        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <button onClick={() => handleSaveSkillLevel(ds)} className="text-green-400 hover:text-green-300" title="Salvar"><Check size={14} /></button>
                      <button onClick={() => setEditingSkillId(null)} className="text-red-400 hover:text-red-300" title="Cancelar"><X size={14} /></button>
                    </div>
                  ) : (
                    <span className="font-semibold text-primary-light flex items-center gap-1">
                      {ds.proficiencyLevel}
                      <button
                        onClick={() => { setEditingSkillId(ds.id); setEditingLevel(ds.proficiencyLevel); }}
                        className="text-muted hover:text-primary-light ml-1"
                        title="Editar nível"
                      >
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleRemoveSkill(ds.id)} className="text-red-400 hover:text-red-300 ml-1" title="Remover skill"><X size={12} /></button>
                    </span>
                  )}
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${progress}%`, transition: 'width 0.4s ease' }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
