import { useState, useEffect, useRef } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Trash2, Image as ImageIcon, AtSign, Send } from 'lucide-react';
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
  const authToken = localStorage.getItem('auth_token');
  const isAuthenticated = !!authToken;
  const myUserId = localStorage.getItem('user_id');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder: 'Comece uma publicação...',
      }),
    ],
    content: '',
  });

  const fetchPosts = () => {
    setLoading(true);
    axios.get('/api/posts')
      .then((res) => {
        const timelinePosts = res.data.filter((p: any) => p.postType === 'TIMELINE');
        // Sort by net votes (upvotes - downvotes) descending
        setPosts(timelinePosts.sort((a: any, b: any) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = () => {
    if (!editor || editor.isEmpty) return;
    const content = editor.getHTML();

    axios.post('/api/posts', {
      title: 'Timeline Post',
      content: content,
      subreddit: '', // Empty for timeline
      postType: 'TIMELINE'
    }, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => {
        editor.commands.setContent('');
        fetchPosts();
      })
      .catch(err => toast.error("Erro ao criar post: " + err.message));
  };

  const handleDelete = (id: number) => {
    if (!confirm("Apagar postagem?")) return;
    axios.delete(`/api/posts/${id}`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => toast.success("Post apagado!"))
      .catch(err => toast.error("Erro: " + err.message));
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

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {isAuthenticated && (
        <div className="glass-card mb-6 p-4">
          <div className="flex gap-4">
            <div className="profile-avatar-small" style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#2d3748', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Me
            </div>
            <div className="flex-1 tiptap-editor-wrapper">
              <EditorContent editor={editor} className="tiptap-content glass-input" style={{ minHeight: '80px', padding: '12px' }} />

              <div className="flex justify-between items-center mt-3 pt-3 border-top">
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-outline flex items-center gap-1 text-sm py-1 px-3"
                  >
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

      <div className="feed-posts">
        {loading ? <LoadingSpinner text="Carregando feed..." /> : null}
        {posts.map(post => (
          <div key={post.id} className="glass-card mb-4 p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3 items-center">
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `url(${post.author?.avatarUrl}) center/cover`, backgroundColor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {!post.author?.avatarUrl && (post.author?.name || 'U').charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold">{post.author?.name || 'Usuário'}</h4>
                  <p className="text-xs text-muted">@{post.author?.username}</p>
                </div>
              </div>
              {myUserId && post.author?.id === myUserId && (
                <button onClick={() => handleDelete(post.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="post-html-content mb-4" dangerouslySetInnerHTML={{ __html: post.content }}></div>

            <div className="flex items-center gap-6 border-top pt-3">
              <div className="flex items-center gap-2">
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
                        <ArrowUpCircle size={22} />
                      </button>
                      <span className="font-bold" style={{ color, minWidth: '24px', textAlign: 'center', transition: 'color 0.2s' }}>{net}</span>
                      <button
                        onClick={() => handleVote(post.id, -1)}
                        disabled={spinning}
                        style={{ color: net < 0 ? '#f87171' : 'var(--text-muted)', transition: 'color 0.2s', opacity: spinning ? 0.5 : 1 }}
                        className="transition-all hover:scale-110"
                      >
                        <ArrowDownCircle size={22} />
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
