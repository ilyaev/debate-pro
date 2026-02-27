# Specification: Video Cue App (Glotti-Cue)

## 1. Overview
Glotti-Cue is a lightweight, secondary-monitor helper application designed for video creators. It takes a JSON-formatted script and provides real-time visual cues, teleprompter text, and timing information to help the presenter stay synchronized with their planned scenes.

### Problem Statement
Recording a professional video like the [Glotti Introductory Video](file:///Users/ilyaev/projects/gemili/specs/introductory_video.md) requires precise timing and specific talking points. For non-professional presenters, remembering long texts or timing transitions is difficult.

### Solution
A high-contrast, large-font web application that:
1.  **Reads a JSON script** with defined timeframes.
2.  **Displays a timer** relative to the start of the recording.
3.  **Shows the current segment's text** and visual instructions.
4.  **Provides a "HUD" (Heads-Up Display)** for the presenter to glance at without losing focus.

---

## 2. Technical Stack
- **Framework:** React + TypeScript (Vite-powered)
- **Styling:** Vanilla CSS (Modern CSS with Flexbox/Grid)
- **Icons:** Lucide React
- **Persistence:** Local Storage (for the last loaded script)

---

## 3. Data Model (JSON Script)

The application expects a JSON file or pasted text following this structure:

```typescript
interface ScriptSegment {
  id: string;        // Unique identifier (scene-1, scene-2, etc.)
  startTime: number; // Start time in seconds (e.g., 30)
  endTime: number;   // End time in seconds (e.g., 50)
  title: string;     // Short scene title
  content?: string;  // High-level summary of the segment content
  prompt?: string;   // Instructions for voice delivery (intonation, speed, etc.)
  audio?: string;    // Path/key to audio file for reference or rehearsal
  text: string;      // The actual script or teleprompter text
  visuals?: string;  // What should be happening on screen (e.g., "[Click Start Session]")
  instructions?: string[]; // Bulleted notes for the presenter
}

interface VideoScript {
  title: string;
  totalDuration: number; // Expected total video length in seconds
  segments: ScriptSegment[];
}
```

---

## 4. UI/UX Design

### Main Dashboard
- **HUD Area (Center):** High-contrast background. Current segment text displayed in large, readable font (Variable font size based on text length).
- **Secondary Cues (Top Right):** A list of visual instructions or bullet points.
- **Progress Bar (Bottom):** A full-width bar showing current time vs. total duration.
- **Timer (Top Left):** Large "MM:SS" display.
- **Upcoming Preview (Bottom Right):** A small card showing the next scene's title and start time.

### Interaction Flow
1.  **Paste Script:** On initial load, a large text area allows pasting the JSON.
2.  **Start/Pause:** A global key listener (Spacebar) or button starts/pauses the timer.
3.  **Manual Seeking:** Presenter can click on a segment in the timeline to jump to that specific time.
4.  **Reset:** Quickly return to 00:00.

---

## 5. Implementation Steps

### Phase 1: Foundation
1.  Initialize Vite project with TypeScript.
2.  Set up a basic CSS grid layout for the HUD.
3.  Create the `useTimer` hook to handle precise second-by-second updates.

### Phase 2: Script Management
1.  Implement a JSON parser that validates the input against the `VideoScript` interface.
2.  Add a "Load Script" overlay for initial input.
3.  Save the loaded script to `localStorage` for persistence.

### Phase 3: Display Logic
1.  Implement a `getActiveSegment(currentTime)` function.
2.  Create the `Teleprompter` component that transitions smoothly between segments.
3.  Add the `Timeline` component showing segment blocks with durations.

### Phase 4: Polish
1.  Add animations for segment transitions.
2.  Optimize font sizes for far-distance viewing (e.g., 2 meters from monitor).
3.  Implement "Warn" state (text turns yellow when 5 seconds remain in segment).

---

## 6. Example Script Template

```json
{
  "title": "Glotti Intro Video - Script A",
  "totalDuration": 225,
  "segments": [
    {
      "id": "hook",
      "startTime": 0,
      "endTime": 30,
      "title": "The Hook",
      "text": "Imagine you're about to pitch your startup to a top VC. You've rehearsed in the mirror, you've practiced with friends... but none of them interrupted you.",
      "visuals": "[Screen: Black background with text]",
      "instructions": ["Speak clearly", "Maintain eye contact"]
    },
    {
      "id": "intro",
      "startTime": 30,
      "endTime": 50,
      "title": "Product Intro",
      "text": "This is Glotti — a real-time AI sparring partner powered by Gemini's Live API.",
      "visuals": "[Screen: Mode Select page]",
      "instructions": ["Hover over mode cards"]
    }
  ]
}
```
