import { useState, useEffect, useMemo } from 'react';
import { Plus, Code, Server, Database, GitBranch, Pencil, Check, X, Award, TrendingUp, Briefcase, Compass, ExternalLink, Building, MapPin, DollarSign } from 'lucide-react';
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
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchJobs();
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

  const fetchJobs = () => {
    setLoadingJobs(true);
    axios.get('/api/jobs/market', { params: { page: 0, size: 40 } })
      .then(res => {
        setJobs(res.data);
        setLoadingJobs(false);
      })
      .catch(() => setLoadingJobs(false));
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

  // Dynamically calculate career metrics based on the added skills
  const skills = devData?.skills || [];
  
  // 1. Market Readiness Score (Índice de Prontidão)
  const readinessScore = Math.min(100, Math.round(
    (skills.length * 15) + 
    (skills.filter((s: any) => s.proficiencyLevel === 'Sênior' || s.proficiencyLevel === 'Especialista').length * 20)
  ));

  // 2. Strongest Skill (Habilidade Mais Forte)
  const getStrongestSkill = () => {
    if (skills.length === 0) return "Nenhuma";
    const levelScores: Record<string, number> = { 'Júnior': 1, 'Pleno': 2, 'Sênior': 3, 'Especialista': 4 };
    let strongest = skills[0];
    for (let i = 1; i < skills.length; i++) {
      if (levelScores[skills[i].proficiencyLevel] > levelScores[strongest.proficiencyLevel]) {
        strongest = skills[i];
      }
    }
    return `${strongest.skill.name} (${strongest.proficiencyLevel})`;
  };
  const strongestSkill = getStrongestSkill();

  // 3. Dominant Stack (Stack Dominante)
  const getDominantStack = () => {
    if (skills.length === 0) return "Não Definida";
    let frontCount = 0;
    let backCount = 0;
    let iaCount = 0;
    
    skills.forEach((s: any) => {
      const name = s.skill.name.toLowerCase();
      if (name.includes('react') || name.includes('html') || name.includes('css') || name.includes('vue') || name.includes('angular') || name.includes('javascript') || name.includes('typescript')) {
        frontCount++;
      } else if (name.includes('ia') || name.includes('python') || name.includes('inteligencia') || name.includes('ai') || name.includes('data') || name.includes('model') || name.includes('nlp')) {
        iaCount++;
      } else {
        backCount++;
      }
    });

    if (iaCount > frontCount && iaCount > backCount) return "Engenheiro de IA";
    if (frontCount > backCount) return "Frontend Developer";
    if (backCount > frontCount) return "Backend Developer";
    if (frontCount > 0 && backCount > 0) return "Fullstack Developer";
    return "Desenvolvedor de Software";
  };
  const dominantStack = getDominantStack();

  // 4. Dynamic Gap / Next Steps Recommendations
  const getInsights = () => {
    const insights: Array<{ text: string; ready: boolean }> = [];
    const skillNames = skills.map((s: any) => s.skill.name.toLowerCase());

    if (skills.length === 0) {
      insights.push({ text: "Adicione sua primeira habilidade no radar para receber recomendações de estudo.", ready: false });
      return insights;
    }

    if (skillNames.includes('java') && !skillNames.includes('spring boot') && !skillNames.includes('spring')) {
      insights.push({ text: "Recomendado: Adicione 'Spring Boot' para robustecer sua stack Java.", ready: false });
    }
    if (skillNames.includes('react') && !skillNames.includes('typescript')) {
      insights.push({ text: "Recomendado: Aprenda 'TypeScript' para robustecer suas aplicações React.", ready: false });
    }
    if (skillNames.includes('python') && !skillNames.includes('ia') && !skillNames.includes('machine learning')) {
      insights.push({ text: "Recomendado: Explore modelos de 'IA' e Machine Learning integrados ao Python.", ready: false });
    }
    
    if (!skillNames.includes('docker')) {
      insights.push({ text: "Recomendado: Adicione 'Docker' no seu radar para dominar conteinerização.", ready: false });
    }
    if (!skillNames.includes('aws') && !skillNames.includes('cloud')) {
      insights.push({ text: "Recomendado: Aprenda serviços de nuvem como 'AWS' ou Azure.", ready: false });
    }

    if (skills.length >= 3) {
      insights.push({ text: "Sua stack está tomando um formato maduro! Continue focado nos roadmaps.", ready: true });
    }
    if (skills.some((s: any) => s.proficiencyLevel === 'Sênior' || s.proficiencyLevel === 'Especialista')) {
      insights.push({ text: "Você possui habilidades seniores, excelente diferencial competitivo no mercado!", ready: true });
    }

    return insights;
  };
  const insights = getInsights();

  // 5. Filter job offers that match the developer's skills!
  const matchedJobs = useMemo(() => {
    if (skills.length === 0 || jobs.length === 0) return [];
    
    return jobs.filter((job: any) => {
      const title = job.title.toLowerCase();
      const tags = (job.tags || '').toLowerCase();
      const company = job.company.toLowerCase();
      
      return skills.some((s: any) => {
        const skillName = s.skill.name.toLowerCase();
        return title.includes(skillName) || tags.includes(skillName) || company.includes(skillName);
      });
    });
  }, [skills, jobs]);

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

      {/* Radar summary metrics row */}
      <div className="radar-metrics-row animate-fade-in" style={{ marginTop: '20px' }}>
        <div className="radar-metric-card success">
          <div className="radar-metric-icon">
            <TrendingUp size={24} />
          </div>
          <div className="radar-metric-info">
            <span className="radar-metric-title">Prontidão de Mercado</span>
            <span className="radar-metric-value">{readinessScore}%</span>
            <span className="radar-metric-desc">Pontuação geral com base nas skills</span>
          </div>
        </div>

        <div className="radar-metric-card accent">
          <div className="radar-metric-icon">
            <Compass size={24} />
          </div>
          <div className="radar-metric-info">
            <span className="radar-metric-title">Stack Dominante</span>
            <span className="radar-metric-value" style={{ fontSize: '1.25rem', fontWeight: 800 }}>{dominantStack}</span>
            <span className="radar-metric-desc">Foco de carreira sugerido</span>
          </div>
        </div>

        <div className="radar-metric-card">
          <div className="radar-metric-icon">
            <Award size={24} />
          </div>
          <div className="radar-metric-info">
            <span className="radar-metric-title">Ponto Mais Forte</span>
            <span className="radar-metric-value" style={{ fontSize: '1.05rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{strongestSkill}</span>
            <span className="radar-metric-desc">Habilidade de maior nível</span>
          </div>
        </div>
      </div>

      <h3 className="title-md mb-4" style={{ marginTop: '30px' }}>Minhas Competências</h3>

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
                      style={{ color: '#68d391', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                      title="Salvar"
                    ><Check size={16} /></button>
                    <button
                      onClick={() => setEditingSkillId(null)}
                      style={{ color: '#fc8181', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                      title="Cancelar"
                    ><X size={16} /></button>
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

      {/* Dynamic Insights & Job Matches Grid */}
      <div className="radar-insights-grid animate-fade-in" style={{ marginTop: '40px' }}>
        {/* Insights & Next Steps */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
          <h3 className="title-md flex items-center gap-2" style={{ margin: 0 }}>
            <Compass size={20} className="text-primary-light" style={{ color: 'var(--primary-light)' }} /> Recomendações e Próximos Passos
          </h3>
          <p className="text-secondary text-sm" style={{ margin: 0, lineHeight: 1.5 }}>
            Análise dinâmica de sua stack atual e recomendações inteligentes de estudo para acelerar sua prontidão de mercado.
          </p>
          
          <div className="insight-list-container" style={{ marginTop: '10px' }}>
            {insights.map((insight, idx) => (
              <div key={idx} className="insight-recommendation-item">
                <span className={`insight-recommendation-dot ${insight.ready ? 'ready' : ''}`}></span>
                <span className="text-sm text-primary" style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>{insight.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Job Matches */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
          <h3 className="title-md flex items-center gap-2" style={{ margin: 0 }}>
            <Briefcase size={20} className="text-secondary" style={{ color: '#60a5fa' }} /> Vagas Compatíveis com suas Habilidades
          </h3>
          <p className="text-secondary text-sm" style={{ margin: 0, lineHeight: 1.5 }}>
            Identificamos vagas de TI no Mercado Inteligente que exigem conhecimentos que você já adicionou ao seu Radar!
          </p>
          
          <div className="job-matches-container" style={{ marginTop: '10px' }}>
            {loadingJobs ? (
              <p className="text-muted text-sm text-center py-6">Carregando oportunidades compatíveis...</p>
            ) : matchedJobs.length === 0 ? (
              <div className="text-center py-8" style={{ border: '1px dashed var(--glass-border)', borderRadius: '8px', padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
                <p className="text-muted text-sm mb-3">Nenhuma vaga correspondente exata encontrada no momento.</p>
                <p className="text-xs text-secondary leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Adicione habilidades adicionais (ex: <strong>Java, React, SQL, AWS</strong>) para receber matchings de vagas ativos coletados da internet!
                </p>
              </div>
            ) : (
              matchedJobs.map((job: any) => (
                <div key={job.id} className="job-match-card">
                  <div className="job-match-header">
                    <h4 className="job-match-title">{job.title}</h4>
                    <span className="job-match-tag-pill">{job.sourcePlatform}</span>
                  </div>
                  <div className="job-match-meta" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '4px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Building size={14} style={{ color: 'var(--primary-light)' }} /> {job.company}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} style={{ color: '#60a5fa' }} /> {job.location}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span className="text-xs text-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                      <DollarSign size={13} style={{ color: '#68d391' }} /> {job.salaryRange ? job.salaryRange : 'Salário Não Divulgado'}
                    </span>
                    <a 
                      href={job.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs flex items-center gap-1 text-primary-light hover:underline font-bold"
                      style={{ color: 'var(--primary-light)' }}
                    >
                      Ver Detalhes <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
