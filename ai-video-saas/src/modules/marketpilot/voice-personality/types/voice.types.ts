export type VoicePersonalityMode = 
  | "individual_creator" 
  | "business_industry" 
  | "premium_cinematic";

export interface VoiceSettings {
  pitch: string;
  rate: string;
  emotion: string;
  energyLevel?: string;
  pauseStyle?: string;
  deliveryStyle?: string;
}

export interface VoiceInstruction {
  mode: VoicePersonalityMode;
  scriptStyle: string; // Style rewrite instructions
  voiceSettings: VoiceSettings;
  ttsRouting: string; // e.g. "ElevenLabs", "Google Neural"
}
