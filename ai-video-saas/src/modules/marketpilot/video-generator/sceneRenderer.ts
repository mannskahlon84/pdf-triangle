import { VideoScene } from "../video-planner/types/planner.types";
import { SceneAssetSpecification } from "./types/generator.types";

export interface SceneRenderConfig {
  sceneNumber: number;
  layoutMode: "PIP" | "ALTERNATING" | "FULLSCREEN";
  aspectRatio: string;
  visualLayer: {
    bgUrl: string;
    productUrl?: string;
    animation: string;
  };
  textOverlayLayer: {
    text: string;
    position: "bottom" | "center" | "top";
    fontSize: string;
  };
  transitionLayer: {
    inTransition: string;
    durationMs: number;
  };
}

export class SceneRenderer {
  /**
   * Prepares compositor frame configuration for a given scene.
   */
  public static prepareSceneRenderConfig(
    scene: VideoScene,
    asset: SceneAssetSpecification,
    aspectRatio: string = "9:16"
  ): SceneRenderConfig {
    const isHook = scene.purpose.toLowerCase() === "hook";
    const layoutMode = isHook ? "PIP" : "ALTERNATING";

    return {
      sceneNumber: scene.sceneNumber,
      layoutMode,
      aspectRatio,
      visualLayer: {
        bgUrl: asset.backgroundImageUrl,
        productUrl: asset.productImageUrl,
        animation: asset.animationStyle,
      },
      textOverlayLayer: {
        text: asset.textOverlay,
        position: isHook ? "center" : "bottom",
        fontSize: isHook ? "32px" : "24px",
      },
      transitionLayer: {
        inTransition: asset.transition,
        durationMs: 400,
      },
    };
  }

  public static prepareAllScenes(
    scenes: VideoScene[],
    assets: SceneAssetSpecification[],
    aspectRatio: string
  ): SceneRenderConfig[] {
    return scenes.map((sc, i) =>
      this.prepareSceneRenderConfig(sc, assets[i] || assets[0], aspectRatio)
    );
  }
}
