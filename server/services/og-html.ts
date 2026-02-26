import { config } from '../config.js';
import type { SessionData } from '../store.js';

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

interface OgHtmlOptions {
    session: SessionData;
    id: string;
    key: string;
    protocol: string;
    host: string;
}

export function buildOgHtml({ session, id, key, protocol, host }: OgHtmlOptions): string {
    const score = session.report!.overall_score;
    const modeLabel = session.mode.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

    const safeMode = escapeHtml(modeLabel);
    const safeScore = escapeHtml(String(score));
    const safeId = escapeHtml(id);
    const safeKey = escapeHtml(key);

    const baseUrl = config.isDev ? `http://${escapeHtml(host)}` : 'https://glotti.pbartz.net';
    const imageUrl = `${escapeHtml(protocol)}://${escapeHtml(host)}/api/sessions/shared/og-image/${safeId}/${safeKey}`;

    return `<!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns#">
<head>
    <meta charset="utf-8">
    <title>Glotti Report: ${safeMode} - ${safeScore}/10</title>
    <meta name="author" content="Glotti AI">
    <meta property="og:title" content="Glotti Report: ${safeMode} - ${safeScore}/10" />
    <meta property="og:description" content="I just completed an AI-powered coaching session. See how I performed!" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${baseUrl}/sessiong/${safeId}/${safeKey}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="1080" />
    <meta property="og:image:height" content="1080" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Glotti Report: ${safeMode} - ${safeScore}/10" />
    <meta name="twitter:description" content="I just completed an AI-powered coaching session. See how I performed!" />
    <meta name="twitter:image" content="${imageUrl}" />
    <!-- Redirect to the actual app using JS to prevent scrapers from following a meta refresh -->
    <script>
        window.location.replace("${baseUrl}/#/sessions/${safeId}/${safeKey}");
    </script>
</head>
<body style="font-family: sans-serif; padding: 2rem; text-align: center;">
    <p>Redirecting to report...</p>
    <p>If you are not redirected automatically, <a href="${baseUrl}/#/sessions/${safeId}/${safeKey}">click here</a>.</p>
</body>
</html>`;
}
