import { Code2, Compass, Users, Briefcase, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Typewriter } from '../components/Typewriter';
import './Landing.css';

export function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Compass size={32} className="text-primary-light" />,
      title: 'Meu Radar',
      description: 'Mapeie suas habilidades técnicas, visualize seu progresso e identifique lacunas no seu conhecimento com nosso radar de competências interativo.'
    },
    {
      icon: <Users size={32} className="text-secondary" />,
      title: 'Comunidade Ativa',
      description: 'Conecte-se com outros desenvolvedores, compartilhe experiências, tire dúvidas e participe de discussões técnicas de alto nível.'
    },
    {
      icon: <Briefcase size={32} className="text-accent" />,
      title: 'Mercado de Oportunidades',
      description: 'Encontre as melhores vagas alinhadas com o seu perfil técnico e nível de senioridade diretamente na plataforma.'
    }
  ];

  return (
    <div className="landing-container animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={16} className="text-primary-light" />
            <span>A plataforma definitiva para desenvolvedores</span>
          </div>
          <h1 className="hero-title">
            Eleve sua <span className="text-gradient">Carreira Tech</span><br />
            para o Próximo Nível
          </h1>
          <p className="hero-subtitle">
            DevSkills é o seu ecossistema completo para mapear competências, evoluir tecnicamente e conectar-se com as melhores oportunidades do mercado.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-large" onClick={() => navigate('/register')}>
              Começar Agora
              <ChevronRight size={20} />
            </button>
            <button className="btn btn-outline btn-large" onClick={() => navigate('/login')}>
              Já tenho uma conta
            </button>
          </div>
        </div>
        
        {/* Decorative elements for premium feel */}
        <div className="hero-glow shape-1"></div>
        <div className="hero-glow shape-2"></div>
      </section>

      {/* Features Section */}
      <section className="features-section container">
        <div className="section-header text-center">
          <h2 className="title-xl mb-4">Tudo que você precisa em um <span className="text-gradient">só lugar</span></h2>
          <p className="text-secondary max-w-2xl mx-auto">
            Combinamos ferramentas de autoavaliação, networking e busca de vagas em uma experiência única e fluida, projetada exclusivamente para profissionais de tecnologia.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={feature.title} className={`glass-card feature-card delay-${(index + 1) * 100}`}>
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section container mb-8">
        <div className="glass-panel cta-panel text-center">
          <Code2 size={48} className="mx-auto mb-4 text-primary-light" />
          <h2 className="title-xl mb-4">Pronto para transformar sua carreira?</h2>
          <p className="text-secondary mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de desenvolvedores que já estão construindo o futuro da tecnologia com o DevSkills.
          </p>
          <button className="btn btn-primary btn-large" onClick={() => navigate('/register')}>
            Criar minha conta gratuita
          </button>
        </div>
      </section>
    </div>
  );
}
