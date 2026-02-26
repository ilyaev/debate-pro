import { useEffect, useState, useRef, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAudio } from './useAudio';
import type { SessionReport, MetricSnapshot, TranscriptCue, SessionStatus, ServerMessage } from '../types';
import { SESSION_LIMIT_SECONDS } from '../config';

interface UseSessionLogicReturn {
    status: SessionStatus;
    metrics: MetricSnapshot | null;
    cues: TranscriptCue[];
    elapsed: number;
    isConnected: boolean;
    handleEnd: () => void;
    userAnalyserRef: React.RefObject<AnalyserNode | null>;
    aiAnalyserRef: React.RefObject<AnalyserNode | null>;
    feedEndRef: React.RefObject<HTMLDivElement | null>;
}

export function useSessionLogic(
    mode: string,
    userId: string,
    onEnd: (report: SessionReport) => void
): UseSessionLogicReturn {
    const { connect, disconnect, sendBinary, sendJSON, isConnected } = useWebSocket(mode, userId);
    const { initPlayback, startCapture, stopCapture, playChunk, handleInterrupt, userAnalyserRef, aiAnalyserRef } = useAudio(sendBinary);

    const [metrics, setMetrics] = useState<MetricSnapshot | null>(null);
    const [cues, setCues] = useState<TranscriptCue[]>([]);
    const [elapsed, setElapsed] = useState(0);
    const [status, setStatus] = useState<SessionStatus>('connecting');

    const timerRef = useRef<number | null>(null);
    const endingRef = useRef(false);
    const feedEndRef = useRef<HTMLDivElement | null>(null);

    // Stable ref for onEnd to avoid stale closures
    const onEndRef = useRef(onEnd);
    onEndRef.current = onEnd;

    const handleEnd = useCallback(() => {
        if (endingRef.current) return;
        console.log('⏹️ [Session] Ending session...');
        stopCapture();
        if (timerRef.current) clearInterval(timerRef.current);
        sendJSON({ type: 'end_session' });
        setStatus('ending');
    }, [stopCapture, sendJSON]);

    // WebSocket connection + message dispatcher
    useEffect(() => {
        console.log('🔌 [Session] Connecting to WebSocket...');
        const ws = connect();

        ws.onmessage = (event: MessageEvent) => {
            if (event.data instanceof ArrayBuffer) {
                console.log(`🔊 [Session] ← audio chunk: ${event.data.byteLength} bytes`);
                setStatus('speaking');
                playChunk(event.data);
                return;
            }

            const msg: ServerMessage = JSON.parse(event.data as string);
            console.log(`📩 [Session] ← ${msg.type}`, msg.type === 'transcript_cue' ? msg.text.slice(0, 80) : '');

            switch (msg.type) {
                case 'session_started':
                    console.log(`✅ [Session] Session started: ${msg.sessionId}`);
                    initPlayback();
                    startCapture().catch(err => console.error('Failed to start capture:', err));
                    setStatus('connecting');
                    break;
                case 'interrupted':
                    setStatus('interrupted');
                    handleInterrupt();
                    setTimeout(() => setStatus('listening'), 1000);
                    break;
                case 'metrics':
                    console.log('📊 [Session] Metrics update:', msg.data);
                    setMetrics(msg.data);
                    break;
                case 'transcript_cue':
                    setCues(prev => [...prev, { text: msg.text, timestamp: msg.timestamp }]);
                    break;
                case 'turn_complete':
                    if (!timerRef.current) {
                        console.log('🎤 [Session] AI intro finished, starting timer');
                        timerRef.current = window.setInterval(() => {
                            setElapsed(prev => prev + 1);
                        }, 1000);
                    }
                    setStatus(prev => prev === 'ending' ? 'ending' : 'listening');
                    break;
                case 'report':
                    console.log('📊 [Session] Report received:', msg.data);
                    if (!endingRef.current) {
                        endingRef.current = true;
                        onEndRef.current(msg.data);
                    }
                    break;
                case 'error':
                    console.error('❌ [Session] Server error:', msg.message);
                    break;
                case 'ai_disconnected':
                    console.warn('⚠️ [Session] AI disconnected:', msg.message);
                    stopCapture();
                    setStatus('disconnected');
                    break;
            }
        };

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            stopCapture();
            disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-scroll transcript feed
    useEffect(() => {
        feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [cues]);

    // Enforce session time limit
    useEffect(() => {
        if (elapsed >= SESSION_LIMIT_SECONDS && status !== 'ending' && status !== 'disconnected') {
            console.log('⏱️ [Session] Time limit reached. Auto-ending.');
            handleEnd();
        }
    }, [elapsed, status, handleEnd]);

    return {
        status,
        metrics,
        cues,
        elapsed,
        isConnected,
        handleEnd,
        userAnalyserRef,
        aiAnalyserRef,
        feedEndRef,
    };
}
