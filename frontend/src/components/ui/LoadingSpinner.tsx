import './LoadingSpinner.css';

export function LoadingSpinner({ text = "Carregando..." }: { text?: string }) {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">{text}</p>
    </div>
  );
}
