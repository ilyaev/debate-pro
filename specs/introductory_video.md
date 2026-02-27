# Introductory / Demonstration Video — Production Guide

> **Requirement:** < 4-minute video. Demo multimodal/agentic features working in real-time (no mockups). Pitch the problem and value.
>
> **Key constraint:** Everything shown must be REAL — actual app running, actual Gemini responses, actual live metrics. No post-production fakery.

---

## Table of Contents

1. [Video Strategy](#1-video-strategy)
2. [Script Variant A — "The Pitch" (Recommended)](#2-script-variant-a--the-pitch-recommended)
3. [Script Variant B — "The Tour"](#3-script-variant-b--the-tour)
4. [Script Variant C — "The Challenge"](#4-script-variant-c--the-challenge)
5. [Scene-by-Scene Visual Guide](#5-scene-by-scene-visual-guide)
6. [Recording Tips](#6-recording-tips)
7. [Talking Points Cheat Sheet](#7-talking-points-cheat-sheet)

---

## 1. Video Strategy

### What Judges Want to See

| Criterion | How to satisfy |
|---|---|
| Multimodal features | Show live audio streaming (your voice → Gemini → AI voice back), real-time transcription, live metrics dashboard updating |
| Agentic features | Show AI interrupting you mid-sentence, barge-in behavior, adaptive escalation/de-escalation, Google Search grounding (Veritalk) |
| Real-time (no mockups) | Screen-record the actual running app — metrics update live, transcript scrolls, waveform responds to voice |
| Problem & value | Open with the "why" — practicing high-stakes conversations is hard, expensive, and awkward |

### Recommended Structure (3:45)

| Section | Duration | Content |
|---|---|---|
| Hook + Problem | 0:00–0:30 | Why this matters. The pain point. |
| Solution intro | 0:30–0:50 | What Glotti is. Quick mode overview. |
| Live demo #1 | 0:50–2:10 | PitchPerfect session — show the core loop (speak → AI interrupts → metrics update → barge-in) |
| Live demo #2 | 2:10–2:50 | Quick cut to Veritalk or EmpathyTrainer — show persona variety + Search grounding or emotional escalation |
| Report + Sharing | 2:50–3:20 | Show report generation, score card, mode-specific feedback, share modal |
| Architecture flash | 3:20–3:35 | Quick diagram: Browser ↔ Backend ↔ Gemini. Mention ADK, Cloud Run, Firestore. |
| Closing | 3:35–3:45 | "Try it live" URL, tagline |

---

## 2. Script Variant A — "The Pitch" (Recommended)

> Best for: Maximum impact. Opens with storytelling, demonstrates 2 modes, ends strong.

### SCENE 1 — The Hook (0:00–0:30)
**[Screen: Black background with text, or you speaking to camera]**

**Voiceover/You:**
> "Imagine you're about to pitch your startup to a top VC. You've rehearsed in the mirror, you've practiced with friends who nodded politely... but none of them interrupted you with 'What's your customer acquisition cost?' None of them caught you say 'um' twelve times.
>
> Real high-stakes conversations are messy, adversarial, and unpredictable. And there's no safe place to practice them. Until now."

### SCENE 2 — Product Intro (0:30–0:50)
**[Screen: Mode Select page — show all 4 mode cards]**

**Voiceover:**
> "This is Glotti — a real-time AI sparring partner powered by Gemini's Live API. You choose a persona — a skeptical VC, an angry customer, a debate opponent, an improv coach — and the AI listens to you, challenges you, and interrupts you in real-time. Just like the real thing."

**[Action: Mouse hovers over each mode card briefly as you name them]**

### SCENE 3 — Live Demo: PitchPerfect (0:50–2:10)
**[Screen: Click "Start Session" on PitchPerfect card]**

**Voiceover (while connecting):**
> "Let me show you. I'm starting a PitchPerfect session — the AI is a skeptical venture capitalist."

**[Screen: Session view appears — waveform, dashboard, transcript feed, timer]**

**[Wait for AI greeting — the VC will say something like "Alright, you have 3 minutes. What's the company?"]**

**You (speaking into mic, actually pitching):**
> "Thanks for taking the meeting. We're building Glotti — it's an AI-powered communication coach that—"

**[The AI will likely interrupt you. Let it. This is the money shot.]**

*Expected AI interruption: Something like "Stop. What problem are you solving? Don't start with the solution."*

**Voiceover (after the interruption):**
> "See that? It just interrupted me. That's Gemini Live API with barge-in — the agent detected I was burying the lede and cut me off mid-sentence."

**[Point out the dashboard — use mouse cursor to highlight]:**
> "Meanwhile, the live dashboard is tracking my filler words, speaking pace, tone confidence, and talk ratio — all in real-time."

**[Continue the pitch for ~30 more seconds. Let the AI respond naturally. Show the waveform reacting to both voices — the "Tides Clash" effect where the waveforms battle.]**

**[Point to the transcript feed]:**
> "The live transcript shows everything being said — both sides. Every sentence is streamed from Gemini's real-time transcription."

**[Click "End Session"]**

### SCENE 4 — Quick Mode Switch: Veritalk or EmpathyTrainer (2:10–2:50)
**[Screen: Back to mode select → click Veritalk]**

> **Option A — Veritalk (shows Google Search grounding):**
>
> **Voiceover:**
> "Now watch what happens in debate mode. Veritalk uses Google Search grounding to fact-check me in real-time."
>
> *You: "Studies show that remote work increases productivity by 40%."*
>
> *AI will likely counter with: "That 40% figure comes from a single Stanford study from 2015 — and it measured call center workers, not knowledge workers. Recent 2024 meta-analyses show mixed results."*
>
> **Voiceover:**
> "It just pulled a real counter-argument using Google Search. This isn't canned — it's live fact-checking."

> **Option B — EmpathyTrainer (shows emotional escalation):**
>
> **Voiceover:**
> "In EmpathyTrainer mode, the AI plays an upset customer or struggling employee. Watch what happens when I try to de-escalate."
>
> *AI (as angry customer): "I've been waiting two weeks for my order and nobody has even called me back!"*
>
> *You: "I totally understand, but our policy—"*
>
> *AI (escalating): "Don't 'but' me! You're not listening!"*
>
> **Voiceover:**
> "The agent detected the word 'but' after empathy — a classic de-escalation mistake — and immediately escalated. It adapts its emotional intensity based on how you respond."

**[Click "End Session" after ~30s]**

### SCENE 5 — Report & Sharing (2:50–3:20)
**[Screen: Session ending overlay → report generation → report appears]**

**Voiceover (over loading screen):**
> "After the session, Glotti generates a detailed performance report using Google's ADK framework."

**[Screen: Report page appears with score gauge, category cards, metrics]**

> "You get an overall score, category-by-category breakdowns specific to the mode — problem clarity, Q&A performance, handling pressure — plus key moments from the conversation and actionable improvement tips."

**[Scroll through report — show the category cards, strongest asset / weakest link sections, key moments timeline, improvement tips list]**

**[Click "Share" → show Share Modal]**

> "And you can share your results with an auto-generated performance card — optimized for LinkedIn, X, and other platforms with server-rendered Open Graph previews."

**[Show the OG card preview in the modal, the social post templates]**

### SCENE 6 — Architecture Flash (3:20–3:35)
**[Screen: Architecture diagram from docs/diagrams.md or README — either the Mermaid render or a clean screenshot]**

**Voiceover:**
> "Under the hood: the React client streams audio over WebSocket to a Node.js backend on Cloud Run, which pipes it to Gemini 2.5 Flash via the Live API. Google ADK orchestrates report generation, tone analysis, and analytics. Sessions are persisted in Firestore. Deployed with a single script."

### SCENE 7 — Closing (3:35–3:45)
**[Screen: Mode select page or live URL]**

**Voiceover:**
> "Glotti. Master high-stakes conversations with a real-time AI sparring partner. Try it live at glotti.pbartz.net."

---

## 3. Script Variant B — "The Tour"

> Best for: Comprehensive feature coverage. Shows all 4 modes briefly. Less dramatic but more thorough.

### Structure

| Time | Scene | Content |
|---|---|---|
| 0:00–0:20 | Hook | "What if you could rehearse the hardest conversations with an AI that fights back?" |
| 0:20–0:40 | Mode select | Show all 4 modes, explain the concept |
| 0:40–1:20 | PitchPerfect | 40-second demo — pitch → interruption → show dashboard |
| 1:20–1:50 | EmpathyTrainer | 30-second demo — show emotional escalation/de-escalation |
| 1:50–2:15 | Veritalk | 25-second demo — show Google Search grounding fact-check |
| 2:15–2:35 | Impromptu | 20-second demo — show random topic assignment, energy |
| 2:35–3:10 | Report closeup | Show one detailed report — score gauge, categories, key moments, tips |
| 3:10–3:30 | Past sessions + sharing | Show sessions list, share modal, OG card |
| 3:30–3:45 | Tech + close | Quick architecture mention, live URL |

### Key Script Lines

**PitchPerfect scene:**
> "The VC persona interrupts you mid-sentence if you hand-wave. Watch — I just said 'disrupt' and it didn't let me finish."

**EmpathyTrainer scene:**
> "The customer just escalated because I said 'I understand, but...' — that little word 'but' negated everything before it. The AI caught that instantly."

**Veritalk scene:**
> "I claimed remote work is always better. It countered with a specific 2024 meta-analysis. That's live Google Search grounding — no pre-scripted answers."

**Impromptu scene:**
> "It gave me 'Explain the internet to Benjamin Franklin' — I have 2 minutes, no prep. If I pause for more than 3 seconds, it jumps in."

---

## 4. Script Variant C — "The Challenge"

> Best for: Entertainment value. You set up a challenge for yourself and the video follows you attempting it. More personal, engaging.

### Structure

| Time | Scene | Content |
|---|---|---|
| 0:00–0:20 | Setup | "I'm going to pitch my project to the hardest VC in the world — an AI that's been programmed to tear me apart." |
| 0:20–0:30 | Quick problem statement | "There's no good way to practice high-stakes conversations. Friends are too nice. Coaches are expensive." |
| 0:30–2:30 | Full PitchPerfect session | Run a real ~2 minute session. Let ALL the real interactions play out — interruptions, barge-ins, challenges. Don't rehearse too much — genuine stumbles make it authentic. |
| 2:30–3:00 | Report reaction | "Let's see how I did..." Show report generation, react to your score genuinely. Scroll through the feedback. |
| 3:00–3:20 | Feature summary | Quick montage of other modes (EmpathyTrainer, Veritalk, Impromptu cards), share modal, sessions list |
| 3:20–3:35 | Architecture | Quick flash of the diagram + tech stack |
| 3:35–3:45 | Close | "Think you can beat my score? Try it at glotti.pbartz.net" |

### Key Script Lines

**Opening:**
> "I built an AI that's designed to interrupt me, challenge me, and judge me. Let's see if I can survive 3 minutes with it."

**After a tough AI interruption:**
> "Okay, that was brutal. But that's the point — in a real investor meeting, that's exactly what happens."

**Report reveal:**
> "A [X] out of 10. Ouch. Let's see what it says... 'Weakest link: market articulation.' Yeah, fair."

**Close:**
> "Four modes. Real-time AI that listens, interrupts, and coaches. Full performance reports. All powered by Gemini Live API. Think you can beat a [X]? Try it."

---

## 5. Scene-by-Scene Visual Guide

### What to Capture on Screen

| Scene | What's visible | What to highlight with cursor/zoom |
|---|---|---|
| Mode Select | All 4 cards with icons, colors, descriptions. "How It Works" section above. | Hover over each card. Show the different colored accents (blue, green, purple, orange). |
| Session Start | "Connecting..." status, then waveform appears | The moment the waveform starts moving = Gemini is connected |
| Active Session — Waveform | "Tides Clash" dual waveform (PitchPerfect). User teal waveform vs AI gold waveform. | When AI speaks, its waveform rises. When you speak, yours rises. When you both speak (barge-in), they clash at the center. |
| Active Session — Dashboard | 6 metric cards: Fillers, WPM, Tone, Talk Ratio, Clarity, Hint | Circle cursor around the metrics when they update. Especially the Fillers count going up and the Tone changing. |
| Active Session — Transcript | Live scrolling text with timestamps | Point to it during a real-time transcription moment. Show that it captures both sides. |
| AI Interruption | You're speaking → your waveform is active → suddenly AI waveform fires up and cuts you off | This is the HERO MOMENT. Let it happen naturally. Don't talk over the interruption. |
| End Session | Button click → Session Ending Overlay (spinner, 3-step progress) | Show the "Analyzing transcript & metrics" step spinner |
| Celebration | Confetti + firework particles overlay | If you get a first session or high score, let the full 3.5s animation play |
| Report — Score | Circular gauge filling up with gradient (blue→purple) | Let the gauge animate. Show the big score number. |
| Report — Categories | 4-6 colored cards with scores and feedback | Scroll slowly so each card is visible |
| Report — Key Moments | Timeline with colored dots and timestamps | Point to a specific moment like "2:34 — You used buzzwords" |
| Report — Improvement Tips | Numbered list of concrete suggestions | Show at least 2-3 tips |
| Report — Strongest/Weakest | Green "Strongest Asset" card, red "Weakest Link" card (PitchPerfect) | Great visual contrast |
| Share Modal | Link section, card preview, social platform buttons | Click "Download Card" or show the OG preview image |
| Sessions List | Grid of past session cards with scores, modes, dates | Shows the app has real persistence and history |

### Visual Emphasis Tips

- **Use mouse cursor as a pointer** — circle around live metrics when they update
- **Zoom in** (post-production or browser zoom) on the waveform during barge-in moments
- **Split-screen** is NOT needed — the app's session view already shows waveform + dashboard + transcript simultaneously
- **Do NOT show any terminal/code during the main demo** — save architecture for the 15-second flash at the end

---

## 6. Recording Tips

### Pre-Recording Checklist

- [ ] Open Glotti in Chrome (clean profile, no extensions visible)
- [ ] Set browser to a clean resolution (1920×1080 or 1280×720)
- [ ] Hide browser bookmarks bar
- [ ] Close all other tabs
- [ ] Use a good microphone (the app will capture your actual voice)
- [ ] Test that audio is working: start a quick session, verify you hear AI responses
- [ ] Prepare 2-3 sessions worth of content to have options in editing
- [ ] Have your "pitch" loosely prepared but NOT perfectly rehearsed — genuine stumbles and genuine AI reactions are more impressive than a scripted feel
- [ ] Clear session history or ensure you already have a few past sessions (so the dashboard button shows a count)

### Recording Setup

- **Screen recorder:** OBS (free), QuickTime (macOS), or Loom
- **Record system audio** (the AI voice) + **microphone** (your voice) — both are essential
- **Record at 1080p minimum**, 60fps preferred for smooth waveform animations
- **Facecam is optional** — can add authenticity for the opening/closing pitch but isn't required

### Critical Moments to Nail

1. **The first AI interruption** — This is the most impressive moment. Let the AI cut you off naturally. Your genuine surprise/reaction makes it real.
2. **Dashboard metrics updating** — Make sure at least one metric visibly changes while the camera is on the dashboard. Say "um" deliberately once early on to make the filler counter tick up.
3. **Waveform battle** — During barge-in, both waveforms are active simultaneously. This is visually striking.
4. **Report generation loading** — The 3-step progress indicator proves it's generating in real-time, not cached.
5. **Score reveal** — Let the gauge animate. Genuine reaction to your score is compelling.

### What to AVOID

- ❌ Don't show `.env` files or API keys
- ❌ Don't show terminal output during the main demo (save for architecture flash)
- ❌ Don't read from a script while in the session — the AI detects monotone reading
- ❌ Don't rush. Pauses and genuine reactions are more impressive than speed
- ❌ Don't fake excitement about the score — authentic reactions are better
- ❌ Don't switch modes too quickly — each should have enough time to show its unique behavior

---

## 7. Talking Points Cheat Sheet

Use these when you need to fill voiceover between screen actions.

### The Problem (pick 1-2)
- "Practicing high-stakes conversations is expensive, awkward, and ineffective. Coaches cost $300/hour. Friends nod along."
- "In a real investor meeting, you get interrupted, challenged, and fact-checked. In practice? Everyone's polite."
- "Communication skills are the #1 career differentiator — but there's no gym for your voice."

### The Innovation (pick 1-2)
- "Glotti uses Gemini Live API to stream audio bidirectionally — meaning the AI can interrupt you mid-sentence, just like a real person."
- "This isn't post-hoc feedback. The coaching happens while you're speaking — at the speed of conversation."
- "Each mode has a unique persona with its own personality, escalation triggers, and evaluation rubric."

### Technical Depth (pick 2-3)
- "The backend acts as a WebSocket proxy between the browser and Gemini Live API — piping audio both ways while extracting real-time metrics."
- "Google ADK handles report generation via Runner.runAsync, and real-time tone analysis via InMemoryRunner."
- "Sessions are persisted in Firestore. Reports use mode-specific evaluation rubrics — a VC and an empathy coach grade you very differently."
- "Social share cards are rendered server-side using Satori and Resvg — so LinkedIn and Slack get rich OG previews."
- "Google Search grounding in Veritalk mode means the debate opponent fact-checks you with live web data."
- "Deployed on Cloud Run, scales to zero, single deploy.sh script handles everything."

### Emotional / UX Hooks (pick 1)
- "After each session, you get a celebration with confetti and fireworks — then the brutally honest report."
- "You can replay past sessions, track your progress over time, and share your scores on social media."
- "The AI doesn't just critique you — you can jump back into a feedback session to discuss your report with the same persona."

---

## Appendix: Suggested PitchPerfect "Pitch" Content

If you're pitching Glotti itself to the AI VC (very meta and effective for the video):

> "We're building Glotti — an AI communication coach. The problem: 70% of professionals say public speaking is their top fear, but the only solutions are expensive human coaches or passive recording apps. Our solution uses Gemini's Live API to create a real-time sparring partner that actually interrupts you, challenges you, and grades you — like a flight simulator for your voice. We have 4 scenario modes, personalized reports, and social sharing built in. We're deployed on Google Cloud Run with zero infrastructure overhead."

The beauty of pitching Glotti to the Glotti AI VC is that the AI will challenge the very product you're demoing — extremely compelling for a video.
