import { useState, useMemo, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Monitor, List, Upload, ChevronDown, Volume2 } from 'lucide-react'
import { useTimer } from './hooks/useTimer'
import scriptA from './data/scriptA.json'
import scriptB from './data/scriptB.json'
import scriptC from './data/scriptC.json'
import './App.css'

interface ScriptSegment {
  id: string
  startTime: number
  endTime: number
  title: string
  content?: string
  prompt?: string
  audio?: string
  text: string
  visuals?: string
  instructions?: string[]
}

interface VideoScript {
  title: string
  totalDuration: number
  segments: ScriptSegment[]
}

const SCRIPTS: Record<string, VideoScript> = {
  variantA: scriptA as VideoScript,
  variantB: scriptB as VideoScript,
  variantC: scriptC as VideoScript
}

function App() {
  const [activeScriptId, setActiveScriptId] = useState('variantA')
  const [script, setScript] = useState<VideoScript>(SCRIPTS.variantA)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')

  const { currentTime, isActive, start, pause, reset: originalReset, seek, formatTime } = useTimer(script.totalDuration)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const scriptTextRef = useRef<HTMLDivElement>(null)
  const scrolledSegmentsRef = useRef<Set<string>>(new Set())

  const reset = () => {
    originalReset()
    setAudioPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const currentSegment = useMemo(() => {
    return script.segments.find(s => currentTime >= s.startTime && currentTime < s.endTime)
      || script.segments[script.segments.length - 1]
  }, [script.segments, currentTime])

  const nextSegment = useMemo(() => {
    const currentIndex = script.segments.findIndex(s => s.id === currentSegment?.id)
    return script.segments[currentIndex + 1] || null
  }, [script.segments, currentSegment])

  const timeRemainingInSegment = currentSegment ? currentSegment.endTime - currentTime : 0
  const isEndingSoon = timeRemainingInSegment <= 5 && timeRemainingInSegment > 0

  const getDynamicFontSize = (text: string) => {
    const length = text.length
    if (length < 100) return '4.2rem'
    if (length < 250) return '3.6rem'
    if (length < 500) return '2.8rem'
    return '2.2rem'
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        isActive ? pause() : start()
      }
      if (e.code === 'KeyR') {
        reset()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, start, pause, reset])

  // Auto-scroll logic: trigger one time in the middle of timeframe
  useEffect(() => {
    if (scriptTextRef.current && currentSegment && isActive) {
      const { scrollHeight, clientHeight } = scriptTextRef.current
      if (scrollHeight > clientHeight && !scrolledSegmentsRef.current.has(currentSegment.id)) {
        const segmentDuration = currentSegment.endTime - currentSegment.startTime
        const midpoint = currentSegment.startTime + (segmentDuration / 2)

        // Trigger scroll if we reach the midpoint
        if (currentTime >= midpoint) {
          scriptTextRef.current.scrollTo({
            top: scrollHeight - clientHeight,
            behavior: 'smooth'
          })
          scrolledSegmentsRef.current.add(currentSegment.id)
        }
      }
    }
  }, [currentTime, currentSegment, isActive])

  // Reset scroll and tracking on segment change
  useEffect(() => {
    if (scriptTextRef.current) {
      scriptTextRef.current.scrollTop = 0
    }
    scrolledSegmentsRef.current.clear()

    // Stop audio when segment changes to keep it in sync with user's view
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setAudioPlaying(false)
    }
  }, [currentSegment?.id])

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText)
      setScript(parsed)
      setActiveScriptId('custom')
      setShowImport(false)
      reset()
    } catch (e) {
      alert('Invalid JSON format')
    }
  }

  const handleScriptChange = (id: string) => {
    setActiveScriptId(id)
    setScript(SCRIPTS[id])
    reset()
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header glass-card">
        <div className="timer-group">
          <div className={`timer-display ${isEndingSoon ? 'warning-pulse' : ''}`}>
            {formatTime(currentTime)}
          </div>
          <div className="controls">
            <button className={`btn ${isActive ? '' : 'btn-primary'}`} onClick={isActive ? pause : start}>
              {isActive ? <Pause size={20} /> : <Play size={20} />}
              {isActive ? 'Pause' : 'Start'}
            </button>
            <button className="btn" onClick={reset}>
              <RotateCcw size={20} />
              Reset
            </button>
          </div>
        </div>

        <div className="script-selector-container">
          <div className="selector-wrapper">
            <select
              value={activeScriptId}
              onChange={(e) => handleScriptChange(e.target.value)}
              className="script-select"
            >
              <option value="variantA">Variant A: The Pitch</option>
              <option value="variantB">Variant B: The Tour</option>
              <option value="variantC">Variant C: The Challenge</option>
              {activeScriptId === 'custom' && <option value="custom">Custom Import</option>}
            </select>
            <ChevronDown size={16} className="selector-icon" />
          </div>

          <div className="script-info">
            <h1 className="script-title">{script.title}</h1>
            <p className="script-meta">
              Total: {formatTime(script.totalDuration)}
            </p>
          </div>
        </div>

        <button className="btn" onClick={() => setShowImport(!showImport)}>
          <Upload size={18} />
          Import
        </button>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {showImport ? (
          <div className="teleprompter glass-card">
            <h2 style={{ marginBottom: '20px' }}>Import Script (JSON)</h2>
            <textarea
              className="script-input"
              placeholder="Paste your JSON script here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" onClick={handleImport}>Load Script</button>
              <button className="btn" onClick={() => setShowImport(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="teleprompter glass-card">
            {currentSegment && (
              <div className="teleprompter-inner">
                <span className="segment-title">{currentSegment.title}</span>
                <div
                  ref={scriptTextRef}
                  className="script-text"
                  style={{ fontSize: getDynamicFontSize(currentSegment.text) }}
                >
                  {currentSegment.text.split(/(\[.*?\]|\n?[A-Z][\w\s/()]*:)/).map((part, i) => {
                    const trimmed = part.trim()
                    if (!trimmed) return null

                    if (part.startsWith('[') && part.endsWith(']')) {
                      return <span key={i} className="stage-direction">{part}</span>
                    }
                    if (part.trim().endsWith(':') && !part.includes('"')) {
                      return <span key={i} className="speaker-label">{part}</span>
                    }
                    // For spoken text, we preserve the part but trim excess outer newlines
                    // to avoid gaps between block elements
                    return <span key={i} className="spoken-text">{part.replace(/^\n+/, '').replace(/\n+$/, '')}</span>
                  })}
                </div>
                {currentSegment.visuals && (
                  <div className="visual-hint">
                    <Monitor size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    {currentSegment.visuals}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="cue-card glass-card">
          <h3><List size={18} /> Current Cues</h3>
          {currentSegment?.content && (
            <div className="segment-content-summary">
              {currentSegment.content}
            </div>
          )}
          {currentSegment?.prompt && (
            <div className="voice-prompt-cue">
              <span className="voice-prompt-label">Delivery Note:</span>
              <p className="voice-prompt-text">{currentSegment.prompt}</p>
            </div>
          )}

          {currentSegment?.audio && (
            <div className="audio-cue-section">
              <div className="audio-btns-row">
                <button
                  className={`audio-play-btn ${audioPlaying ? 'playing' : ''}`}
                  onClick={() => {
                    const audioPath = `/audio/${currentSegment.audio}.wav`

                    // If we already have an audio object but it's for a different path, pause and recreate
                    if (audioRef.current && !audioRef.current.src.endsWith(audioPath)) {
                      audioRef.current.pause()
                      audioRef.current = null
                    }

                    if (!audioRef.current) {
                      audioRef.current = new Audio(audioPath)
                      audioRef.current.onended = () => setAudioPlaying(false)
                    }

                    if (audioPlaying) {
                      audioRef.current.pause()
                      setAudioPlaying(false)
                    } else {
                      audioRef.current.play()
                      setAudioPlaying(true)
                    }
                  }}
                >
                  <Volume2 size={16} />
                  {audioPlaying ? 'Stop' : 'Play Reference'}
                </button>

                {audioRef.current && (
                  <button
                    className="audio-restart-btn"
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = 0
                        audioRef.current.play()
                        setAudioPlaying(true)
                      }
                    }}
                    title="Restart Audio"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          <ul className="instruction-list">
            {currentSegment?.instructions?.map((inst, i) => (
              <li key={i} className="instruction-item">{inst}</li>
            ))}
          </ul>
        </div>

        {nextSegment && (
          <div className="next-scene-preview glass-card">
            <h4>Next Scene</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="next-title">{nextSegment.title}</span>
              <span style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>
                {formatTime(nextSegment.startTime)}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
              {nextSegment.text.substring(0, 80)}...
            </p>
          </div>
        )}
      </aside>

      {/* Footer Timeline */}
      <footer className="footer">
        <div className="timeline">
          {script.segments.map((seg) => {
            const width = ((seg.endTime - seg.startTime) / script.totalDuration) * 100
            const left = (seg.startTime / script.totalDuration) * 100
            const isCurrent = currentTime >= seg.startTime && currentTime < seg.endTime

            return (
              <div
                key={seg.id}
                className={`timeline-segment ${isCurrent ? 'active' : ''}`}
                style={{
                  width: `${width}%`,
                  position: 'absolute',
                  left: `${left}%`
                }}
                onClick={() => seek(seg.startTime)}
                title={seg.title}
              />
            )
          })}
          <div
            className="timeline-marker"
            style={{ left: `${(currentTime / script.totalDuration) * 100}%` }}
          />
        </div>
      </footer>
    </div>
  )
}

export default App
