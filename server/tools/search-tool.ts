/**
 * Google Search grounding tool for Veritalk mode.
 *
 * When integrated with ADK, this provides real-time fact-checking
 * capability to the debate sparring agent.
 *
 * NOTE: Currently, Google Search grounding is configured directly
 * in the Gemini Live API session config for Veritalk mode.
 * This module provides the tool definition for future ADK integration.
 */

export const googleSearchTool = {
  googleSearch: {},
};

export function getSearchToolConfig() {
  return {
    tools: [googleSearchTool],
  };
}
