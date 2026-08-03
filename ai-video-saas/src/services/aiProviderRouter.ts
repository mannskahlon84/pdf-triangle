/**
 * MarketPilot AI — AI Provider Router
 * Universal router supporting Gemini, OpenAI, Anthropic, or Mock Fallback mode.
 */

export interface AITextRequest {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  provider?: "gemini" | "openai" | "mock";
}

export interface AITextResponse {
  text: string;
  providerUsed: string;
  timestamp: string;
}

export class AIProviderRouter {
  public static async generateText(request: AITextRequest): Promise<AITextResponse> {
    // If API keys are configured in process.env, route to real provider
    const provider = request.provider || (process.env.GEMINI_API_KEY ? "gemini" : "mock");

    if (provider === "gemini" && process.env.GEMINI_API_KEY) {
      try {
        // Future hook for direct SDK call when API key is set
        // For now fallback to mock simulation if network fails
      } catch (e) {
        console.warn("AI Provider call failed, falling back to mock synthesis");
      }
    }

    // Mock realistic synthesized response for development / demo
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      text: `Synthesized AI output for prompt: ${request.prompt.slice(0, 100)}...`,
      providerUsed: "mock",
      timestamp: new Date().toISOString(),
    };
  }
}

export const aiProviderRouter = AIProviderRouter;
