import { BrandProfile } from "./types/brand.types";

export class BrandValidator {
  public static validate(profile: BrandProfile): boolean {
    if (!profile.brandName) {
      throw new Error("BrandProfile must specify a brandName.");
    }
    if (!profile.industry) {
      throw new Error("BrandProfile must specify an industry.");
    }
    return true;
  }
}
