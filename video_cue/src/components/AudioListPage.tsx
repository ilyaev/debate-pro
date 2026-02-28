import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

const AUDIO_FILES = [
  'scriptA/pitch_start.wav',
  'scriptA/pitch_goon.wav'
];

export function AudioListPage() {
  const [playingFile, setPlayingFile] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = (file: string) => {
    // If the same file is clicked, stop it
    if (playingFile === file) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingFile(null);
    } else {
      // Stop currently playing file if any
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // Play new file
      const audio = new Audio(`/audio/${file}`);
      audioRef.current = audio;
      audio.play().catch(e => console.error("Error playing audio:", e));
      audio.onended = () => setPlayingFile(null);
      setPlayingFile(file);
    }
  };

  return (
    <div style={{ paddingBottom: '40px', width: '100%' }}>
      <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-primary)', fontSize: '1.5rem', position: 'sticky', top: 0, background: 'var(--bg-color)', zIndex: 10, padding: '10px 0' }}>
        <Volume2 size={24} color="var(--accent-teal)" />
        Audio Files
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {AUDIO_FILES.map((file) => (
          <div 
            key={file}
            className="glass-card"
            style={{ 
              padding: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: playingFile === file ? 'rgba(0, 242, 254, 0.05)' : 'rgba(255, 255, 255, 0.02)',
              borderColor: playingFile === file ? 'var(--accent-teal)' : 'var(--glass-border)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, marginRight: '15px' }}>
              <span style={{ 
                fontFamily: 'monospace', 
                fontSize: '1rem', 
                color: playingFile === file ? 'var(--accent-teal)' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%'
              }}>
                {file.replace('scriptA/', '')}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
                 scriptA
              </span>
            </div>
            
            <button
              onClick={() => handlePlay(file)}
              className="btn"
              style={{
                borderRadius: '50%',
                padding: '0',
                width: '48px',
                height: '48px',
                minWidth: '48px', // Prevent shrinking
                background: playingFile === file ? 'var(--danger)' : 'var(--accent-teal)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title={playingFile === file ? "Stop" : "Play"}
            >
              {playingFile === file ? (
                <Pause size={24} fill="white" stroke="white" />
              ) : (
                <Play size={24} fill="white" stroke="white" style={{ marginLeft: '4px' }} />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
