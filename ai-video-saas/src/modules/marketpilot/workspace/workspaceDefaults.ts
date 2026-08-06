import { Workspace } from "./types/workspace.types";

export class WorkspaceDefaults {
  public static applyDefaults(workspace: Partial<Workspace>): Workspace {
    const isIndividual = workspace.type === "individual";
    
    return {
      id: workspace.id || `ws_${Date.now()}`,
      ownerId: workspace.ownerId || "default_owner",
      workspaceName: workspace.workspaceName || (isIndividual ? "My Creator Workspace" : "Company Workspace"),
      type: workspace.type || "individual",
      industry: workspace.industry || (isIndividual ? "creator" : undefined),
      country: workspace.country || "Global",
      language: workspace.language || "English",
      brandProfileIds: workspace.brandProfileIds || [],
      workspaceSettings: {
        defaultVisualMode: workspace.workspaceSettings?.defaultVisualMode || (isIndividual ? "standard" : "hybrid_ai"),
        defaultVoiceMode: workspace.workspaceSettings?.defaultVoiceMode || (isIndividual ? "individual_creator" : "business_industry"),
        defaultAvatarMode: workspace.workspaceSettings?.defaultAvatarMode || "none"
      },
      createdAt: workspace.createdAt || new Date().toISOString(),
      updatedAt: workspace.updatedAt || new Date().toISOString(),
    };
  }
}
