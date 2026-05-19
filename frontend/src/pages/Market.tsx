import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Building, ExternalLink, Zap, ThumbsUp, ThumbsDown, Plus, Trash2, Briefcase } from 'lucide-react';
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

  const authToken = localStorage.getItem('auth_token');
  const isAuthenticated = !!authToken;
  const myUserId = localStorage.getItem('user_id');

  const fetchJobs = () => {
    setLoading(true);
    axios.get('/api/jobs/market')
      .then((response) => {
        setJobs(response.data.sort((a: JobOffer, b: JobOffer) => b.id - a.id));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar vagas do backend", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isAuthenticated) fetchJobs();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container animate-fade-in flex flex-col items-center justify-center text-center py-20">
        <div className="glass-card max-w-2xl p-10">
          <Briefcase size={64} className="text-primary mb-6 mx-auto" />
          <h1 className="title-xl mb-4 text-gradient">Mercado de Vagas</h1>
          <p className="text-secondary text-lg mb-8 leading-relaxed">
            Descubra e compartilhe as melhores oportunidades de emprego com a comunidade DevSkills. Vote nas vagas mais quentes, encontre empresas que valorizam suas habilidades e expanda sua carreira.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login" className="btn btn-primary text-lg px-8 py-3">Faça Login para Acessar</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleVote = (id: number, voteValue: number) => {
    if (votingId === id) return;
    setVotingId(id);
    axios.post(`/api/jobs/${id}/vote`, { vote: voteValue }, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => fetchJobs())
      .catch(err => toast.error("Erro ao votar: " + err.message))
      .finally(() => setVotingId(null));
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
        fetchJobs();
        toast.success("Vaga adicionada!");
      })
      .catch(err => toast.error("Erro ao adicionar vaga: " + err.message));
  };

  const handleDeleteJob = (id: number) => {
    if (!confirm("Tem certeza que deseja apagar esta vaga?")) return;
    axios.delete(`/api/jobs/${id}`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => {
        fetchJobs();
        toast.success("Vaga apagada!");
      })
      .catch(err => toast.error("Erro ao apagar: " + err.message));
  };

  return (
    <div className="container animate-fade-in">
      <div className="market-header mb-4 flex justify-between items-start">
        <div>
          <h1 className="title-xl"><Typewriter text="Mercado Inteligente" speed={80} /></h1>
          <p className="text-secondary">Vagas recomendadas pela comunidade. Vote nas melhores oportunidades!</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          <Plus size={18} /> Adicionar Vaga
        </button>
      </div>

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

      <div className="jobs-list">
        {loading ? (
          <LoadingSpinner text="Carregando vagas do servidor..." />
        ) : jobs.length === 0 ? (
          <p className="text-muted">Nenhuma vaga encontrada no momento.</p>
        ) : (
          jobs.map((job, index) => (
            <div key={job.id} className={`glass-card job-card delay-${(index % 5 + 1) * 100}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="job-title">{job.title}</h3>
                  <p className="text-xs text-muted mb-1">Postado por {job.author?.name || 'Desconhecido'}</p>
                </div>
                <div className="flex gap-2">
                  <div className="match-badge">
                    <Zap size={14} />
                    <span>Em Alta</span>
                  </div>
                  {myUserId && job.author?.id === myUserId && (
                    <button onClick={() => handleDeleteJob(job.id)} className="text-red-400 hover:text-red-300 ml-2" title="Apagar Vaga">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="job-info flex gap-md mb-4 text-secondary text-sm">
                <span className="flex items-center gap-sm">
                  <Building size={16} /> {job.company}
                </span>
                <span className="flex items-center gap-sm">
                  <MapPin size={16} /> {job.location || 'Não informado'}
                </span>
              </div>
              
              <div className="flex justify-between items-center border-top pt-3">
                <span className="text-xs text-muted">Via {job.sourcePlatform || 'DevSkills'}</span>
                
                <div className="flex items-center gap-md">
                  <div className="flex items-center gap-sm mr-4">
                    <button
                      onClick={() => handleVote(job.id, 1)}
                      disabled={votingId === job.id}
                      className="action-btn flex items-center gap-1 transition-all hover:scale-110"
                      style={{ color: job.upvotes > job.downvotes ? '#4ade80' : 'var(--text-muted)', opacity: votingId === job.id ? 0.5 : 1, transition: 'color 0.2s' }}
                      title="Recomendar"
                    >
                      <ThumbsUp size={16} /> {job.upvotes || 0}
                    </button>
                    <button
                      onClick={() => handleVote(job.id, -1)}
                      disabled={votingId === job.id}
                      className="action-btn flex items-center gap-1 transition-all hover:scale-110"
                      style={{ color: job.downvotes > job.upvotes ? '#f87171' : 'var(--text-muted)', opacity: votingId === job.id ? 0.5 : 1, transition: 'color 0.2s' }}
                      title="Não Recomendar"
                    >
                      <ThumbsDown size={16} /> {job.downvotes || 0}
                    </button>
                  </div>
                  
                  <a href={job.sourceUrl?.startsWith('http') ? job.sourceUrl : `https://${job.sourceUrl}`} target="_blank" rel="noreferrer" className="btn btn-outline text-sm flex items-center gap-1">
                    Ver Vaga <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
