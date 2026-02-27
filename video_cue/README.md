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

- **Real-time Teleprompter**: Large, high-contrast text that adjusts font size automatically based on length.
- **Multi-Script Support**: Toggle between specialized script variants (Variant A, B, and C).
- **Dynamic Cues**: Detailed visual instructions and high-level content summaries for each segment.
- **Visual Progress**: A full-width timeline with manual seeking and a large "MM:SS" countdown.
- **Glassmorphism UI**: Modern, dark-mode aesthetic designed for legibility and premium feel.
- **Custom Import**: Option to paste and load your own custom script JSON.

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
  text: string;      // Teleprompter text
  visuals?: string;  // On-screen visual instructions
  instructions?: string[]; // Bulleted notes for the presenter
}
```

---

## Shortcuts

- **Space**: Start / Pause the timer.
- **R**: Reset the timer to 00:00.
- **Click Timeline**: Jump to a specific segment start time.

---

## Built With

- **React + TypeScript**
- **Vite**
- **Lucide React** (Icons)
- **Vanilla CSS**
