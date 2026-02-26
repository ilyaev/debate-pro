export const LIVE_DEBUG = false; // Toggle this to true for UI debugging without backend tokens

import { VisualizationType } from './types';

export const MODE_VISUALIZATION: Record<string, VisualizationType> = {
    pitch_perfect: 'tides_clash',
    veritalk: 'tides_clash',
    empathy_trainer: 'tides_overlay',
    impromptu: 'classic',
};

export const SESSION_LIMIT_SECONDS = 180;
export const SESSION_WARNING_SECONDS = 150;

export interface ModeConfig {
    label: string;
    iconUrl: string;
}

export const MODE_CONFIG: Record<string, ModeConfig> = {
    pitch_perfect: { label: 'Pitch Perfect', iconUrl: '/icons/pitch_perfect.png' },
    empathy_trainer: { label: 'Empathy Trainer', iconUrl: '/icons/empathy_trainer.png' },
    veritalk: { label: 'Veritalk', iconUrl: '/icons/veritalk.png' },
    impromptu: { label: 'Impromptu', iconUrl: '/icons/impromptu.png' },
};

export function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
