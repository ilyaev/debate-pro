# Glotti-Cue (Video Cue App)

Glotti-Cue is a lightweight, secondary-monitor helper application designed for video creators. It provides real-time visual cues, teleprompter text, and timing information to help presenters stay synchronized during recording.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Navigate to the `video_cue` directory:
   ```bash
   cd video_cue
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
Start the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. It is recommended to run this on a secondary monitor while recording.

---

## Features

- **Real-time Teleprompter**: High-contrast focal text with automated smooth scrolling and dynamic font sizing.
- **Reference Audio Playback**: Play and restart target voice recordings directly from the sidebar to rehearse delivery.
- **Voice Delivery Prompts**: Dedicated "Delivery Notes" for each scene providing cues for intonation, speed, and emotion.
- **Stabilized Layout**: A strictly constrained `100vh` interface that ensures the timeline and header are always visible, using internal scrolling for long text.
- **Focal-Point Styling**: Clear visual distinction between spoken text (high contrast white) and stage directions or speaker labels (dimmed/accented).
- **Multi-Script Support**: Toggle between specialized script variants (Variant A, B, and C).
- **Glassmorphism UI**: Modern, dark-mode aesthetic designed for legibility and premium feel.

---

## Script Data Model

The app uses a JSON structure to define segments:

```typescript
interface ScriptSegment {
  id: string;        // Unique identifier
  startTime: number; // Start time in seconds
  endTime: number;   // End time in seconds
  title: string;     // Scene title (e.g., "The Hook")
  content?: string;  // High-level summary of the segment
  prompt?: string;   // Instructions for voice delivery
  audio?: string;    // Reference audio filename (stored in public/audio/)
  text: string;      // Teleprompter text (supports [Stage Directions] and Speaker:)
  visuals?: string;  // On-screen visual instructions
  instructions?: string[]; // Bulleted notes for the presenter
}
```

---

## Shortcuts

- **Space**: Start / Pause the timer.
- **R**: Reset the timer (also stops and resets any playing audio).
- **Click Timeline**: Jump to a specific segment start time.

---

## Technical Stack

- **React + TypeScript**
- **Vite**
- **Lucide React** (Icons)
- **Vanilla CSS**
