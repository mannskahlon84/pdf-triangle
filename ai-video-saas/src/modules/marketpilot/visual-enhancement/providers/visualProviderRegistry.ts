import { VisualEnhancementMode } from "../enhancement.types";
import { StandardVisualProvider } from "./standardVisualProvider";
import { IVisualProvider } from "./visualProvider.interface";

export class VisualProviderRegistry {
  private static providers: Map<string, IVisualProvider> = new Map();
  private static initialized = false;

  public static initialize(): void {
    if (this.initialized) return;
    const standard = new StandardVisualProvider();
    this.registerProvider(standard);
    this.initialized = true;
  }

  public static registerProvider(provider: IVisualProvider): void {
    this.providers.set(provider.name, provider);
  }

  public static getProvider(
    mode: VisualEnhancementMode,
    preferredName?: string
  ): IVisualProvider {
    this.initialize();

    if (preferredName && this.providers.has(preferredName)) {
      const provider = this.providers.get(preferredName)!;
      if (provider.supportedModes.includes(mode)) {
        return provider;
      }
    }

    // Default to StandardVisualProvider for standard and hybrid_ai modes
    const defaultProvider = this.providers.get("standard-local-provider");
    if (defaultProvider && defaultProvider.supportedModes.includes(mode)) {
      return defaultProvider;
    }

    // For cinematic_ai mode or fallback, return standard provider placeholder interface
    return (
      defaultProvider ||
      new StandardVisualProvider()
    );
  }

  public static listProviders(): IVisualProvider[] {
    this.initialize();
    return Array.from(this.providers.values());
  }
}
