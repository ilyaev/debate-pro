# Professional Introduction Persona Specification

## 1. Overview and Goal
The **Professional Introduction Coach** is a dynamic persona designed to help users practice introducing themselves (e.g., "Tell me about yourself and your projects"). Unlike standard personas, this persona's context is built dynamically from two sources:
1. **Wizard Configuration**: Immediate, user-provided context (Target Organization, Role, Basic background).
2. **User Profiling (Historical)**: Extracted insights and areas of improvement automatically gathered from the user's past sessions.

## 2. Core Requirements
### 2.1. Dynamic Persona Wizard
- Before starting the session, the user completes a quick wizard to define the scenario.
- **Fields**:
  - Target Organization (e.g., "Google", "Local Meetup")
  - Target Role/Context (e.g., "Senior Frontend Engineer", "Guest Speaker")
  - Brief Context/Resume highlight (Optional)
- **Persistence**: These settings are saved in the database as presets for easy re-use in future sessions.

### 2.2. User Profiling System
- The system must remember the user across sessions using a persistent anonymous profile (stored via `localStorage`).
- After each session, an async profiling task summarizes the session, extracting:
  - Factual details about the user's experience.
  - Behavioral feedback (e.g., "Tends to talk too fast when nervous", "Needs to highlight leadership more").
- This profile is securely injected into the AI's system prompt in all future sessions to provide a continuous, evolving coaching experience.

### 2.3. Agent Behavior
- The AI plays the role of the Counterparty (Interviewer, Organizer, etc.).
- **Live Fact-Finding**: The AI has access to **Google Search**. When the session starts, it should search for recent news, core values, or typical interview questions related to the user's Target Organization and Role to ask highly specific, realistic questions.
- **Flow**: Starts by welcoming the user and asking the initial question (e.g., "Tell me about yourself"). It listens to the user's pitch, then asks relevant, challenging follow-up questions based on what the user said *and* its real-time search context.
- **Role Consistency**: The AI must absolutely never break character during the active session.

### 2.4. Post-Session & Feedback
- A specialized report is generated grading the user on clarity, relevance, confidence, and structure.
- The user can trigger a **Feedback Session** (using the existing feedback mode) to discuss the report directly with the agent.

---

## 3. Technical Architecture

### 3.1. Database Schema
We will use the existing `ServerStore` (`store.ts`) abstraction, which manages both local file JSON (for dev) and Firestore (for production). The data model will be keyed by the `userId` provided by the frontend.

**Profiles Data**
- `factualSummary`: string (Extracted facts about the user's career)
- `coachingNotes`: string (Persistent notes on what the user needs to improve)
- `lastUpdated`: Timestamp

**Presets Data**
- `presetName`: string
- `organization`: string
- `role`: string
- `background`: string (optional)
- `lastUsedAt`: Timestamp

### 3.2. Integration with Current Architecture (`specs/persona.md`)
This persona fits well into the existing `MODES` structure in `server/config.ts`, but requires intercepting the prompt generation to inject dynamic data.

1. **Prompt File**: `server/agents/prompts/professional_introduction.md` will contain template variables like `{{ORGANIZATION}}`, `{{ROLE}}`, and `{{USER_PROFILE}}`.
2. **`ws-handler.ts` adjustments**:
   - Currently, `loadPrompt(mode)` reads a static string.
   - We must pass `userId`, `organization`, and `role` from the frontend via the WebSocket handshake URL.
   - In `ws-handler.ts`, we fetch the user's profile via `store.ts`.
   - We inject these values into the prompt text before calling `genai.live.connect()`.
3. **Profiler Service**:
   - A new service `server/services/profiler.ts` will run after the session ends (when generating the report). It will call Gemini via the standard REST API to analyze the session transcript and update the user's profile via `store.ts`.

### 3.3. Frontend Adjustments
1. **User Identity**: The frontend will generate a `uuid` in `localStorage` to identify the user anonymously.
2. **Wizard UI**: A new React component `IntroWizard.tsx` that appears when the "Professional Introduction" mode is selected. This incorporates a new, shared `ComboBox.tsx` component with case-insensitive filtering for intuitive data entry.
3. **WebSocket Connection**: Update `useWebSocket.ts` to append the necessary dynamic parameters to the WS connection URL.

---

## 4. Implementation Plan

**Phase 1: Database & Backend Foundation**
- [x] Update `store.ts` to add methods for `saveProfile`, `getProfile`, `savePreset`, and `listPresets`.
- [x] Create `profiler.ts` service to generate insights from transcripts and save to the store.
- [x] Modify `loadPrompt` and `ws-handler.ts` to accept dynamic context variables and inject them into the markdown prompt.

**Phase 2: The Persona**
- [x] Write `professional_introduction.md` system prompt with placeholders and strict roleplay rules.
- [x] Add `professional_introduction` configuration to `MODES` in `server/config.ts` with custom report categories.

**Phase 3: Frontend Wizard & Wiring**
- [x] Develop the `IntroWizard` React component.
- [x] Implement API endpoints to load/save user presets.
- [x] Pass the dynamic context to the WebSocket connection.
- [x] Ensure the post-session "Feedback" mode functions seamlessly with this persona.
