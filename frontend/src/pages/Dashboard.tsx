import { Plus, Code, Database, Server, GitBranch } from 'lucide-react';
import { Typewriter } from '../components/Typewriter';
import './Dashboard.css';

export function Dashboard() {
  const skills = [
    { name: 'React / Next.js', level: 'Senior', icon: <Code />, category: 'Frontend', progress: 90 },
    { name: 'Spring Boot 3', level: 'Mid-Level', icon: <Server />, category: 'Backend', progress: 70 },
    { name: 'PostgreSQL', level: 'Mid-Level', icon: <Database />, category: 'Database', progress: 75 },
    { name: 'Git & CI/CD', level: 'Senior', icon: <GitBranch />, category: 'DevOps', progress: 85 },
  ];

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center dashboard-header">
        <div>
          <h1 className="title-xl"><Typewriter text="Meu Radar" speed={80} /></h1>
          <p className="text-secondary">Gerencie suas competências e prepare-se para o mercado.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={20} />
          Adicionar Skill
        </button>
      </div>

      <div className="skills-grid">
        {skills.map((skill, index) => (
          <div key={skill.name} className={`glass-card skill-card delay-${(index + 1) * 100}`}>
            <div className="skill-card-header">
              <div className="skill-icon">{skill.icon}</div>
              <span className={`badge ${skill.category === 'Frontend' ? 'primary' : 'success'}`}>
                {skill.category}
              </span>
            </div>
            
            <h3 className="skill-name">{skill.name}</h3>
            
            <div className="skill-progress-container">
              <div className="flex justify-between text-muted text-sm mb-2">
                <span>Nível</span>
                <span className="font-semibold text-primary-light">{skill.level}</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${skill.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
