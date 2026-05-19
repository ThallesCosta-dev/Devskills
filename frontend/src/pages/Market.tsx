import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Building, ExternalLink, Zap, ThumbsUp, ThumbsDown, Plus, Trash2, Briefcase, DollarSign, Globe, Filter, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { Typewriter } from '../components/Typewriter';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import './Market.css';

interface Developer {
  id: string;
  name: string;
}

interface JobOffer {
  id: number;
  title: string;
  company: string;
  location: string;
  sourceUrl: string;
  sourcePlatform: string;
  salaryRange: string | null;
  tags: string | null;
  jobType: string | null;
  upvotes: number;
  downvotes: number;
  author: Developer;
}

export function Market() {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', location: '', sourceUrl: '', sourcePlatform: '' });
  const [votingId, setVotingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'votes'>('votes');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estados de Paginação
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const authToken = localStorage.getItem('auth_token');
  const isAuthenticated = !!authToken;
  const myUserId = localStorage.getItem('user_id');

  const fetchJobs = (pageToFetch = 0, append = false, silent = false) => {
    if (!silent && !append) setLoading(true);
    if (silent) setIsRefreshing(true);

    axios.get('/api/jobs/market', {
      params: {
        page: pageToFetch,
        size: 10,
        search: search.trim() || undefined,
        type: filterType !== 'ALL' ? filterType : undefined,
        sort: sortBy
      }
    })
      .then((response) => {
        const data = response.data;
        if (append) {
          setJobs(prev => [...prev, ...data]);
        } else {
          setJobs(data);
        }
        setHasMore(data.length === 10);
        setLastUpdated(new Date());
        setLoading(false);
        setIsRefreshing(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar vagas do backend", error);
        setLoading(false);
        setIsRefreshing(false);
      });
  };

  // Carrega do zero quando filtros de busca/ordenação mudam
  useEffect(() => {
    if (!isAuthenticated) return;

    const delayDebounceFn = setTimeout(() => {
      setPage(0);
      fetchJobs(0, false, false);
    }, 300); // Debounce curto de 300ms para digitação fluida

    return () => clearTimeout(delayDebounceFn);
  }, [search, filterType, sortBy, isAuthenticated]);

  // Polling em background e Window Focus Refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchJobs(0, false, true);
    }, 60_000);

    const onFocus = () => {
      setPage(0);
      fetchJobs(0, false, true);
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container animate-fade-in flex flex-col items-center justify-center text-center py-20">
        <div className="glass-card max-w-2xl p-10">
          <Briefcase size={64} className="text-primary mb-6 mx-auto" />
          <h1 className="title-xl mb-4 text-gradient">Mercado Inteligente</h1>
          <p className="text-secondary text-lg mb-8 leading-relaxed">
            Vagas de TI coletadas automaticamente das maiores plataformas do mundo — RemoteOK, Arbeitnow e mais. Filtre, vote nas melhores e candidate-se diretamente.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login" className="btn btn-primary text-lg px-8 py-3">Faça Login para Acessar</Link>
          </div>
        </div>
      </div>
    );
  }

  // Votação Otimista (atualiza estado local para resposta instantânea)
  const handleVote = (id: number, voteValue: number) => {
    if (votingId === id) return;
    setVotingId(id);
    axios.post(`/api/jobs/${id}/vote`, { vote: voteValue }, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => {
        setJobs(prev => prev.map(job => {
          if (job.id === id) {
            let updatedUpvotes = job.upvotes;
            let updatedDownvotes = job.downvotes;
            if (voteValue === 1) {
              updatedUpvotes += 1;
            } else {
              updatedDownvotes += 1;
            }
            return { ...job, upvotes: updatedUpvotes, downvotes: updatedDownvotes };
          }
          return job;
        }));
        toast.success("Voto computado!");
      })
      .catch(err => toast.error("Erro ao votar: " + err.message))
      .finally(() => setVotingId(null));
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchJobs(nextPage, true, false);
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.sourceUrl.trim()) {
      toast.error("O link da vaga é obrigatório!");
      return;
    }
    axios.post('/api/jobs', newJob, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => {
        setShowAddForm(false);
        setNewJob({ title: '', company: '', location: '', sourceUrl: '', sourcePlatform: '' });
        setPage(0);
        fetchJobs(0, false, false);
        toast.success("Vaga adicionada!");
      })
      .catch(err => toast.error("Erro ao adicionar vaga: " + err.message));
  };

  const handleDeleteJob = (id: number) => {
    if (!confirm("Tem certeza que deseja apagar esta vaga?")) return;
    axios.delete(`/api/jobs/${id}`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => {
        setPage(0);
        fetchJobs(0, false, false);
        toast.success("Vaga apagada!");
      })
      .catch(err => toast.error("Erro ao apagar: " + err.message));
  };

  const jobTypeBadgeColor: Record<string, string> = {
    REMOTE: '#34d399',
    HYBRID: '#60a5fa',
    ONSITE: '#f59e0b',
  };

  return (
    <div className="container animate-fade-in">
      {/* Header */}
      <div className="market-header mb-4 flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="title-xl"><Typewriter text="Mercado Inteligente" speed={80} /></h1>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-secondary">
              Vagas de TI coletadas automaticamente de RemoteOK e Arbeitnow.
            </p>
            {isRefreshing ? (
              <span style={{ fontSize: '12px', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Atualizando...
              </span>
            ) : lastUpdated ? (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                ● Atualizado às {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setPage(0); fetchJobs(0, false, true); }} 
            className="btn btn-outline" 
            title="Atualizar vagas agora"
            style={{ opacity: isRefreshing ? 0.5 : 1 }}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
            <Plus size={18} /> Adicionar Vaga
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAddForm && (
        <form onSubmit={handleAddJob} className="glass-card mb-4 grid gap-md" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <input required type="text" placeholder="Título da Vaga" className="glass-input" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
          <input required type="text" placeholder="Empresa" className="glass-input" value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} />
          <input type="text" placeholder="Localização (ex: Remoto)" className="glass-input" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} />
          <input type="text" placeholder="Plataforma (ex: LinkedIn, Gupy)" className="glass-input" value={newJob.sourcePlatform} onChange={e => setNewJob({...newJob, sourcePlatform: e.target.value})} />
          <input required type="url" placeholder="Link de Redirecionamento (URL)" className="glass-input" style={{ gridColumn: '1 / -1' }} value={newJob.sourceUrl} onChange={e => setNewJob({...newJob, sourceUrl: e.target.value})} />
          <div style={{ gridColumn: '1 / -1' }} className="flex justify-end mt-2">
            <button type="submit" className="btn btn-primary">Salvar Vaga</button>
          </div>
        </form>
      )}

      {/* Filters & Search */}
      <div className="glass-card mb-4 flex flex-wrap gap-3 items-center" style={{ padding: '12px 16px' }}>
        <div className="flex items-center gap-2 flex-1" style={{ minWidth: '200px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Buscar por cargo, empresa ou tecnologia..."
            className="glass-input"
            style={{ flex: 1, padding: '6px 10px', fontSize: '14px', border: 'none', background: 'transparent' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          {['ALL', 'REMOTE', 'HYBRID', 'ONSITE'].map(type => {
            const getIcon = () => {
              if (type === 'REMOTE') return <Globe size={12} style={{ marginRight: '4px' }} />;
              if (type === 'HYBRID') return <Building size={12} style={{ marginRight: '4px' }} />;
              if (type === 'ONSITE') return <MapPin size={12} style={{ marginRight: '4px' }} />;
              return null;
            };
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', border: 'none',
                  background: filterType === type ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                  color: filterType === type ? '#fff' : 'var(--text-secondary)',
                  fontWeight: filterType === type ? 600 : 400,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {getIcon()}
                {type === 'ALL' ? 'Todas' : type === 'REMOTE' ? 'Remote' : type === 'HYBRID' ? 'Híbrido' : 'Presencial'}
              </button>
            );
          })}
        </div>
        <select
          className="glass-input"
          style={{ padding: '4px 10px', fontSize: '13px', width: 'auto' }}
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'recent' | 'votes')}
        >
          <option value="votes">Mais votadas</option>
          <option value="recent">Mais recentes</option>
        </select>
      </div>

      {/* Job list */}
      <div className="jobs-list">
        {loading && page === 0 ? (
          <LoadingSpinner text="Carregando vagas do servidor..." />
        ) : jobs.length === 0 ? (
          <div className="glass-card text-center py-12">
            <Briefcase size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p className="text-muted">Nenhuma vaga encontrada. Tente outro filtro ou aguarde o próximo scraping.</p>
          </div>
        ) : (
          <>
            {jobs.map((job, index) => {
              const net = job.upvotes - job.downvotes;
              const tags = job.tags ? job.tags.split(',').filter(Boolean).slice(0, 6) : [];
              const typeColor = jobTypeBadgeColor[job.jobType || ''] || '#94a3b8';

              return (
                <div key={job.id} className={`glass-card job-card delay-${(index % 5 + 1) * 100}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="job-title" style={{ margin: 0 }}>{job.title}</h3>
                        {job.jobType && (
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: `${typeColor}22`, color: typeColor, border: `1px solid ${typeColor}44`, fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {job.jobType === 'REMOTE' ? <Globe size={11} /> : job.jobType === 'HYBRID' ? <Building size={11} /> : <MapPin size={11} />}
                            {job.jobType === 'REMOTE' ? 'Remote' : job.jobType === 'HYBRID' ? 'Híbrido' : 'Presencial'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted mb-1">via {job.sourcePlatform || 'DevSkills'}</p>
                    </div>
                    <div className="flex gap-2 items-center ml-2">
                      <div className="match-badge">
                        <Zap size={14} />
                        <span>{net > 0 ? 'Em Alta' : 'Nova'}</span>
                      </div>
                      {myUserId && job.author?.id === myUserId && (
                        <button onClick={() => handleDeleteJob(job.id)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="Apagar Vaga">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="job-info flex flex-wrap gap-md mb-3 text-secondary text-sm">
                    <span className="flex items-center gap-sm">
                      <Building size={14} /> {job.company}
                    </span>
                    {job.location && (
                      <span className="flex items-center gap-sm">
                        <MapPin size={14} /> {job.location}
                      </span>
                    )}
                    {job.salaryRange && (
                      <span className="flex items-center gap-sm" style={{ color: '#34d399' }}>
                        <DollarSign size={14} /> {job.salaryRange}
                      </span>
                    )}
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tags.map(tag => (
                        <span key={tag} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center border-top pt-3">
                    <div className="flex items-center gap-md">
                      <button
                        onClick={() => handleVote(job.id, 1)}
                        disabled={votingId === job.id}
                        style={{ color: net > 0 ? '#4ade80' : 'var(--text-muted)', opacity: votingId === job.id ? 0.5 : 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', transition: 'color 0.2s' }}
                        title="Recomendar"
                      >
                        <ThumbsUp size={16} /> {job.upvotes || 0}
                      </button>
                      <button
                        onClick={() => handleVote(job.id, -1)}
                        disabled={votingId === job.id}
                        style={{ color: net < 0 ? '#f87171' : 'var(--text-muted)', opacity: votingId === job.id ? 0.5 : 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', transition: 'color 0.2s' }}
                        title="Não Recomendar"
                      >
                        <ThumbsDown size={16} /> {job.downvotes || 0}
                      </button>
                    </div>

                    <a href={job.sourceUrl?.startsWith('http') ? job.sourceUrl : `https://${job.sourceUrl}`} target="_blank" rel="noreferrer" className="btn btn-outline text-sm flex items-center gap-1">
                      Ver Vaga <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className="flex justify-center mt-6 mb-8">
                <button 
                  onClick={handleLoadMore} 
                  className="btn btn-primary px-8 py-3 text-base flex items-center gap-2"
                  style={{ borderRadius: '30px', cursor: 'pointer' }}
                >
                  <RefreshCw size={16} /> Ver Mais Vagas
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

