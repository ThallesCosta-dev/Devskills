import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  ExternalLink, 
  Search,
  GraduationCap,
  Paintbrush,
  Gamepad2,
  Sparkles,
  Wrench,
  FolderKanban,
  FileJson,
  Palette,
  Server,
  Image,
  Play,
  Coffee,
  Flame,
  Globe,
  Code2,
  Database,
  Hash,
  Cpu,
  Smartphone,
  Rocket,
  ArrowRight,
  LogIn,
  Terminal,
  Shield,
  Layers,
  Zap,
  Gem,
  Droplet,
  GitBranch,
  Bold,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { guideData } from '../data/guideData';
import { Typewriter } from '../components/Typewriter';
import './Guide.css';

const getCategoryIcon = (iconName: string) => {
  const iconProps = { className: "text-primary", size: 28 };
  switch (iconName) {
    case 'GraduationCap': return <GraduationCap {...iconProps} />;
    case 'Paintbrush': return <Paintbrush {...iconProps} />;
    case 'Gamepad2': return <Gamepad2 {...iconProps} />;
    case 'Sparkles': return <Sparkles {...iconProps} />;
    case 'Wrench': return <Wrench {...iconProps} />;
    case 'FolderKanban': return <FolderKanban {...iconProps} />;
    case 'FileJson': return <FileJson {...iconProps} />;
    case 'Palette': return <Palette {...iconProps} />;
    case 'Server': return <Server {...iconProps} />;
    case 'Image': return <Image {...iconProps} />;
    case 'Youtube': return <Play {...iconProps} />;
    case 'Coffee': return <Coffee {...iconProps} />;
    case 'Flame': return <Flame {...iconProps} />;
    case 'Globe': return <Globe {...iconProps} />;
    case 'Code2': return <Code2 {...iconProps} />;
    case 'Database': return <Database {...iconProps} />;
    case 'Hash': return <Hash {...iconProps} />;
    case 'Cpu': return <Cpu {...iconProps} />;
    case 'Smartphone': return <Smartphone {...iconProps} />;
    case 'Rocket': return <Rocket {...iconProps} />;
    case 'Terminal': return <Terminal {...iconProps} />;
    case 'Shield': return <Shield {...iconProps} />;
    case 'Layers': return <Layers {...iconProps} />;
    case 'Zap': return <Zap {...iconProps} />;
    case 'Gem': return <Gem {...iconProps} />;
    case 'Droplet': return <Droplet {...iconProps} />;
    case 'GitBranch': return <GitBranch {...iconProps} />;
    case 'Bold': return <Bold {...iconProps} />;
    default: return <BookOpen {...iconProps} />;
  }
};

export function Guide() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const isAuthenticated = !!localStorage.getItem('auth_token');

  // Filter categories
  const filteredData = guideData.map(category => {
    const filteredLinks = category.links.filter(link => 
      link.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...category, links: filteredLinks };
  }).filter(category => category.title.toLowerCase().includes(searchTerm.toLowerCase()) || category.links.length > 0);

  if (!isAuthenticated) {
    // Show beautiful premium landing page with interactive locked preview
    return (
      <div className="container guide-landing-container animate-fade-in">
        <div className="guide-hero">
          <BookOpen className="text-primary mb-6" size={64} style={{ margin: '0 auto' }} />
          <h1 className="title-xl">
            <span className="text-gradient">Hub Educacional DevSkills</span>
          </h1>
          <p className="text-secondary mt-4">
            Acesse centenas de cursos de programação gratuitos, ferramentas de desenvolvimento, e-books e roteiros de aprendizado selecionados a dedo pela comunidade para impulsionar a sua carreira.
          </p>

          <div className="guide-stats">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Links Úteis</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">20+</span>
              <span className="stat-label">Categorias Curadas</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Gratuito</span>
            </div>
          </div>
        </div>

        <div className="guide-preview-section">
          <div className="preview-overlay">
            <div className="preview-cta-card glass-card">
              <BookOpen className="text-primary mb-4" size={40} style={{ margin: '0 auto' }} />
              <h3 className="title-md mb-2">Deseja acessar a biblioteca completa?</h3>
              <p className="text-secondary text-sm mb-6">
                Junte-se à comunidade do DevSkills para liberar a busca instantânea, os links diretos de todos os cursos, livros recomendados e muito mais!
              </p>
              <div className="guide-cta-buttons">
                <Link to="/register" className="guide-cta-btn-primary">
                  Criar Conta Grátis
                  <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="guide-cta-btn-outline">
                  Fazer Login
                  <LogIn size={16} />
                </Link>
              </div>
            </div>
          </div>

          <div className="preview-grid">
            {guideData.slice(0, 4).map((category, index) => (
              <div key={index} className="guide-category-card glass-card">
                <div className="category-header">
                  <span className="category-icon">{getCategoryIcon(category.icon)}</span>
                  <h2 className="title-md">{category.title}</h2>
                </div>
                <ul className="category-links mt-4">
                  {category.links.slice(0, 3).map((link, idx) => (
                    <li key={idx}>
                      <div className="guide-link">
                        <span>{link.title}</span>
                        <ExternalLink size={14} className="external-icon" />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container guide-layout animate-fade-in">
      <div className="guide-header glass-card">
        <div className="guide-title-row">
          <BookOpen className="text-primary" size={32} />
          <h1 className="title-xl">
            <Typewriter text="Guia de Programação" speed={100} />
          </h1>
        </div>
        <p className="text-secondary mt-2" style={{ maxWidth: '700px', margin: '0 auto' }}>
          Um compilado curado dos melhores cursos, ferramentas e dicas para alavancar sua carreira na tecnologia. 
          Inspirado na comunidade open-source.
        </p>

        <div className="search-bar mt-6">
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Buscar por curso, ferramenta, linguagem..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="guide-grid mt-8">
        {filteredData.length === 0 ? (
          <div className="empty-state glass-card text-center" style={{ gridColumn: '1 / -1', padding: '3rem' }}>
            <p className="text-secondary">Nenhum resultado encontrado para "{searchTerm}"</p>
          </div>
        ) : (
          filteredData.map((category, index) => {
            const hasManyLinks = category.links.length > 8 && !searchTerm;
            const isExpanded = !!expandedCategories[index];
            const visibleLinks = hasManyLinks && !isExpanded ? category.links.slice(0, 8) : category.links;

            return (
              <div key={index} className="guide-category-card glass-card hover-glow">
                <div className="category-header">
                  <span className="category-icon">{getCategoryIcon(category.icon)}</span>
                  <h2 className="title-md">{category.title}</h2>
                </div>
                {category.description && (
                  <p className="category-description text-sm text-muted">{category.description}</p>
                )}
                <ul className="category-links mt-4">
                  {visibleLinks.map((link, idx) => (
                    <li key={idx}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="guide-link">
                        <span>{link.title}</span>
                        <ExternalLink size={14} className="external-icon" />
                      </a>
                    </li>
                  ))}
                </ul>
                {hasManyLinks && (
                  <button 
                    onClick={() => setExpandedCategories(prev => ({ ...prev, [index]: !prev[index] }))}
                    className="toggle-expand-btn"
                  >
                    {isExpanded ? (
                      <>
                        Mostrar menos <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        Mostrar mais ({category.links.length - 8} links) <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
