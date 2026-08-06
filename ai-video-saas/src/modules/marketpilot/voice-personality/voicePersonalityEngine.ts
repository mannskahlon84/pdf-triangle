import { VoicePersonalityMode, VoiceInstruction } from "./types/voice.types";

export class VoicePersonalityEngine {
  /**
   * Generates a deterministic VoiceInstruction based on campaign parameters and selected mode.
   * Modifies script style, voice settings, and TTS routing without generating audio directly.
   */
  public static generateVoiceInstruction(
    mode: VoicePersonalityMode,
    productType: string,
    audience: string,
    industry: string,
    goal: string
  ): VoiceInstruction {
    let scriptStyle = "conversational";
    let ttsRouting = "OpenAI TTS"; // Default general model
    let voiceSettings = {
      pitch: "default",
      rate: "default",
      emotion: "neutral",
      energyLevel: "medium",
      pauseStyle: "natural",
      deliveryStyle: "clear"
    };

    switch (mode) {
      case "individual_creator":
        scriptStyle = "energetic, personal, and social media native (use direct 'you' and high energy)";
        ttsRouting = "ElevenLabs"; // Often preferred for creator/influencer voices
        voiceSettings = {
          pitch: "high",
          rate: "fast",
          emotion: "excited",
          energyLevel: "high",
          pauseStyle: "quick",
          deliveryStyle: "casual"
        };
        break;

      case "business_industry":
        scriptStyle = "professional, trustworthy, and authoritative (focus on ROI and reliability)";
        ttsRouting = "Google Neural"; // Often preferred for clear, standard corporate voices
        voiceSettings = {
          pitch: "neutral",
          rate: "medium",
          emotion: "professional",
          energyLevel: "steady",
          pauseStyle: "measured",
          deliveryStyle: "trustworthy"
        };
        break;

      case "premium_cinematic":
        scriptStyle = "slow, emotional, and premium (use impactful pauses and sensory language)";
        ttsRouting = "ElevenLabs"; // High-fidelity cinematic voices
        voiceSettings = {
          pitch: "low",
          rate: "slow",
          emotion: "confident",
          energyLevel: "controlled",
          pauseStyle: "dramatic",
          deliveryStyle: "luxury"
        };
        break;
    }

    // Example of how industry or goal could gently tweak the base settings
    if (goal === "urgency" || goal === "sales") {
      voiceSettings.energyLevel = "high";
      voiceSettings.rate = "fast";
    }

    return {
      mode,
      scriptStyle,
      voiceSettings,
      ttsRouting
    };
  }
}
