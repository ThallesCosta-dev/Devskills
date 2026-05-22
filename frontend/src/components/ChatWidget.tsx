import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Send, MessageCircle, X, ArrowLeft, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from './ui/LoadingSpinner';
import './ChatWidget.css';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeUser, setActiveUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [targetUsername, setTargetUsername] = useState('');
  const [newDirectMessage, setNewDirectMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const authToken = localStorage.getItem('auth_token');
  const isAuthenticated = !!authToken;
  const [myId, setMyId] = useState<string | null>(localStorage.getItem('user_id'));
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Fetch current user profile if user_id is not in localStorage
  useEffect(() => {
    if (isAuthenticated && !myId) {
      axios.get('/api/devskills/me', { headers: { Authorization: `Bearer ${authToken}` } })
        .then(res => {
          if (res.data && res.data.id) {
            localStorage.setItem('user_id', res.data.id);
            setMyId(res.data.id);
          }
        })
        .catch(err => console.error("Error fetching current profile in widget:", err));
    }
  }, [authToken, isAuthenticated, myId]);

  // Load unread message count
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUnreadCount = () => {
        axios.get('/api/chat/unread-count', { headers: { Authorization: `Bearer ${authToken}` } })
          .then(res => setUnreadCount(Number(res.data)))
          .catch(err => console.error("Error fetching unread count:", err));
      };

      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 8000); // Poll every 8s
      return () => clearInterval(interval);
    }
  }, [authToken, isAuthenticated, isOpen]);

  // Load contacts
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      axios.get('/api/chat/contacts', { headers: { Authorization: `Bearer ${authToken}` } })
        .then(res => setContacts(res.data))
        .catch(err => console.error(err));
    }
  }, [authToken, isAuthenticated, isOpen]);

  // Load messages
  useEffect(() => {
    if (activeUser && isOpen) {
      setLoading(true);
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [activeUser, isOpen]);

  // Handle global events for opening chat with specific user
  useEffect(() => {
    const handleOpenChat = (event: any) => {
      if (!isAuthenticated) return;
      const { userId, userName } = event.detail;
      setIsOpen(true);
      // Try to find in contacts
      const existing = contacts.find(c => c.id === userId);
      if (existing) {
        setActiveUser(existing);
      } else {
        setActiveUser({ id: userId, name: userName || 'Usuário' });
      }
    };
    
    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, [contacts, isAuthenticated]);

  const fetchMessages = () => {
    if (!activeUser) return;
    axios.get(`/api/chat/history/${activeUser.id}`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(res => {
        setMessages(res.data);
        setLoading(false);
        // Refresh unread count since we just loaded and read messages
        axios.get('/api/chat/unread-count', { headers: { Authorization: `Bearer ${authToken}` } })
          .then(cRes => setUnreadCount(Number(cRes.data)))
          .catch(err => console.error(err));
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isExpanded]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser) return;

    axios.post('/api/chat/send', { receiverId: activeUser.id, content: newMessage }, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(res => {
        setMessages([...messages, res.data]);
        setNewMessage('');
        toast.success("Mensagem enviada!");
        // Refresh contacts to update order if needed
        axios.get('/api/chat/contacts', { headers: { Authorization: `Bearer ${authToken}` } })
          .then(res => setContacts(res.data));
      })
      .catch(() => toast.error("Erro ao enviar mensagem"));
  };

  const handleSendByUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUsername.trim() || !newDirectMessage.trim()) return;

    axios.post('/api/chat/send-by-username', { 
      username: targetUsername, 
      content: newDirectMessage 
    }, { 
      headers: { Authorization: `Bearer ${authToken}` } 
    })
      .then(res => {
        toast.success("Mensagem enviada!");
        setTargetUsername('');
        setNewDirectMessage('');
        setIsCreatingNew(false);

        // Load new contact and set active to open chat
        const receiver = res.data.receiver;
        setActiveUser(receiver);

        // Refresh contacts list
        axios.get('/api/chat/contacts', { headers: { Authorization: `Bearer ${authToken}` } })
          .then(res => setContacts(res.data));
      })
      .catch(err => {
        const errorMsg = err.response?.data || "Erro ao enviar mensagem";
        toast.error(errorMsg);
      });
  };

  if (!isAuthenticated) return null;

  return (
    <div className={`chat-widget-container ${isOpen ? 'open' : ''} ${isExpanded ? 'expanded' : ''}`}>
      {!isOpen && (
        <button className="chat-fab btn-primary" onClick={() => setIsOpen(true)} style={{ position: 'relative' }}>
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <span className="chat-unread-badge">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="chat-window glass-card">
          <div className="chat-header-bar">
            <div className="chat-header-left">
              {activeUser ? (
                <>
                  <button onClick={() => { setActiveUser(null); setIsCreatingNew(false); }} className="chat-back-btn">
                    <ArrowLeft size={18} />
                  </button>
                  <div className="chat-avatar" style={{ backgroundImage: activeUser.avatarUrl ? `url(${activeUser.avatarUrl})` : 'none' }}>
                    {!activeUser.avatarUrl && (activeUser.name || 'U').charAt(0)}
                  </div>
                  <span className="chat-user-name">{activeUser.name}</span>
                </>
              ) : isCreatingNew ? (
                <>
                  <button onClick={() => setIsCreatingNew(false)} className="chat-back-btn">
                    <ArrowLeft size={18} />
                  </button>
                  <span className="chat-user-name">Nova Mensagem</span>
                </>
              ) : (
                <>
                  <MessageCircle size={20} />
                  <span>Mensagens</span>
                </>
              )}
            </div>
            <div className="chat-header-right">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  navigate(activeUser ? `/chat/${activeUser.id}` : isCreatingNew ? '/chat/new' : '/chat');
                }} 
                className="chat-action-btn" 
                title="Abrir em Tela Cheia"
              >
                <ExternalLink size={16} />
              </button>
              <button onClick={() => setIsExpanded(!isExpanded)} className="chat-action-btn desktop-only" title={isExpanded ? "Minimizar" : "Expandir"}>
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="chat-action-btn" title="Fechar">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="chat-body">
            {/* Contatos List */}
            <div className="contacts-view" style={{ display: (activeUser || isCreatingNew) ? 'none' : 'block' }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(255,255,255,0.01)' }}>
                <button 
                  onClick={() => setIsCreatingNew(true)} 
                  className="btn btn-outline" 
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', height: '26px', borderRadius: '4px' }}
                >
                  + Nova Mensagem
                </button>
              </div>
              {contacts.length === 0 ? (
                <div className="empty-chat-state" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                  <p className="text-secondary text-sm">Você ainda não possui histórico de conversas.</p>
                </div>
              ) : (
                contacts.map(c => (
                  <div 
                    key={c.id} 
                    className="contact-item-row"
                    onClick={() => setActiveUser(c)}
                  >
                    <div className="contact-avatar-small" style={{ backgroundImage: c.avatarUrl ? `url(${c.avatarUrl})` : 'none' }}>
                      {!c.avatarUrl && (c.name || 'D').charAt(0)}
                    </div>
                    <div className="contact-info-small">
                      <h4 className="contact-name">{c.name}</h4>
                      <p className="contact-username">@{c.username}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mensagens View */}
            <div className="messages-view" style={{ display: activeUser ? 'flex' : 'none' }}>
              <div className="messages-list">
                {loading && messages.length === 0 && (
                  <div className="loading-container">
                    <LoadingSpinner />
                  </div>
                )}
                {messages.map(msg => {
                  const isMine = msg.sender.id === myId;
                  return (
                    <div key={msg.id} className={`message-row ${isMine ? 'mine' : 'theirs'}`}>
                      <div className={`message-bubble ${isMine ? 'bg-primary' : 'bg-secondary'}`}>
                        <p className="message-content">{msg.content}</p>
                        <span className="message-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              
              <form onSubmit={handleSend} className="chat-input-area">
                <input 
                  type="text" 
                  className="chat-input" 
                  placeholder="Sua mensagem..." 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                />
                <button type="submit" className="chat-send-btn btn-primary" disabled={!newMessage.trim()}>
                  <Send size={16} />
                </button>
              </form>
            </div>

            {/* New Message Form */}
            {isCreatingNew && (
              <div className="new-message-view" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="text-xs text-secondary font-bold" style={{ color: 'var(--text-secondary)' }}>@username do destinatário</label>
                  <input 
                    type="text" 
                    className="chat-input" 
                    placeholder="Ex: @thallescosta" 
                    style={{ background: 'var(--bg-deep)', border: '1px solid var(--glass-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                    value={targetUsername}
                    onChange={e => setTargetUsername(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <label className="text-xs text-secondary font-bold" style={{ color: 'var(--text-secondary)' }}>Sua Mensagem</label>
                  <textarea 
                    rows={4}
                    placeholder="Digite sua mensagem..." 
                    style={{ background: 'var(--bg-deep)', border: '1px solid var(--glass-border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--text-primary)', resize: 'none', height: '100px', outline: 'none', fontFamily: 'inherit' }}
                    value={newDirectMessage}
                    onChange={e => setNewDirectMessage(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleSendByUsername}
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}
                  disabled={!targetUsername.trim() || !newDirectMessage.trim()}
                >
                  Enviar Mensagem
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
