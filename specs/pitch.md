# Glotti — Contest Pitch

---

## One-Liner

**Glotti** is a real-time AI sparring partner that doesn't wait for you to finish — it interrupts, challenges, and coaches you mid-sentence, training you to perform under pressure.

---

## The Problem

High-stakes speaking is a skill trained through repetition and live feedback — but practice partners are scarce, expensive, and inconsistent.

- **Founders** rehearse pitches alone or with friends who pull punches. They discover their weaknesses live, in front of real investors.
- **Customer success reps** learn to handle angry customers by failing with real customers, costing companies revenue and CSAT scores.
- **Debaters and public speakers** can't find adversaries who fact-check in real-time, so they develop blind spots.

Current tools — recording + replaying, speeching to a mirror, or post-hoc AI grading — all share the same fatal flaw: **the feedback comes after the moment has passed.** By then, the neural pathway is already wired wrong.

---

## The Solution

Glotti creates a **real-time feedback loop** that trains composure, clarity, and persuasion in the moment.

The user selects a scenario — investor pitch, angry customer, adversarial debate — and starts talking. Glotti:

1. **Listens** via Gemini Live API's bidirectional audio streaming with sub-second latency.
2. **Interrupts** naturally using barge-in capability — challenging weak arguments, calling out filler words, or escalating emotional tension to test the user's composure.
3. **Measures** in real-time — filler word counts, speaking pace, **talk ratio, clarity score**, and **dynamic tone analysis** displayed on a live dashboard with **dual waveform visualization**.
4. **Session Constraints** — a **3-minute session limit** with a timer warning, pushing the user to be concise and impactful.
5. **Reports** after the session — a structured evaluation with timestamped highlights, category scores, and actionable coaching hints.

---

## Why This Wins

### Technical Innovation
Glotti is built on **Gemini Live API's barge-in interruption** — the core capability that makes this impossible with any other AI provider. The agent doesn't politely wait — it *talks over you* when it needs to, and *listens* when you talk over it. This is the defining feature of the Live Agents category.

### Mandatory Tech — All Checked

| Requirement | Implementation |
|---|---|
| ✅ Gemini model | Gemini 2.5 Flash (native audio dialog) |
| ✅ Google GenAI SDK or ADK | Agent Development Kit — multi-agent TypeScript orchestration |
| ✅ Google Cloud service | Cloud Run (hosting), Firestore (sessions), Secret Manager |
| ✅ Gemini Live API | Core of the product — bidirectional audio streaming |
| ✅ Hosted on Google Cloud | Containerized on Cloud Run |
| ✅ Beyond text-in/text-out | Real-time audio input, audio + JSON dashboard output |

### Multimodal — Not Just a Chatbot
- **Input:** Streaming audio — native bidirectional dialogue.
- **Output:** Streaming audio (voice coaching) + **real-time JSON headers** for dashboard metrics + **dual waveforms** (user & AI) — not just text.
- **Visuals:** Organic light theme with **Lucide icons** for a premium, modern feel.
- **Interaction model:** Interruptible, real-time, bidirectional — not request-response.

### Practical Impact
This solves a real, underserved need across multiple $B+ markets:
- **Sales enablement** ($7B market) — reps train on cold calls and objection handling.
- **Executive coaching** ($15B market) — leaders practice high-stakes meetings.
- **Education** ($400B market) — students prepare for oral exams, interviews, and presentations.

---

## Demo Script (2 minutes)

> **[0:00 - 0:15]** "Hi, I'm presenting Glotti — the AI coach that doesn't let you finish a bad sentence."

> **[0:15 - 0:30]** *Show the mode selection screen.* "I'll select PitchPerfect mode. This is the skeptical VC."

> **[0:30 - 1:30]** *Start a live pitch.* The user says: "So, um, we're building a platform that, like, helps people—" **The agent interrupts:** "You've said 'um' twice and 'like' once in one sentence. Start again — what do you build?" *The user recovers.* The dashboard updates: filler count ticks up, pace gauge moves, **talk ratio shifts, and the clarity score reflects the recovery**.

> **[1:30 - 1:50]** *Show the dashboard and dual waveforms.* "Notice the live metrics and the sync between our voices on the dual waveform. This is happening as I speak."

> **[1:50 - 2:00]** *End session, show the report.* "And here's my post-session report with scores, key moments, and improvement tips. All powered by Gemini."

---

## Architecture (30-second version)

```
Browser (mic)
    ↕ WebSocket
Cloud Run (Node.js + Express + ADK Agents)
    ↕ WebSocket
Gemini Live API (2.5 Flash native audio)
    + Google Search (for Veritalk fact-checking)
    + Firestore (session persistence)
```

Two ADK agents run in parallel:
1. **Coaching Agent** — holds the persona, generates voice interruptions.
2. **Analytics Agent** — silently monitors speech patterns, emits metrics.

---

## Team & Timeline

- **Solo developer** building on ADK + Gemini Live API.
- **12-15 hours** estimated build time.
- **Stack:** TypeScript/Node.js (Express + ws), React + Vite, Docker, Cloud Run.
- **Development:** Fully local with hot reload; Cloud Run for production only.
- **All code open-source** on GitHub.

---

## The Takeaway

Glotti isn't another speech review tool. It's the first AI that **fights back in real-time** — turning every practice session into a high-pressure simulation. Built entirely on Google's AI stack, it demonstrates the full power of Gemini Live API: bidirectional audio, interruptible conversation, and tool-augmented reasoning, all orchestrated by ADK and hosted on Cloud Run.

**It's not about being perfect. It's about being ready.**

---

## Project Story

- **Inspiration:** Communication is the most valuable human skill, yet it’s the hardest to train safely. Traditional LLMs are too "polite"—they wait their turn, allowing you to meander. We built Glotti to be the "flight simulator" for high-pressure conversation: an AI that doesn't just listen, but fights back in real-time to build genuine resilience.
- **What it does:** Glotti is a real-time, bidirectional AI sparring partner. It uses sub-second barge-in to interrupt filler words and logic gaps, provides a live analytics dashboard (Talk Ratio, Clarity, Tone), and generates deep-dive post-session reports. Users can share their performance to social media or jump into a dedicated "Feedback Session" with the AI to review their transcript and improve.
- **How we built it:** Built on the **Gemini 2.5 Flash** native audio engine for sub-second latency. We used the **Agent Development Kit (ADK)** to orchestrate a dual-agent system: a Coaching Agent for the voice persona and an Analytics Agent for silent metric emission. The backend is containerized on **Google Cloud Run**, using WebSockets with custom JSON headers to stream metrics and audio in parallel.
- **The Ecosystem:**
    - **Detailed Reports:** Every session ends with a Firestore-persisted report covering specific categories (e.g., Argument Coherence, Empathy) and actionable "Golden Phrases."
    - **Social Sharing:** Integrated Open Graph meta-tags and dynamic routing allow users to share their session scores and highlights to LinkedIn and Facebook with rich previews.
    - **Feedback Mode:** A unique "Feedback Session" capability where the AI agent reads your previous transcript, analyzes your performance, and holds a preparation dialogue to help you fix specific weaknesses.
- **Challenges we ran into:** Orchestrating two LLM-driven agents in parallel without losing audio synchronization. We had to implement a custom protocol for delaying AI intros until the microphone was active and handling recovery from barge-ins without breaking the conversation flow.
- **Accomplishments that we're proud of:**
    - Creating a tool that actually shifts the user's focus from "script reading" to "live defense." The "Aha!" moment happens when the user successfully interrupts the AI back to regain control of the room.
    - **Invention of the "Self-Reflective Feedback" loop:** Users (and anyone they share their report with) can instantly jump into a feedback session with the *same agent* from the original session. This turns a static report into an interactive social experience—mentors or peers can dive in to discuss specific moments of the performance with the AI that witnessed it.
- **What we learned:** Real training happens *in the flow*. Post-mortem analysis is useful (hence our detailed reports), but the neural pathways for composure are only built when the challenge happens mid-sentence. From a technical perspective, this was only possible by leveraging **Google Cloud Run**'s low-latency execution and **Gemini 2.5 Flash**'s native audio streaming, which allowed us to break the traditional request-response cycle and build a truly reactive, multimodal conversation.
- **What's next for Glotti:**
    - **Competitive "Game" Modes:** Introducing structured AI sparring where users must achieve specific conversation goals (e.g., "De-escalate the customer without a refund" or "Extract a soft-no from the VC") to win.
    - **Entertainment & Storytelling:** Beyond training, Glotti will support pure immersive modes—collaborative "Choose Your Own Adventure" stories, real-time fairy tale generation for kids, and AI-led roleplay adventures.
    - **Advanced Orchestration:** Integrating more complex ADK workflows for multi-agent "Boardroom" simulations and deepening the feedback loop with long-term memory for user progress tracking.
