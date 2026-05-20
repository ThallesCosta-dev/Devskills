import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Send, UserCircle, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import './Chat.css';

export function Chat() {
  const { activeUserId } = useParams();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeUser, setActiveUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [targetUsername, setTargetUsername] = useState('');
  const [newDirectMessage, setNewDirectMessage] = useState('');
  const [sendingNew, setSendingNew] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const authToken = localStorage.getItem('auth_token');
  const isAuthenticated = !!authToken;
  const myUserId = localStorage.getItem('user_id');

  // Fetch contacts
  useEffect(() => {
    if (isAuthenticated) {
      axios.get('/api/chat/contacts', { headers: { Authorization: `Bearer ${authToken}` } })
        .then(res => setContacts(res.data))
        .catch(err => console.error(err));
    }
  }, [authToken, isAuthenticated]);

  // Fetch specific conversation if activeUserId is present
  useEffect(() => {
    if (activeUserId && activeUserId !== 'new') {
      setLoading(true);
      
      const existing = contacts.find(c => c.id === activeUserId);
      if (existing) {
        setActiveUser(existing);
      } else {
        axios.get(`/api/devskills/profile/id/${activeUserId}`, { headers: { Authorization: `Bearer ${authToken}` } })
          .then(res => {
            setActiveUser(res.data);
          })
          .catch(() => {
            setActiveUser({ id: activeUserId, name: 'Usuário' }); // Fallback
          });
      }

      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    } else {
      setActiveUser(null);
      setMessages([]);
    }
  }, [activeUserId, contacts]);

  const fetchMessages = () => {
    if (!activeUserId || activeUserId === 'new') return;
    axios.get(`/api/chat/history/${activeUserId}`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(res => {
        setMessages(res.data);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUserId) return;

    axios.post('/api/chat/send', { receiverId: activeUserId, content: newMessage }, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(res => {
        setMessages([...messages, res.data]);
        setNewMessage('');
        toast.success("Mensagem enviada!");
        // If it was a new contact, refresh contacts
        if (!contacts.find(c => c.id === activeUserId)) {
          axios.get('/api/chat/contacts', { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => setContacts(res.data));
        }
      })
      .catch(err => toast.error("Erro ao enviar mensagem"));
  };

  const handleSendByUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUsername.trim() || !newDirectMessage.trim()) return;

    setSendingNew(true);
    axios.post('/api/chat/send-by-username', { 
      username: targetUsername, 
      content: newDirectMessage 
    }, { 
      headers: { Authorization: `Bearer ${authToken}` } 
    })
      .then(res => {
        toast.success("Mensagem enviada com sucesso!");
        setTargetUsername('');
        setNewDirectMessage('');
        
        // Refresh contacts
        axios.get('/api/chat/contacts', { headers: { Authorization: `Bearer ${authToken}` } })
          .then(contactsRes => {
            setContacts(contactsRes.data);
            // Switch to the newly created conversation
            const receiver = res.data.receiver;
            navigate(`/chat/${receiver.id}`);
          });
      })
      .catch(err => {
        const errorMsg = err.response?.data || "Erro ao enviar mensagem";
        toast.error(errorMsg);
      })
      .finally(() => setSendingNew(false));
  };

  if (!isAuthenticated) {
    return (
      <div className="container animate-fade-in flex flex-col items-center justify-center text-center py-20">
        <div className="glass-card max-w-2xl p-10">
          <MessageCircle size={64} className="text-primary mb-6 mx-auto" />
          <h1 className="title-xl mb-4 text-gradient">Networking e Chat</h1>
          <p className="text-secondary text-lg mb-8 leading-relaxed">
            Conecte-se com outros desenvolvedores, recrutadores e parceiros. Troque ideias em tempo real, tire dúvidas em privado e construa sua rede de contatos profissionais na DevSkills.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login" className="btn btn-primary text-lg px-8 py-3">Faça Login para Acessar</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in chat-layout">
      <div className="chat-sidebar glass-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2" style={{ margin: 0 }}>
            <MessageCircle /> Mensagens
          </h3>
          <button 
            onClick={() => navigate('/chat/new')} 
            className="btn btn-outline"
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem', height: '28px', borderRadius: '4px' }}
          >
            + Nova
          </button>
        </div>
        <div className="contacts-list">
          {contacts.length === 0 ? (
            <p className="text-muted text-sm text-center py-4">Nenhum histórico de conversas.</p>
          ) : (
            contacts.map(c => (
              <div 
                key={c.id} 
                className={`contact-item ${c.id === activeUserId ? 'active' : ''}`}
                onClick={() => navigate(`/chat/${c.id}`)}
              >
                <div className="contact-avatar" style={{ backgroundImage: c.avatarUrl ? `url(${c.avatarUrl})` : 'none' }}>
                  {!c.avatarUrl && (c.name || 'D').charAt(0)}
                </div>
                <div className="contact-info">
                  <h4>{c.name}</h4>
                  <span className="text-xs text-muted">@{c.username}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-main glass-card">
        {activeUserId === 'new' ? (
          <div className="flex flex-col justify-center max-w-md mx-auto h-full animate-fade-in" style={{ padding: '2rem 0' }}>
            <h3 className="title-md mb-2 flex items-center gap-2">
              <MessageCircle className="text-primary" /> Nova Mensagem Privada
            </h3>
            <p className="text-secondary text-sm mb-6">
              Digite o @username do desenvolvedor e a mensagem abaixo para iniciar uma nova conversa direta.
            </p>
            
            <form onSubmit={handleSendByUsername} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-secondary">Destinatário (@username)</label>
                <input 
                  required
                  type="text" 
                  className="glass-input" 
                  placeholder="Ex: @thallescosta"
                  value={targetUsername}
                  onChange={e => setTargetUsername(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-secondary">Mensagem</label>
                <textarea 
                  required
                  rows={4}
                  className="glass-input" 
                  placeholder="Escreva sua mensagem privada aqui..." 
                  style={{ resize: 'none', padding: '12px', height: '120px' }}
                  value={newDirectMessage}
                  onChange={e => setNewDirectMessage(e.target.value)}
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary mt-2" 
                style={{ height: '42px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                disabled={sendingNew || !targetUsername.trim() || !newDirectMessage.trim()}
              >
                {sendingNew ? 'Enviando...' : 'Enviar Mensagem Directa'}
              </button>
            </form>
          </div>
        ) : activeUser ? (
          <>
            <div className="chat-header border-bottom pb-3 mb-4 flex items-center gap-3">
              <div className="contact-avatar" style={{ backgroundImage: activeUser.avatarUrl ? `url(${activeUser.avatarUrl})` : 'none' }}>
                {!activeUser.avatarUrl && (activeUser.name || 'U').charAt(0)}
              </div>
              <div>
                <h3 className="font-bold">{activeUser.name}</h3>
              </div>
            </div>

            <div className="chat-messages flex-1 overflow-y-auto mb-4 px-2" style={{ maxHeight: 'calc(100vh - 280px)' }}>
              {loading && messages.length === 0 && <LoadingSpinner text="Carregando mensagens..." />}
              {messages.map(msg => {
                const isMine = msg.sender.id === myUserId;
                return (
                  <div key={msg.id} className={`message-bubble-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                    <div className={`message-bubble ${isMine ? 'bg-primary' : 'bg-secondary bg-opacity-20'}`}>
                      <p>{msg.content}</p>
                      <span className="message-time text-xs mt-1 block opacity-70" style={{ textAlign: isMine ? 'right' : 'left' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="chat-input-area flex gap-2">
              <input 
                type="text" 
                className="glass-input flex-1" 
                placeholder="Digite sua mensagem..." 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-primary px-4">
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted opacity-50">
            <MessageCircle size={64} className="mb-4" />
            <p>Selecione um contato para iniciar uma conversa</p>
          </div>
        )}
      </div>
    </div>
  );
}
