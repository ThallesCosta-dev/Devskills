import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Code2, Briefcase, MapPin, Link as LinkIcon, Edit2, Save } from 'lucide-react';
import axios from 'axios';
import { Typewriter } from '../components/Typewriter';
import './Profile.css';

export function Profile() {
  const { username } = useParams();
  const [devData, setDevData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if it's the current user's profile
  const isMe = username === 'me';
  const authToken = localStorage.getItem('auth_token');

  const fetchProfile = () => {
    setLoading(true);
    const url = isMe ? '/api/devskills/me' : `/api/devskills/profile/${username}`;
    const headers = isMe && authToken ? { Authorization: `Bearer ${authToken}` } : {};

    axios.get(url, { headers })
      .then(res => {
        setDevData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar perfil", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const handleSave = () => {
    if (!isMe) return;
    axios.put('/api/devskills/me', devData, {
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(res => {
      setDevData(res.data);
      setIsEditing(false);
    }).catch(err => console.error("Erro ao salvar", err));
  };

  if (loading) return <div className="container mt-8">Carregando perfil...</div>;
  if (!devData) return <div className="container mt-8">Perfil não encontrado.</div>;

  return (
    <div className="container profile-layout animate-fade-in">
      <div className="profile-header glass-card">
        <div className="profile-banner"></div>
        <div className="profile-info">
          <div className="flex justify-between items-start">
            <div className="profile-avatar-large">
              {(devData.name || 'D').charAt(0)}
            </div>
            {isMe && (
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
                className={`btn ${isEditing ? 'btn-primary' : 'btn-outline'} mt-4`}
              >
                {isEditing ? <><Save size={18} /> Salvar</> : <><Edit2 size={18} /> Editar Perfil</>}
              </button>
            )}
          </div>
          
          <div className="profile-title">
            {isEditing ? (
              <input type="text" className="glass-input title-xl" style={{width: '100%', marginBottom: '10px'}} value={devData.name || ''} onChange={e => setDevData({...devData, name: e.target.value})} placeholder="Seu Nome" />
            ) : (
              <h1 className="title-xl"><Typewriter text={devData.name || 'Desenvolvedor'} speed={80} /></h1>
            )}
            
            {isEditing ? (
              <input type="text" className="glass-input role-text" value={devData.role || ''} onChange={e => setDevData({...devData, role: e.target.value})} placeholder="Seu Cargo" />
            ) : (
              <p className="text-primary-light font-semibold role-text">{devData.role || 'Membro DevSkills'}</p>
            )}
          </div>
          
          <div className="flex gap-md mt-4 text-secondary">
            <span className="flex items-center gap-sm">
              <MapPin size={16} /> 
              {isEditing ? (
                <input type="text" className="glass-input" value={devData.location || ''} onChange={e => setDevData({...devData, location: e.target.value})} placeholder="Localização" />
              ) : (devData.location || 'Não informado')}
            </span>
            <span className="flex items-center gap-sm ml-auto">
              @{devData.username || 'username'}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-sidebar glass-card delay-100">
          <h3 className="mb-4 text-primary-light">Sobre mim</h3>
          {isEditing ? (
            <textarea className="glass-input" style={{width: '100%', minHeight: '100px'}} value={devData.bio || ''} onChange={e => setDevData({...devData, bio: e.target.value})} placeholder="Fale um pouco sobre você..." />
          ) : (
            <p className="text-secondary leading-relaxed mb-4">{devData.bio || 'Nenhuma biografia fornecida.'}</p>
          )}

          <h3 className="mb-4 text-primary-light mt-8">Contato & Links</h3>
          <ul className="social-links">
            <li>
              <div className="flex items-center gap-sm">
                <Code2 size={18} /> 
                {isEditing ? <input className="glass-input flex-1" value={devData.github || ''} onChange={e => setDevData({...devData, github: e.target.value})} placeholder="github.com/..." /> 
                : <a href={`https://${devData.github}`} target="_blank" rel="noreferrer">{devData.github || 'Não informado'}</a>}
              </div>
            </li>
            <li>
              <div className="flex items-center gap-sm">
                <Briefcase size={18} />
                {isEditing ? <input className="glass-input flex-1" value={devData.linkedin || ''} onChange={e => setDevData({...devData, linkedin: e.target.value})} placeholder="linkedin.com/in/..." /> 
                : <a href={`https://${devData.linkedin}`} target="_blank" rel="noreferrer">{devData.linkedin || 'Não informado'}</a>}
              </div>
            </li>
            <li>
              <div className="flex items-center gap-sm">
                <LinkIcon size={18} />
                {isEditing ? <input className="glass-input flex-1" value={devData.portfolio || ''} onChange={e => setDevData({...devData, portfolio: e.target.value})} placeholder="Seu site..." /> 
                : <a href={`https://${devData.portfolio}`} target="_blank" rel="noreferrer">{devData.portfolio || 'Não informado'}</a>}
              </div>
            </li>
          </ul>
        </div>

        <div className="profile-content glass-card delay-200">
          <h3 className="mb-4 text-primary-light">Habilidades Principais</h3>
          <div className="skills-tags">
            {/* Using mock skills since dev-skills table is not fully integrated yet */}
            {[{ name: 'Java', category: 'Backend', level: 'Expert' }, { name: 'React', category: 'Frontend', level: 'Senior' }].map(skill => (
              <div key={skill.name} className="skill-tag">
                <span className="skill-tag-name">{skill.name}</span>
                <span className={`badge ${skill.category === 'Frontend' ? 'primary' : skill.category === 'Backend' ? 'success' : ''}`}>
                  {skill.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
