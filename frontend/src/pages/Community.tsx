import { useState, useEffect, useMemo } from 'react';
import { MessageSquare, ArrowUpCircle, ArrowDownCircle, Trash2, Edit2 } from 'lucide-react';
import axios from 'axios';
import { Typewriter } from '../components/Typewriter';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import './Community.css';

interface Developer {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
}

interface Post {
  id: number;
  author: Developer;
  title: string;
  content: string;
  subreddit: string;
  postType: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubreddit, setActiveSubreddit] = useState('Geral');
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSubreddit, setNewSubreddit] = useState('Geral');

  const authToken = localStorage.getItem('auth_token');
  const isAuthenticated = !!authToken;
  const myUserId = localStorage.getItem('user_id'); // We'll need to know our own ID to show the Delete button

  const fetchPosts = () => {
    setLoading(true);
    axios.get('/api/posts')
      .then((response) => {
        setPosts(response.data.sort((a: Post, b: Post) => b.id - a.id));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar posts do backend", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    
    axios.post('/api/posts', {
      title: newTitle,
      content: newContent,
      subreddit: newSubreddit,
      postType: 'GENERAL'
    }, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => {
        setNewTitle('');
        setNewContent('');
        fetchPosts();
        toast.success("Post criado com sucesso!");
      })
      .catch(err => toast.error("Erro ao criar post: " + err.message));
  };

  const handleDeletePost = (id: number) => {
    if (!confirm("Tem certeza que deseja apagar este post?")) return;
    axios.delete(`/api/posts/${id}`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => {
        fetchPosts();
        toast.success("Post apagado!");
      })
      .catch(err => toast.error("Erro ao apagar: " + err.message));
  };

  const [votingId, setVotingId] = useState<number | null>(null);

  const handleVote = (id: number, voteValue: number) => {
    if (votingId === id) return;
    setVotingId(id);
    axios.post(`/api/posts/${id}/vote`, { vote: voteValue }, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => fetchPosts())
      .catch(err => toast.error("Erro ao votar: " + err.message))
      .finally(() => setVotingId(null));
  };

  const trendingTopics = useMemo(() => {
    const subreddits = posts.map(p => p.subreddit).filter(Boolean);
    const counts: Record<string, number> = {};
    subreddits.forEach(s => counts[s] = (counts[s] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(e => e[0]);
  }, [posts]);

  const filteredPosts = posts.filter(p => activeSubreddit === 'Todos' || p.subreddit === activeSubreddit);

  return (
    <div className="container community-layout animate-fade-in">
      <div className="community-main">
        <div className="flex justify-between items-center mb-4">
          <h1 className="title-xl"><Typewriter text="Comunidade" speed={100} /></h1>
        </div>

        <div className="subreddit-tabs mb-4 flex gap-2 overflow-x-auto pb-2">
          {['Todos', ...trendingTopics].map(sub => (
            <button 
              key={sub} 
              onClick={() => setActiveSubreddit(sub)}
              className={`badge ${activeSubreddit === sub ? 'primary' : 'secondary'} cursor-pointer`}
              style={{ padding: '8px 16px', fontSize: '14px', whiteSpace: 'nowrap' }}
            >
              {sub === 'Todos' ? 'Todos' : `s/${sub}`}
            </button>
          ))}
        </div>

        {isAuthenticated ? (
          <div className="create-post glass-card mb-6">
            <input 
              type="text" 
              placeholder="Título do post..." 
              className="glass-input w-full mb-2" 
              value={newTitle} 
              onChange={e => setNewTitle(e.target.value)} 
            />
            <textarea 
              placeholder="No que você está trabalhando ou qual a sua dúvida?"
              className="glass-input w-full mb-2"
              style={{ minHeight: '80px', resize: 'vertical', maxWidth: '100%', boxSizing: 'border-box', wordBreak: 'break-word' }}
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
            ></textarea>
            <div className="flex justify-between items-center mt-2">
              <input 
                type="text"
                className="glass-input" 
                placeholder="Subreddit (ex: React)"
                value={newSubreddit} 
                onChange={e => setNewSubreddit(e.target.value.replace(/\s+/g, ''))}
              />
              <button onClick={handleCreatePost} className="btn btn-primary">Publicar (Commit)</button>
            </div>
          </div>
        ) : (
          <div className="glass-card mb-6 p-6 text-center text-muted">
            <p>Faça login para participar das discussões da comunidade.</p>
          </div>
        )}

        <div className="feed">
          {loading ? (
            <LoadingSpinner text="Carregando fórum..." />
          ) : filteredPosts.length === 0 ? (
            <p className="text-muted">Nenhum post em s/{activeSubreddit}. Seja o primeiro!</p>
          ) : (
            filteredPosts.map((post, index) => (
              <div key={post.id} className={`glass-card post-card delay-${(index % 5 + 1) * 100} flex gap-4`}>
                
                {/* Karma Column */}
                <div className="flex flex-col items-center justify-start gap-1 pt-2" style={{ minWidth: '36px' }}>
                  {(() => {
                    const net = post.upvotes - post.downvotes;
                    const color = net > 0 ? '#4ade80' : net < 0 ? '#f87171' : 'var(--text-muted)';
                    const spinning = votingId === post.id;
                    return (
                      <>
                        <button
                          onClick={() => handleVote(post.id, 1)}
                          disabled={spinning}
                          style={{ color: net > 0 ? '#4ade80' : 'var(--text-muted)', transition: 'color 0.2s', opacity: spinning ? 0.5 : 1 }}
                          className="transition-all hover:scale-110"
                        >
                          <ArrowUpCircle size={24} />
                        </button>
                        <span className="font-bold text-lg" style={{ color, minWidth: '20px', textAlign: 'center', transition: 'color 0.2s' }}>{net}</span>
                        <button
                          onClick={() => handleVote(post.id, -1)}
                          disabled={spinning}
                          style={{ color: net < 0 ? '#f87171' : 'var(--text-muted)', transition: 'color 0.2s', opacity: spinning ? 0.5 : 1 }}
                          className="transition-all hover:scale-110"
                        >
                          <ArrowDownCircle size={24} />
                        </button>
                      </>
                    );
                  })()}
                </div>

                <div className="flex-1">
                  <div className="post-header mb-2 flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="post-avatar" style={{ width: '32px', height: '32px', fontSize: '14px', backgroundImage: post.author?.avatarUrl ? `url(${post.author.avatarUrl})` : 'none', backgroundSize: 'cover' }}>
                        {!post.author?.avatarUrl && (post.author?.name || 'D').charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-primary-light font-bold">s/{post.subreddit || 'Geral'}</span>
                          <span className="text-xs text-muted">• Postado por @{post.author?.username || 'user'}</span>
                        </div>
                        <h3 className="post-author font-bold text-lg mt-1">{post.title}</h3>
                      </div>
                    </div>
                    {myUserId && post.author?.id === myUserId && (
                      <button onClick={() => handleDeletePost(post.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <p className="post-content text-secondary">{post.content}</p>
                  
                  <div className="post-actions border-top mt-4 pt-3 flex gap-4">
                    <button className="action-btn text-sm flex items-center gap-1">
                      <MessageSquare size={16} /> Comentar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="community-sidebar glass-card">
        <h3>Subreddits Ativos</h3>
        <ul className="trending-list mt-4">
          {trendingTopics.length > 0 ? (
            trendingTopics.map(topic => (
              <li key={topic} onClick={() => setActiveSubreddit(topic)} className="cursor-pointer hover:text-primary-light">
                s/{topic}
              </li>
            ))
          ) : (
            <p className="text-muted text-sm mt-2">Nenhum subreddit criado ainda.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
