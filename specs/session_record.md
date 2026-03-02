# Session Recording Screen Specifications

## Overview
The Session Recording Screen is the core UI where the user practices their interview or pitch. It transitions through several states: connecting to the AI, actively conversing (listening/speaking), and ending the session. To maintain user engagement, each state needs a premium, dynamic feel.

## UX/Visual States

### 1. Connecting State (Current Target)
**Goal:** Create an engaging, anticipatory state that keeps the user focused before the AI is ready, moving away from a static "CONNECTING..." text.
**Visuals/UX:**
- **Dynamic Text/Animation:** A subtle pulsating or wave animation on the "CONNECTING..." text to indicate active background loading.
- **Visual Anchor:** A central animated element (like a glowing orb , pulsing rings or a subtle soundwave placeholder) to give a sense of activity and life.
- **Skeleton/Dimmed UI:** The surrounding dashboard metrics cards (Fillers, WPM, Tone, Clarity) and the transcript area could optionally appear slightly dimmed or in a skeleton state to indicate they are inactive until the connection is established.
- **Premium Feel:** Use soft gradients, sophisticated timing on the animations, and modern typography to feel high-end.

### 2. Active Session (Listening/Speaking)
**Goal:** Provide clear feedback on who is speaking and real-time metrics.
**Visuals/UX:**
- **Active Waveform:** The `Waveform` component should be front and center, reacting to audio input.
- **Live Metrics:** Cards update based on the user's speech. Highlight cards that cross thresholds.
- **Live Transcript:** Smooth scrolling feed of the conversation.

### 3. Ending/Paused Session
**Goal:** Clear transition states out of the active conversation.
**Visuals/UX:**
- Semi-transparent overlays blur the session context heavily to focus attention on the pause action or session completion summary before proceeding to the final detailed report.

---

## Multi-Step Implementation Plan

### Step 1: Connecting State (Current Focus)
- **Target Component:** `client/src/components/session/SessionStatusDisplay.tsx`
- **Design:** When `status` is `'connecting'`, instead of plain text, render a richer container featuring:
  - Concentric pulsing rings that expand and fade (representing searching/waiting).
  - A subtle gradient/color effect that feels high-tech and premium.
  - "CONNECTING..." text that slowly pulses in opacity.
- **CSS:** Add `@keyframes` for pulsing and scaling in `client/src/index.css`.

### Step 2: Skeleton / Dimmed State for Inactive Modules
- **Target:** Dashboard cards and Live Transcript container.
- **Design:** While connecting, these panels have reduced opacity or a skeleton shimmer effect.

### Step 3: Enhance Active Waveform and Feedback
- **Target:** `client/src/components/Waveform.tsx` and Status indicators.
- **Design:** Add nuanced color changes depending on whether the system is fully engaged, processing, or ready to speak.
