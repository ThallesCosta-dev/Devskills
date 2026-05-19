import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Code2, Briefcase, MapPin, Link as LinkIcon, Edit2, Save, MessageCircle, Camera } from 'lucide-react';
import axios from 'axios';
import { Typewriter } from '../components/Typewriter';
import { toast } from 'react-hot-toast';
import { uploadImageToSupabase } from '../utils/uploadImage';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import './Profile.css';

export function Profile() {
  const { username } = useParams();
  const [devData, setDevData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Júnior');
  const avatarInputRef = useRef<HTMLInputElement>(null);

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
    
    // Send only the fields we actually want to update to avoid Jackson mapping errors with nested objects
    const payload = {
      name: devData.name,
      bio: devData.bio,
      avatarUrl: devData.avatarUrl,
      location: devData.location,
      role: devData.role,
      github: devData.github,
      linkedin: devData.linkedin,
      portfolio: devData.portfolio,
      username: devData.username
    };

    axios.put('/api/devskills/me', payload, {
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(res => {
      setDevData(res.data);
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    }).catch(err => {
      console.error("Erro ao salvar", err);
      if (err.response?.status === 409) {
        toast.error("Username já está em uso!");
      } else {
        toast.error(`Erro ao salvar: ${err.response?.data?.message || err.response?.data || err.message}`);
      }
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.loading("Enviando foto...", { id: 'avatar' });
    const url = await uploadImageToSupabase(file, 'profile_pictures');
    if (url) {
      setDevData({ ...devData, avatarUrl: url });
      toast.success("Foto carregada! Clique em Salvar para manter.", { id: 'avatar' });
    } else {
      toast.error("Falha ao enviar foto.", { id: 'avatar' });
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    axios.post('/api/devskills/me/skills', { name: newSkillName, proficiencyLevel: newSkillProficiency }, {
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(res => {
      setDevData(res.data);
      setNewSkillName('');
      toast.success("Habilidade adicionada!");
    }).catch(err => toast.error(err.response?.data || "Erro ao adicionar habilidade"));
  };

  const handleRemoveSkill = (devSkillId: number) => {
    axios.delete(`/api/devskills/me/skills/${devSkillId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(() => {
      fetchProfile();
      toast.success("Habilidade removida!");
    }).catch(err => toast.error("Erro ao remover: " + err.message));
  };

  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [editingLevel, setEditingLevel] = useState('');
  const LEVELS = ['Júnior', 'Pleno', 'Sênior', 'Especialista'];

  const handleEditSkill = (ds: any) => {
    setEditingSkillId(ds.id);
    setEditingLevel(ds.proficiencyLevel);
  };

  const handleSaveSkillLevel = (ds: any) => {
    if (editingLevel === ds.proficiencyLevel) { setEditingSkillId(null); return; }
    axios.put(`/api/devskills/me/skills/${ds.id}`, { proficiencyLevel: editingLevel }, {
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(() => {
      fetchProfile();
      setEditingSkillId(null);
      toast.success("Nível atualizado!");
    }).catch(err => toast.error("Erro ao atualizar nível."));
  };

  if (loading) return <LoadingSpinner text="Carregando perfil..." />;
  if (!devData) return <div className="container mt-8">Perfil não encontrado.</div>;

  return (
    <div className="container profile-layout animate-fade-in">
      <div className="profile-header glass-card">
        <div className="profile-banner"></div>
        <div className="profile-info">
          <div className="flex justify-between items-start">
            <div className="relative" style={{ display: 'inline-block' }}>
              <div
                className="profile-avatar-large"
                style={{ backgroundImage: devData.avatarUrl ? `url(${devData.avatarUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', color: devData.avatarUrl ? 'transparent' : 'white' }}
              >
                {!devData.avatarUrl && (devData.name || 'D').charAt(0)}
              </div>
              {isEditing && (
                <>
                  <input type="file" ref={avatarInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} />
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '0px',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      border: '3px solid var(--bg-base)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      zIndex: 20,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                    }}
                    title="Alterar Foto"
                  >
                    <Camera size={16} />
                  </button>
                </>
              )}
            </div>
            {isMe && (
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
                className={`btn ${isEditing ? 'btn-primary' : 'btn-outline'} mt-4`}
              >
                {isEditing ? <><Save size={18} /> Salvar</> : <><Edit2 size={18} /> Editar Perfil</>}
              </button>
            )}
            {!isMe && (
              <a href={`/chat/${devData.id}`} className="btn btn-primary mt-4 flex items-center gap-2">
                <MessageCircle size={18} /> Enviar Mensagem
              </a>
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
              {isEditing ? (
                <div className="flex items-center">
                  @ <input type="text" className="glass-input ml-2" value={devData.username || ''} onChange={e => setDevData({...devData, username: e.target.value})} placeholder="username" />
                </div>
              ) : (
                `@${devData.username || 'username'}`
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-sidebar glass-card delay-100">
          <h3 className="mb-4 text-primary-light flex justify-between items-center">
            Sobre mim
            {isEditing && <span className="text-xs text-muted font-normal">{devData.bio?.length || 0}/500</span>}
          </h3>
          {isEditing ? (
            <textarea className="glass-input" style={{width: '100%', minHeight: '100px'}} maxLength={500} value={devData.bio || ''} onChange={e => setDevData({...devData, bio: e.target.value})} placeholder="Fale um pouco sobre você..." />
          ) : (
            <p className="text-secondary leading-relaxed mb-4">{devData.bio || 'Nenhuma biografia fornecida.'}</p>
          )}

          <h3 className="mb-4 text-primary-light mt-8">Contato & Links</h3>
          <ul className="social-links">
            <li>
              <div className="flex items-center gap-sm">
                <Code2 size={18} /> 
                {isEditing ? <input className="glass-input flex-1" value={devData.github || ''} onChange={e => setDevData({...devData, github: e.target.value})} placeholder="github.com/..." /> 
                : <a href={devData.github?.startsWith('http') ? devData.github : `https://${devData.github}`} target="_blank" rel="noreferrer">{devData.github || 'Não informado'}</a>}
              </div>
            </li>
            <li>
              <div className="flex items-center gap-sm">
                <Briefcase size={18} />
                {isEditing ? <input className="glass-input flex-1" value={devData.linkedin || ''} onChange={e => setDevData({...devData, linkedin: e.target.value})} placeholder="linkedin.com/in/..." /> 
                : <a href={devData.linkedin?.startsWith('http') ? devData.linkedin : `https://${devData.linkedin}`} target="_blank" rel="noreferrer">{devData.linkedin || 'Não informado'}</a>}
              </div>
            </li>
            <li>
              <div className="flex items-center gap-sm">
                <LinkIcon size={18} />
                {isEditing ? <input className="glass-input flex-1" value={devData.portfolio || ''} onChange={e => setDevData({...devData, portfolio: e.target.value})} placeholder="Seu site..." /> 
                : <a href={devData.portfolio?.startsWith('http') ? devData.portfolio : `https://${devData.portfolio}`} target="_blank" rel="noreferrer">{devData.portfolio || 'Não informado'}</a>}
              </div>
            </li>
          </ul>
        </div>

        <div className="profile-content glass-card delay-200">
          <h3 className="mb-4 text-primary-light">Habilidades Principais</h3>
          
          {isMe && isEditing && (
            <div className="flex gap-sm mb-6 items-end">
              <div className="flex-1">
                <label className="text-xs text-secondary mb-1 block">Nova Habilidade</label>
                <input type="text" className="glass-input w-full" value={newSkillName} onChange={e => setNewSkillName(e.target.value)} placeholder="Ex: React, Java, Figma" />
              </div>
              <div style={{width: '120px'}}>
                <label className="text-xs text-secondary mb-1 block">Nível</label>
                <select className="glass-input w-full" value={newSkillProficiency} onChange={e => setNewSkillProficiency(e.target.value)}>
                  <option value="Júnior">Júnior</option>
                  <option value="Pleno">Pleno</option>
                  <option value="Sênior">Sênior</option>
                  <option value="Especialista">Especialista</option>
                </select>
              </div>
              <button onClick={handleAddSkill} className="btn btn-primary" style={{height: '42px'}}>Adicionar</button>
            </div>
          )}

          <div className="skills-tags">
            {devData.skills && devData.skills.length > 0 ? devData.skills.map((ds: any) => (
              <div key={ds.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span className="skill-tag-name">{ds.skill.name}</span>
                {isMe && isEditing && editingSkillId === ds.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <select
                      style={{ padding: '3px 8px', fontSize: '12px', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '6px' }}
                      value={editingLevel}
                      onChange={e => setEditingLevel(e.target.value)}
                    >
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <button
                      onClick={() => handleSaveSkillLevel(ds)}
                      style={{ color: '#68d391', fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
                      title="Salvar"
                    >✓</button>
                    <button
                      onClick={() => setEditingSkillId(null)}
                      style={{ color: '#fc8181', fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
                      title="Cancelar"
                    >✕</button>
                  </div>
                ) : (
                  <>
                    <span
                      className={`badge ${ds.proficiencyLevel === 'Sênior' || ds.proficiencyLevel === 'Especialista' ? 'primary' : ds.proficiencyLevel === 'Pleno' ? 'success' : 'secondary'}`}
                      style={isEditing ? { cursor: 'pointer' } : {}}
                      onClick={() => isEditing && handleEditSkill(ds)}
                      title={isEditing ? 'Clique para alterar o nível' : ''}
                    >
                      {ds.proficiencyLevel}
                    </span>
                    {isMe && isEditing && (
                      <button
                        onClick={() => handleRemoveSkill(ds.id)}
                        style={{ color: '#fc8181', fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
                        title="Remover"
                      >×</button>
                    )}
                  </>
                )}
              </div>
            )) : (
              <p className="text-secondary text-sm">Nenhuma habilidade cadastrada.</p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
