import { ICinematicProvider } from "./cinematicProvider.interface";

export class CinematicProviderRegistry {
  private static providers: Map<string, ICinematicProvider> = new Map();
  private static defaultProviderName: string = "mock";

  /**
   * Registers a new cinematic provider.
   */
  public static registerProvider(provider: ICinematicProvider) {
    this.providers.set(provider.providerName, provider);
  }

  /**
   * Retrieves a provider by name. Falls back to default if not found.
   */
  public static getProvider(name?: string): ICinematicProvider {
    const targetName = name || this.defaultProviderName;
    const provider = this.providers.get(targetName);
    
    if (!provider) {
      const fallback = this.providers.get(this.defaultProviderName);
      if (!fallback) {
        throw new Error("No cinematic provider available, not even the default.");
      }
      return fallback;
    }
    return provider;
  }
}
