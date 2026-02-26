import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { PerformanceCard } from '../../client/src/components/report/PerformanceCard.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { SessionData } from '../store.js';

interface FontData {
    regular: Buffer;
    bold: Buffer;
    italic: Buffer;
    mediumItalic: Buffer;
}

let fonts: FontData | null = null;
const bgImages: Record<string, string> = {};

// LRU cache for rendered OG images
const IMAGE_CACHE_MAX = 100;
const imageCache = new Map<string, { png: Buffer; timestamp: number }>();

function evictOldest() {
    if (imageCache.size <= IMAGE_CACHE_MAX) return;
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    for (const [key, entry] of imageCache) {
        if (entry.timestamp < oldestTime) {
            oldestTime = entry.timestamp;
            oldestKey = key;
        }
    }
    if (oldestKey) imageCache.delete(oldestKey);
}

export function loadAssets(): boolean {
    try {
        const readFont = (name: string) => readFileSync(join(process.cwd(), `server/assets/${name}`));
        fonts = {
            regular: readFont('Inter-Regular.ttf'),
            bold: readFont('Inter-Bold.ttf'),
            italic: readFont('Inter-Italic.ttf'),
            mediumItalic: readFont('Inter-MediumItalic.ttf'),
        };

        const loadBg = (name: string) => {
            const path = join(process.cwd(), `client/public/cards/${name}`);
            return `data:image/jpeg;base64,${readFileSync(path).toString('base64')}`;
        };
        bgImages['pitch_perfect'] = loadBg('bg_pitch.jpg');
        bgImages['empathy_trainer'] = loadBg('bg_empathy.jpg');
        bgImages['impromptu'] = loadBg('bg_impromptu.jpg');
        return true;
    } catch (e) {
        console.warn('Could not load assets for OG renderer:', e);
        return false;
    }
}

export function areFontsLoaded(): boolean {
    return fonts !== null;
}

export async function renderOgImage(session: SessionData): Promise<Buffer> {
    if (!fonts) {
        throw new Error('Fonts not loaded server-side');
    }
    if (!session.report) {
        throw new Error('Session has no report');
    }

    // Check cache
    const cacheKey = session.id;
    const cached = imageCache.get(cacheKey);
    if (cached) return cached.png;

    const svg = await satori(
        React.createElement(PerformanceCard, {
            report: session.report,
            isOgImage: true,
            ogBackgroundImage: bgImages[session.mode],
        }),
        {
            width: 1080,
            height: 1080,
            fonts: [
                { name: 'Inter', data: fonts.regular, weight: 400 as const, style: 'normal' as const },
                { name: 'Inter', data: fonts.bold, weight: 700 as const, style: 'normal' as const },
                { name: 'Inter', data: fonts.italic, weight: 400 as const, style: 'italic' as const },
                { name: 'Inter', data: fonts.mediumItalic, weight: 500 as const, style: 'italic' as const },
            ],
        }
    );

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1080 } });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // Store in cache
    imageCache.set(cacheKey, { png: pngBuffer, timestamp: Date.now() });
    evictOldest();

    return pngBuffer;
}
