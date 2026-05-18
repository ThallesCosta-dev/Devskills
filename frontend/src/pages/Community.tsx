import { useState, useEffect, useMemo } from 'react';
import { MessageSquare, ThumbsUp, Share2, Award } from 'lucide-react';
import axios from 'axios';
import { Typewriter } from '../components/Typewriter';
import './Community.css';

interface Developer {
  name: string;
}

interface Post {
  id: number;
  author?: Developer;
  content: string;
  postType: string;
}

export function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/posts')
      .then((response) => {
        setPosts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar posts do backend", error);
        setLoading(false);
      });
  }, []);

  const trendingTopics = useMemo(() => {
    const wordCounts: Record<string, number> = {};
    posts.forEach(post => {
      const words = post.content.split(/\s+/);
      words.forEach(w => {
        const word = w.toLowerCase().replace(/[^a-z0-9#]/g, '');
        if (word.length > 3) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      });
    });
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
  }, [posts]);

  return (
    <div className="container community-layout animate-fade-in">
      <div className="community-main">
        <div className="flex justify-between items-center mb-4">
          <h1 className="title-xl"><Typewriter text="Comunidade" speed={100} /></h1>
        </div>

        <div className="create-post glass-card mb-4">
          <textarea 
            placeholder="Compartilhe uma conquista, dúvida ou vaga..."
            className="post-input"
          ></textarea>
          <div className="flex justify-between items-center mt-2">
            <button className="btn btn-outline text-sm">
              <Award size={16} /> Adicionar Conquista
            </button>
            <button className="btn btn-primary">Publicar</button>
          </div>
        </div>

        <div className="feed">
          {loading ? (
            <p className="text-muted">Carregando feed...</p>
          ) : posts.length === 0 ? (
            <p className="text-muted">Seja o primeiro a postar!</p>
          ) : (
            posts.map((post, index) => (
              <div key={post.id} className={`glass-card post-card delay-${(index % 5 + 1) * 100}`}>
                <div className="post-header">
                  <div className="post-avatar">{(post.author?.name || 'D').charAt(0)}</div>
                  <div>
                    <h3 className="post-author">{post.author?.name || 'Desenvolvedor'}</h3>
                    <p className="text-sm text-muted">DevSkills Member</p>
                  </div>
                  {post.postType === 'JOB_POSTING' && (
                    <span className="badge success ml-auto">VAGA</span>
                  )}
                </div>
                
                <p className="post-content">{post.content}</p>
                
                <div className="post-actions border-top">
                  <button className="action-btn">
                    <ThumbsUp size={18} /> 0
                  </button>
                  <button className="action-btn">
                    <MessageSquare size={18} /> 0
                  </button>
                  <button className="action-btn">
                    <Share2 size={18} /> 0
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="community-sidebar glass-card">
        <h3>Em Alta na Comunidade</h3>
        <ul className="trending-list">
          {trendingTopics.length > 0 ? (
            trendingTopics.map(topic => (
              <li key={topic}>#{topic}</li>
            ))
          ) : (
            <>
              <li>#SpringBoot3</li>
              <li>#Nextjs14</li>
              <li>#VagasRemotas</li>
              <li>#CleanCode</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
