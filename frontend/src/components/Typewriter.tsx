import { useState, useEffect } from 'react';
import './Typewriter.css';

interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
}

export function Typewriter({ text, speed = 100, className = '' }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    
    const intervalId = setInterval(() => {
      if (i < text.length) {
        i++;
        setDisplayedText(text.slice(0, i));
      } else {
        clearInterval(intervalId);
      }
    }, speed);
    
    return () => clearInterval(intervalId);
  }, [text, speed]);

  return (
    <span className={`typewriter ${className}`}>
      {displayedText}
      <span className="cursor"></span>
    </span>
  );
}
