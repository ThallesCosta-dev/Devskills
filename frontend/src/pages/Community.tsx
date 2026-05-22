import { useState, useEffect, useMemo } from 'react';
import { MessageSquare, ArrowUpCircle, ArrowDownCircle, Trash2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { Typewriter } from '../components/Typewriter';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { getFriendlyErrorMessage } from '../utils/errorUtils';
import './Community.css';

interface Developer {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
}

export function normalizeTopicName(name: string): string {
  if (!name) return 'Geral';
  const clean = name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (clean === 'duvidas' || clean === 'duvida' || clean === 'questions' || clean === 'question') {
    return 'Dúvidas';
  }
  if (clean === 'vagas' || clean === 'vaga' || clean === 'jobs' || clean === 'job') {
    return 'Vagas';
  }
  if (clean === 'geral' || clean === 'general') {
    return 'Geral';
  }
  if (clean === 'ia' || clean === 'ai') {
    return 'IA';
  }
  
  return name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
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
        const data: Post[] = response.data.sort((a: Post, b: Post) => b.id - a.id);
        setPosts(data);
        // open comments by default for all posts
        const allOpen: Record<number, boolean> = {};
        data.forEach((p: Post) => { allOpen[p.id] = true; });
        setExpandedComments(allOpen);
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

  // Auto-load comments for all posts since they're open by default
  useEffect(() => {
    posts.forEach((p: Post) => {
      if (!comments[p.id]) {
        axios.get(`/api/comments/post/${p.id}`)
          .then(res => setComments(prev => ({ ...prev, [p.id]: res.data })))
          .catch(() => {});
      }
    });
  }, [posts]);

  const handleCreatePost = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    axios.post('/api/posts', {
      title: newTitle,
      content: newContent,
      subreddit: normalizeTopicName(newSubreddit),
      postType: 'GENERAL'
    }, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => {
        setNewTitle('');
        setNewContent('');
        fetchPosts();
        toast.success("Post criado com sucesso!");
      })
      .catch(err => toast.error("Não foi possível criar a publicação: " + getFriendlyErrorMessage(err)));
  };

  const handleDeletePost = (id: number) => {
    if (!confirm("Tem certeza que deseja apagar este post?")) return;
    axios.delete(`/api/posts/${id}`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => {
        fetchPosts();
        toast.success("Post apagado!");
      })
      .catch(err => toast.error("Não foi possível apagar a publicação: " + getFriendlyErrorMessage(err)));
  };

  const handleDeleteComment = (commentId: number, postId: number) => {
    if (!confirm("Tem certeza que deseja apagar este comentário?")) return;
    axios.delete(`/api/comments/${commentId}`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => {
        toast.success("Comentário apagado!");
        setComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).filter((c: any) => c.id !== commentId)
        }));
      })
      .catch(err => toast.error("Não foi possível apagar o comentário: " + getFriendlyErrorMessage(err)));
  };

  const [votingId, setVotingId] = useState<number | null>(null);

  const handleVote = (id: number, voteValue: number) => {
    if (votingId === id) return;
    setVotingId(id);
    axios.post(`/api/posts/${id}/vote`, { vote: voteValue }, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => fetchPosts())
      .catch(err => toast.error("Não foi possível registrar seu voto: " + getFriendlyErrorMessage(err)))
      .finally(() => setVotingId(null));
  };

  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [comments, setComments] = useState<Record<number, any[]>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<Record<number, boolean>>({});

  const toggleComments = (postId: number) => {
    const nowOpen = !expandedComments[postId];
    setExpandedComments(prev => ({ ...prev, [postId]: nowOpen }));
    if (nowOpen && !comments[postId]) {
      axios.get(`/api/comments/post/${postId}`)
        .then(res => setComments(prev => ({ ...prev, [postId]: res.data })))
        .catch(() => {});
    }
  };

  const handlePostComment = (postId: number) => {
    const text = commentText[postId]?.trim();
    if (!text || isSubmittingComment[postId]) return;
    
    setIsSubmittingComment(prev => ({ ...prev, [postId]: true }));
    axios.post('/api/comments', { content: text, post: { id: postId } },
      { headers: { Authorization: `Bearer ${authToken}` } })
      .then(res => {
        setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), res.data] }));
        setCommentText(prev => ({ ...prev, [postId]: '' }));
      })
      .catch(err => toast.error("Não foi possível adicionar o comentário: " + getFriendlyErrorMessage(err)))
      .finally(() => setIsSubmittingComment(prev => ({ ...prev, [postId]: false })));
  };

  const handleCommentVote = (commentId: number, postId: number, voteValue: number) => {
    axios.post(`/api/comments/${commentId}/vote`, { vote: voteValue }, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(res => {
        setComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).map((c: any) => c.id === commentId ? res.data : c)
        }));
      })
      .catch(() => {});
  };

  const trendingTopics = useMemo(() => {
    const rawSubreddits = posts
      .filter(p => p.postType !== 'TIMELINE' && p.subreddit && p.subreddit.trim() !== '')
      .map(p => normalizeTopicName(p.subreddit));
    
    const counts: Record<string, number> = {};
    rawSubreddits.forEach(s => counts[s] = (counts[s] || 0) + 1);
    
    const uniqueTopics = Array.from(new Set(rawSubreddits));
    return uniqueTopics.sort((a, b) => counts[b] - counts[a]);
  }, [posts]);

  const filteredPosts = posts.filter(p => {
    // Apenas posts da Comunidade (ignora TIMELINE e posts sem subreddit definido)
    if (p.postType === 'TIMELINE' || !p.subreddit || p.subreddit.trim() === '') {
      return false;
    }
    const normActive = normalizeTopicName(activeSubreddit);
    const normPostSub = normalizeTopicName(p.subreddit);
    return activeSubreddit === 'Todos' || normPostSub === normActive;
  });

  return (
    <div className="container community-layout animate-fade-in">
      <div className="community-main">
        <div className="flex justify-between items-center mb-4">
          <h1 className="title-xl"><Typewriter text="Comunidade" speed={100} /></h1>
        </div>

        <div className="topic-tabs mb-4 flex gap-2 overflow-x-auto pb-2">
          {['Todos', ...trendingTopics].map(sub => (
            <button
              key={sub}
              onClick={() => setActiveSubreddit(sub)}
              className={`badge ${activeSubreddit === sub ? 'primary' : 'secondary'} cursor-pointer`}
              style={{ padding: '8px 16px', fontSize: '14px', whiteSpace: 'nowrap' }}
            >
              {sub === 'Todos' ? 'Todos' : `t/${sub}`}
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
                placeholder="Tópico (ex: React, Dúvidas, Backend)"
                value={newSubreddit}
                onChange={e => setNewSubreddit(e.target.value.replace(/\s+/g, ''))}
              />
              <button onClick={handleCreatePost} className="btn btn-primary">Commit</button>
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
            <p className="text-muted">Nenhum post em t/{activeSubreddit}. Seja o primeiro!</p>
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
                          <span className="text-xs text-primary-light font-bold">t/{normalizeTopicName(post.subreddit) || 'Geral'}</span>
                          <span className="text-xs text-muted">• Postado por @{post.author?.username || 'user'}</span>
                        </div>
                        <h3 className="post-author font-bold text-lg mt-1">{post.title}</h3>
                      </div>
                    </div>
                    {myUserId && post.author?.id === myUserId && (
                      <button onClick={() => handleDeletePost(post.id)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }} title="Apagar Post">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <p className="post-content text-secondary">{post.content}</p>

                  <div className="post-actions border-top mt-4 pt-3 flex gap-4 items-center">
                    <button
                      onClick={() => toggleComments(post.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', color: expandedComments[post.id] ? 'var(--primary-light)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                    >
                      <MessageSquare size={16} />
                      {(comments[post.id] || []).length > 0 ? (comments[post.id] || []).length : ''} Comentários
                      {expandedComments[post.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {expandedComments[post.id] && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                      {(comments[post.id] || []).length === 0 && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '10px' }}>Nenhum comentário ainda.</p>
                      )}
                      {(comments[post.id] || []).map((c: any) => {
                          const cNet = c.upvotes - c.downvotes;
                          const cColor = cNet > 0 ? '#4ade80' : cNet < 0 ? '#f87171' : 'var(--text-muted)';
                          return (
                            <div key={c.id} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `url(${c.author?.avatarUrl}) center/cover`, backgroundColor: '#4b5563', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', flexShrink: 0 }}>
                                {!c.author?.avatarUrl && (c.author?.name || 'U').charAt(0)}
                              </div>
                              <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '6px 10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-light)', margin: 0 }}>@{c.author?.username}</p>
                                  {myUserId && c.author?.id === myUserId && (
                                    <button onClick={() => handleDeleteComment(c.id, post.id)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }} title="Apagar comentário">
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{c.content}</p>
                                {isAuthenticated && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <button onClick={() => handleCommentVote(c.id, post.id, 1)} style={{ color: cNet > 0 ? '#4ade80' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ArrowUpCircle size={13} /></button>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: cColor }}>{cNet}</span>
                                    <button onClick={() => handleCommentVote(c.id, post.id, -1)} style={{ color: cNet < 0 ? '#f87171' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ArrowDownCircle size={13} /></button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      {isAuthenticated && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', opacity: isSubmittingComment[post.id] ? 0.6 : 1 }}>
                          <input
                            type="text"
                            placeholder="Comente..."
                            className="glass-input"
                            style={{ flex: 1, padding: '6px 10px', fontSize: '13px' }}
                            value={commentText[post.id] || ''}
                            onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && handlePostComment(post.id)}
                            disabled={isSubmittingComment[post.id]}
                          />
                          <button 
                            onClick={() => handlePostComment(post.id)} 
                            className="btn btn-primary" 
                            style={{ padding: '6px 12px' }}
                            disabled={isSubmittingComment[post.id]}
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="community-sidebar glass-card">
        <h3>Tópicos Ativos</h3>
        <ul className="trending-list mt-4">
          {trendingTopics.length > 0 ? (
            trendingTopics.map(topic => (
              <li key={topic} onClick={() => setActiveSubreddit(topic)} className="cursor-pointer hover:text-primary-light">
                t/{topic}
              </li>
            ))
          ) : (
            <p className="text-muted text-sm mt-2">Nenhum tópico criado ainda.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
