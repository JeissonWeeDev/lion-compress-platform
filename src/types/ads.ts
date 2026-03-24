export type AdProvider = "ethicalads" | "carbonads" | "none";

export type AdPlacementId = "sidebar" | "footer" | "results-bottom";

export type AdFallbackMode = "hidden" | "branding";

export interface AdPlacement {
  id: AdPlacementId;
  size: "small" | "medium" | "large";
  fallback: AdFallbackMode;
}

export interface AdConfig {
  provider: AdProvider;
  clientId: string;
  placements: AdPlacement[];
}

export interface AdAdapter {
  init(clientId: string): Promise<void>;
  render(containerId: string, placement: AdPlacement): Promise<void>;
  destroy(containerId: string): void;
  isLoaded(): boolean;
}
