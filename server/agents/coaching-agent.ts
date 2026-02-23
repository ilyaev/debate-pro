import { config, loadPrompt, type Mode } from '../config.js';

/**
 * Creates a Coaching Agent configuration for the given mode.
 *
 * The Coaching Agent is the primary persona that interacts with the user
 * via voice. It uses the mode-specific system prompt to determine behavior
 * (e.g., skeptical VC, upset customer, debate opponent).
 *
 * NOTE: In the current implementation, the coaching behavior is embedded
 * directly in the Gemini Live API session's system prompt (see ws-handler.ts).
 * This module provides the agent definition for future ADK orchestration
 * where multiple agents run in parallel.
 */
export interface CoachingAgentConfig {
  name: string;
  model: string;
  instruction: string;
  tools: string[];
}

export function createCoachingAgent(mode: Mode, tools: string[] = []): CoachingAgentConfig {
  const systemPrompt = loadPrompt(mode);

  return {
    name: `coaching_agent_${mode}`,
    model: config.geminiModel,
    instruction: systemPrompt,
    tools,
  };
}
