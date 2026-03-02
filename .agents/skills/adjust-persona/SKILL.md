---
name: adjust-persona
description: Modifies an existing AI coaching persona based on a prompt or adjustment description, and ensures all dependent components (config, UI cards, frontend reporting) are updated to match the new behavior.
version: 1.0.0
---

# Adjust Persona Skill

## Purpose
This skill provides a strict workflow for updating an AI persona. Because the personas in Gemili are deeply integrated into the reporting pipeline, changing what a persona "looks for" or how it behaves requires updating several layers of the application to ensure the user receives accurate feedback.

Use this skill whenever a user asks to "change the prompt", "adjust the persona", or "make the AI behave differently" for an existing scenario (e.g., `professional_introduction`, `pitch_perfect`, `veritalk`).

## Workflow

When asked to adjust a persona, you MUST follow these steps in order:

### 1. Update the System Prompt
- **Target File**: `server/agents/prompts/[persona_name].md`
- **Action**: Rewrite or adjust the markdown prompt. Extract any new instructions, behavior hooks, or evaluation criteria the user requested.

### 2. Update the Server Report Config
- **Target File**: `server/config.ts` (specifically the `MODES` object)
- **Action**: Update the `report` configuration for the specific `[persona_name]`.
    - **`promptIntro`**: Update the AI framing to match the new strictness or role.
    - **`categories`**: Update the 4 evaluation categories to match the specific things you just told the prompt to watch out for. Ensure the `description` fields give clear instructions to the report generator.
    - **`displayMetrics`**: Adjust the selected quantitative metrics if necessary.
    - **`extraFields`**: *Crucial Step*. If the persona is now evaluating something new (e.g., "Curveball Response" or "Weakest Moment"), update the `extraFields` to extract those strings/arrays. Remove outdated fields to save tokens.

### 3. Update the Gemini Bridge (If adding tools)
- **Target File**: `server/session/gemini-bridge.ts`
- **Action**: If you instructed the prompt to use a specific tool (like Google Search or Code Execution), ensure that tool is enabled in the `connectGemini` function for this specific mode.

### 4. Update the Frontend Report Card
- **Target File**: `client/src/components/report/cards/[PersonaName]Card.tsx`
- **Action**: This card renders the "shareable" dynamic image. Update the bottom row of metric cards to map to the new `extraFields` you defined in step 2. Ensure layout handles missing fields gracefully.

### 5. Update the Frontend Report View
- **Target File**: `client/src/components/report/[PersonaName]Report.tsx`
- **Action**: This is the detailed UI view. Update the rendered widgets to properly display the new `extraFields` and remove dead code referencing old fields. Ensure you extract the fields from `data.extraFields` or `data.extra`.

### 6. Update Documentation
- **Target File**: `specs/[persona_name].md` (if it exists)
- **Action**: Briefly update the central specification document to reflect the new capabilities or behavioral hooks.

## Safety Constraints
- **Do not break the UI**: Ensure that if an `extraField` fails to generate from the LLM, the frontend components (Card and Report) have sensible visual fallbacks (e.g., `|| 'Solid Performance'`).
- **No Parallel Tool Calls for Edits**: Edit these files sequentially to ensure the config matches the prompt, and the UI matches the config.
- **Always verify the build**: Run `npx tsc --noEmit && npm run build:client` after updating the config and frontend components to ensure no TypeScript interfaces were broken by changing `extraFields`.
