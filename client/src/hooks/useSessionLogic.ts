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
    isPaused: boolean;
    togglePause: () => void;
    handleEnd: () => void;
    userAnalyserRef: React.RefObject<AnalyserNode | null>;
    aiAnalyserRef: React.RefObject<AnalyserNode | null>;
    feedEndRef: React.RefObject<HTMLDivElement | null>;
}

export function useSessionLogic(
    mode: string,
    userId: string,
    onEnd: (report: SessionReport) => void,
    context?: { organization: string; role: string },
    options: { enabled?: boolean } = { enabled: true }
): UseSessionLogicReturn {
    const { connect, disconnect, sendBinary, sendJSON, isConnected } = useWebSocket(mode, userId, context);
    const { initPlayback, startCapture, stopCapture, pauseCapture, resumeCapture, playChunk, handleInterrupt, getIsPlaying, userAnalyserRef, aiAnalyserRef } = useAudio(sendBinary);

    const [metrics, setMetrics] = useState<MetricSnapshot | null>(null);
    const [cues, setCues] = useState<TranscriptCue[]>([]);
    const [elapsed, setElapsed] = useState(0);
    const [status, setStatus] = useState<SessionStatus>('connecting');
    const [isPaused, setIsPaused] = useState(false);

    const timerRef = useRef<number | null>(null);
    const endingRef = useRef(false);
    const isPausedRef = useRef(false);
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

    const togglePause = useCallback(() => {
        if (endingRef.current) return;

        if (isPausedRef.current) {
            console.log('▶️ [Session] Resuming session...');
            resumeCapture();
            if (!timerRef.current) {
                timerRef.current = window.setInterval(() => {
                    setElapsed(prev => prev + 1);
                }, 1000);
            }
            sendJSON({ type: 'resume_session' });
            setIsPaused(false);
            isPausedRef.current = false;
            setStatus('listening');
        } else {
            console.log('⏸️ [Session] Pausing session...');
            pauseCapture();
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            sendJSON({ type: 'pause_session' });
            setIsPaused(true);
            isPausedRef.current = true;
            setStatus('paused');
        }
    }, [pauseCapture, resumeCapture, sendJSON]);

    // WebSocket connection + message dispatcher
    useEffect(() => {
        if (!options.enabled) return;

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
                    if (!timerRef.current && !isPausedRef.current) {
                        console.log('🎤 [Session] AI intro finished, starting timer');
                        timerRef.current = window.setInterval(() => {
                            setElapsed(prev => prev + 1);
                        }, 1000);
                    }
                    setStatus(prev => {
                        if (prev === 'ending') return 'ending';
                        if (prev === 'paused') return 'paused';
                        return 'listening';
                    });
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
                case 'ai_end_session':
                    console.warn('⚠️ [Session] AI initiated session end sequence via guardrail or natural closure.');
                    pauseCapture(); // mute user mic so they can't interrupt the goodbye

                    // Allow 1.5s for any in-flight audio chunks to arrive and be queued
                    setTimeout(() => {
                        let checks = 0;
                        const checkAudio = setInterval(() => {
                            checks++;
                            if (!getIsPlaying() || checks > 30) { // max 15s wait
                                clearInterval(checkAudio);
                                handleEnd();
                            }
                        }, 500);
                    }, 1500);
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
        isPaused,
        togglePause,
        handleEnd,
        userAnalyserRef,
        aiAnalyserRef,
        feedEndRef,
    };
}
