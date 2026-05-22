import { useState, useEffect, useRef } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Trash2, Image as ImageIcon, AtSign, Send, MessageSquare, Repeat2, X, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { toast } from 'react-hot-toast';
import { uploadImageToSupabase } from '../utils/uploadImage';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import './Timeline.css';

export function Timeline() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<number | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [comments, setComments] = useState<Record<number, any[]>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<Record<number, boolean>>({});
  const [resharePost, setResharePost] = useState<any | null>(null);

  const authToken = localStorage.getItem('auth_token');
  const isAuthenticated = !!authToken;
  const myUserId = localStorage.getItem('user_id');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({ placeholder: 'Comece uma publicação...' }),
    ],
    content: '',
  });

  const reviewEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Adicione seu comentário sobre este post...' }),
    ],
    content: '',
  });

  const fetchPosts = () => {
    setLoading(true);
    axios.get('/api/posts')
      .then((res) => {
        const timelinePosts = res.data.filter((p: any) => p.postType === 'TIMELINE');
        setPosts(timelinePosts.sort((a: any, b: any) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)));
        setLoading(false);
      })
      .catch((err) => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchPosts(); }, []);

  // Pre-fetch comments to make them appear instantly
  useEffect(() => {
    posts.forEach((p: any) => {
      if (!comments[p.id]) {
        axios.get(`/api/comments/post/${p.id}`)
          .then(res => setComments(prev => ({ ...prev, [p.id]: res.data })))
          .catch(() => {});
      }
    });
  }, [posts]);

  const handlePost = () => {
    if (!editor || editor.isEmpty) return;
    const content = editor.getHTML();
    axios.post('/api/posts', { title: 'Timeline Post', content, subreddit: '', postType: 'TIMELINE' },
      { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => { editor.commands.setContent(''); fetchPosts(); })
      .catch(err => toast.error("Erro ao criar post: " + err.message));
  };

  const handleDelete = (id: number) => {
    if (!confirm("Apagar postagem?")) return;
    axios.delete(`/api/posts/${id}`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => { toast.success("Post apagado!"); fetchPosts(); })
      .catch(err => toast.error("Erro: " + err.message));
  };

  const handleDeleteComment = (commentId: number, postId: number) => {
    if (!confirm("Apagar comentário?")) return;
    axios.delete(`/api/comments/${commentId}`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => {
        toast.success("Comentário apagado!");
        setComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).filter((c: any) => c.id !== commentId)
        }));
      })
      .catch(err => toast.error("Erro ao apagar comentário: " + err.message));
  };

  const handleVote = (id: number, voteValue: number) => {
    if (votingId === id) return;
    setVotingId(id);
    axios.post(`/api/posts/${id}/vote`, { vote: voteValue }, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => fetchPosts())
      .catch(err => toast.error("Erro ao votar: " + err.message))
      .finally(() => setVotingId(null));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.loading("Enviando imagem...", { id: 'upload' });
    const url = await uploadImageToSupabase(file, 'timeline_images');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
      toast.success("Imagem adicionada!", { id: 'upload' });
    } else {
      toast.error("Falha ao enviar imagem.", { id: 'upload' });
    }
  };

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
      .catch(err => toast.error("Erro ao comentar: " + err.message))
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

  const handleReshare = () => {
    if (!reviewEditor || reviewEditor.isEmpty || !resharePost) return;
    const reshareContent = `
      <blockquote style="border-left: 3px solid var(--primary); padding-left: 12px; margin-bottom: 12px; opacity: 0.8;">
        <strong>@${resharePost.author?.username}</strong> publicou:<br/>
        ${resharePost.content}
      </blockquote>
      ${reviewEditor.getHTML()}
    `;
    axios.post('/api/posts', { title: 'Reshare', content: reshareContent, subreddit: '', postType: 'TIMELINE' },
      { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => {
        reviewEditor.commands.setContent('');
        setResharePost(null);
        fetchPosts();
        toast.success("Reshare publicado!");
      })
      .catch(err => toast.error("Erro: " + err.message));
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* New post editor */}
      {isAuthenticated && (
        <div className="glass-card mb-6 p-4">
          <div className="flex gap-4">
            <div className="profile-avatar-small" style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#2d3748', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              Me
            </div>
            <div className="flex-1 tiptap-editor-wrapper">
              <EditorContent editor={editor} className="tiptap-content glass-input" style={{ minHeight: '80px', padding: '12px' }} />
              <div className="flex justify-between items-center mt-3 pt-3 border-top">
                <div className="flex gap-2">
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="btn btn-outline flex items-center gap-1 text-sm py-1 px-3">
                    <ImageIcon size={16} /> Foto
                  </button>
                  <button className="btn btn-outline flex items-center gap-1 text-sm py-1 px-3" onClick={() => toast('Digite @ no editor para marcar alguém!', { icon: '💡' })}>
                    <AtSign size={16} /> Marcar
                  </button>
                </div>
                <button onClick={handlePost} className="btn btn-primary flex items-center gap-2">
                  <Send size={16} /> Publicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isAuthenticated && (
        <div className="glass-card mb-6 p-6 text-center text-muted">
          <p>Você precisa estar logado para publicar na timeline.</p>
        </div>
      )}

      {/* Post Review modal */}
      {resharePost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '24px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Repeat2 size={20} style={{ color: 'var(--secondary)' }} /> Reshare
              </h3>
              <button onClick={() => setResharePost(null)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '12px', marginBottom: '16px', opacity: 0.8 }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <strong style={{ color: 'var(--primary-light)' }}>@{resharePost.author?.username}</strong> publicou:
              </p>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: resharePost.content }} />
            </div>
            <div className="tiptap-editor-wrapper">
              <EditorContent editor={reviewEditor} className="tiptap-content glass-input" style={{ minHeight: '100px', padding: '12px', marginBottom: '12px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setResharePost(null)} className="btn btn-outline">Cancelar</button>
              <button onClick={handleReshare} className="btn btn-primary flex items-center gap-2">
                <Repeat2 size={16} /> Publicar Reshare
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="feed-posts">
        {loading ? <LoadingSpinner text="Carregando feed..." /> : null}
        {posts.map(post => {
          const net = post.upvotes - post.downvotes;
          const color = net > 0 ? '#4ade80' : net < 0 ? '#f87171' : 'var(--text-muted)';
          const spinning = votingId === post.id;
          const showComments = expandedComments[post.id];
          const postComments = comments[post.id] || [];

          return (
            <div key={post.id} className="glass-card mb-4 p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: `url(${post.author?.avatarUrl}) center/cover`, backgroundColor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                    {!post.author?.avatarUrl && (post.author?.name || 'U').charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold">{post.author?.name || 'Usuário'}</h4>
                    <p className="text-xs text-muted">@{post.author?.username}</p>
                  </div>
                </div>
                {myUserId && post.author?.id === myUserId && (
                  <button onClick={() => handleDelete(post.id)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="post-html-content mb-4" dangerouslySetInnerHTML={{ __html: post.content }}></div>

              {/* Actions row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px', flexWrap: 'wrap' }}>
                {/* Votes */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={() => handleVote(post.id, 1)} disabled={spinning} style={{ color: net > 0 ? '#4ade80' : 'var(--text-muted)', opacity: spinning ? 0.5 : 1, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }} className="hover-scale">
                    <ArrowUpCircle size={22} />
                  </button>
                  <span style={{ fontWeight: 700, color, minWidth: '24px', textAlign: 'center' }}>{net}</span>
                  <button onClick={() => handleVote(post.id, -1)} disabled={spinning} style={{ color: net < 0 ? '#f87171' : 'var(--text-muted)', opacity: spinning ? 0.5 : 1, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }} className="hover-scale">
                    <ArrowDownCircle size={22} />
                  </button>
                </div>

                {/* Comments */}
                <button
                  onClick={() => toggleComments(post.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: showComments ? 'var(--primary-light)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                >
                  <MessageSquare size={18} />
                  {postComments.length > 0 ? postComments.length : ''} Comentários
                  {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* Reshare */}
                {isAuthenticated && (
                  <button
                    onClick={() => setResharePost(post)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--secondary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', marginLeft: 'auto' }}
                    title="Reshare"
                  >
                    <Repeat2 size={18} /> Reshare
                  </button>
                )}
              </div>

              {/* Comments section */}
              {showComments && (
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                  {postComments.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>Nenhum comentário ainda. Seja o primeiro!</p>}
                  {postComments.map((c: any) => {
                    const cNet = c.upvotes - c.downvotes;
                    const cColor = cNet > 0 ? '#4ade80' : cNet < 0 ? '#f87171' : 'var(--text-muted)';
                    return (
                      <div key={c.id} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `url(${c.author?.avatarUrl}) center/cover`, backgroundColor: '#4b5563', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', flexShrink: 0 }}>
                          {!c.author?.avatarUrl && (c.author?.name || 'U').charAt(0)}
                        </div>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px 12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-light)', margin: 0 }}>@{c.author?.username}</p>
                            {myUserId && c.author?.id === myUserId && (
                              <button onClick={() => handleDeleteComment(c.id, post.id)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }} title="Apagar comentário">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{c.content}</p>
                          {isAuthenticated && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button onClick={() => handleCommentVote(c.id, post.id, 1)} style={{ color: cNet > 0 ? '#4ade80' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ArrowUpCircle size={14} /></button>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: cColor }}>{cNet}</span>
                              <button onClick={() => handleCommentVote(c.id, post.id, -1)} style={{ color: cNet < 0 ? '#f87171' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ArrowDownCircle size={14} /></button>
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
                        placeholder="Escreva um comentário..."
                        className="glass-input"
                        style={{ flex: 1, padding: '8px 12px', fontSize: '14px' }}
                        value={commentText[post.id] || ''}
                        onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handlePostComment(post.id)}
                        disabled={isSubmittingComment[post.id]}
                      />
                      <button 
                        onClick={() => handlePostComment(post.id)} 
                        className="btn btn-primary" 
                        style={{ padding: '8px 14px' }}
                        disabled={isSubmittingComment[post.id]}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
