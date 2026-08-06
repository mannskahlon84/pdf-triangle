import { DBBrandProfile } from "../types/database.types";

export class BrandRepository {
  private static brands: Map<string, DBBrandProfile> = new Map();

  public static async create(brand: DBBrandProfile): Promise<DBBrandProfile> {
    this.brands.set(brand.brandId, brand);
    return brand;
  }

  public static async findById(id: string): Promise<DBBrandProfile | null> {
    return this.brands.get(id) || null;
  }

  public static async findByWorkspaceId(workspaceId: string): Promise<DBBrandProfile[]> {
    return Array.from(this.brands.values()).filter(b => b.workspaceId === workspaceId);
  }
}
