import { useState, useEffect } from 'react';
import { Search, MapPin, Building, ExternalLink, Zap, ThumbsUp, ThumbsDown, Plus } from 'lucide-react';
import axios from 'axios';
import { Typewriter } from '../components/Typewriter';
import './Market.css';

interface JobOffer {
  id: number;
  title: string;
  company: string;
  location: string;
  sourcePlatform: string;
  upvotes: number;
  downvotes: number;
}

export function Market() {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', location: '', sourcePlatform: '' });

  const fetchJobs = () => {
    setLoading(true);
    axios.get('/api/jobs/market')
      .then((response) => {
        setJobs(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar vagas do backend", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleVote = (id: number, type: 'upvote' | 'downvote') => {
    axios.post(`/api/jobs/${id}/${type}`)
      .then(() => fetchJobs())
      .catch(err => console.error(err));
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post('/api/jobs', newJob)
      .then(() => {
        setShowAddForm(false);
        setNewJob({ title: '', company: '', location: '', sourcePlatform: '' });
        fetchJobs();
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="container animate-fade-in">
      <div className="market-header mb-4 flex justify-between items-start">
        <div>
          <h1 className="title-xl"><Typewriter text="Mercado Inteligente" speed={80} /></h1>
          <p className="text-secondary">Vagas recomendadas automaticamente baseadas nas suas skills.</p>
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
          <input type="text" placeholder="Plataforma (ex: LinkedIn)" className="glass-input" value={newJob.sourcePlatform} onChange={e => setNewJob({...newJob, sourcePlatform: e.target.value})} />
          <div style={{ gridColumn: '1 / -1' }} className="flex justify-end mt-2">
            <button type="submit" className="btn btn-primary">Salvar Vaga</button>
          </div>
        </form>
      )}

      <div className="search-bar glass-card mb-4">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por cargo, tecnologia ou empresa..."
          className="search-input"
        />
        <button className="btn btn-primary">Buscar</button>
      </div>

      <div className="jobs-list">
        {loading ? (
          <p className="text-muted">Carregando vagas do servidor...</p>
        ) : jobs.length === 0 ? (
          <p className="text-muted">Nenhuma vaga encontrada no momento.</p>
        ) : (
          jobs.map((job, index) => (
            <div key={job.id} className={`glass-card job-card delay-${(index % 5 + 1) * 100}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="job-title">{job.title}</h3>
                <div className="match-badge">
                  <Zap size={14} />
                  <span>Novo Match</span>
                </div>
              </div>
              
              <div className="job-info flex gap-md mb-4 text-secondary text-sm">
                <span className="flex items-center gap-sm">
                  <Building size={16} /> {job.company}
                </span>
                <span className="flex items-center gap-sm">
                  <MapPin size={16} /> {job.location || 'Remote'}
                </span>
              </div>
              
              <div className="flex justify-between items-center border-top">
                <span className="text-xs text-muted">Via {job.sourcePlatform || 'DevSkills'}</span>
                
                <div className="flex items-center gap-md">
                  <div className="flex items-center gap-sm">
                    <button onClick={() => handleVote(job.id, 'upvote')} className="action-btn text-success" title="Recomendar">
                      <ThumbsUp size={16} /> {job.upvotes || 0}
                    </button>
                    <button onClick={() => handleVote(job.id, 'downvote')} className="action-btn text-danger" title="Não Recomendar">
                      <ThumbsDown size={16} /> {job.downvotes || 0}
                    </button>
                  </div>
                  
                  <button className="btn btn-outline text-sm">
                    Ver Vaga <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
