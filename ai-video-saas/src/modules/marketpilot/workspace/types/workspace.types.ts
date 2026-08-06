import { VisualMode, VoiceMode, AvatarMode } from "../../campaign-profile/types/campaign.types";

export interface WorkspaceSettings {
  defaultVisualMode?: VisualMode;
  defaultVoiceMode?: VoiceMode;
  defaultAvatarMode?: AvatarMode;
}

export interface Workspace {
  id?: string;
  ownerId?: string;
  workspaceName: string;
  type: "individual" | "business";
  industry?: string;
  country?: string;
  language?: string;
  brandProfileIds?: string[];
  workspaceSettings?: WorkspaceSettings;
  createdAt?: string;
  updatedAt?: string;
}
