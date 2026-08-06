import { DBWorkspace } from "../types/database.types";

export class WorkspaceRepository {
  private static workspaces: Map<string, DBWorkspace> = new Map();

  public static async create(workspace: DBWorkspace): Promise<DBWorkspace> {
    this.workspaces.set(workspace.workspaceId, workspace);
    return workspace;
  }

  public static async findById(id: string): Promise<DBWorkspace | null> {
    return this.workspaces.get(id) || null;
  }

  public static async findByOwnerId(ownerId: string): Promise<DBWorkspace[]> {
    return Array.from(this.workspaces.values()).filter(ws => ws.ownerId === ownerId);
  }
}
