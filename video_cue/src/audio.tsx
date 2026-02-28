import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AudioListPage } from './components/AudioListPage.tsx'

function AudioApp() {
  useEffect(() => {
    // Enable scrolling on the body for this page
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

  return (
    <div className="audio-app-container" style={{ padding: '20px', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <AudioListPage />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AudioApp />
  </StrictMode>,
)
