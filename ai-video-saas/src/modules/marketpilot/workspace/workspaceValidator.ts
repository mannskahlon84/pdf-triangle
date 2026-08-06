import { Workspace } from "./types/workspace.types";

export class WorkspaceValidator {
  public static validate(workspace: Workspace): boolean {
    if (!workspace.workspaceName) {
      throw new Error("Workspace must have a name.");
    }
    if (workspace.type === "business" && !workspace.industry) {
      throw new Error("Business workspaces must specify an industry.");
    }
    return true;
  }
}
