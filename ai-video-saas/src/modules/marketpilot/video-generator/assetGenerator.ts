import { VideoScene } from "../video-planner/types/planner.types";
import { SceneAssetSpecification } from "./types/generator.types";
import { MotionStyleRegistry } from "../video-planner/motionDirector/motionStyleRegistry";

/**
 * High-quality commercial visual asset pools mapped by scene purpose / theme.
 * Uses existing asset router standards without reinventing AI image generation logic.
 */
const SCENE_BACKGROUND_POOLS: Record<string, string[]> = {
  hook: [
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1080&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1080&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1080&q=80",
  ],
  showcase: [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1080&q=80",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1080&q=80",
    "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1080&q=80",
  ],
  benefit: [
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1080&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1080&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1080&q=80",
  ],
  social_proof: [
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1080&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1080&q=80",
  ],
  cta: [
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1080&q=80",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1080&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1080&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1080&q=80",
  ],
};

const PRODUCT_IMAGE_POOL: string[] = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1080&q=80",
];

export class AssetGenerator {
  /**
   * Generates or maps high-fidelity visual assets for each scene in the VideoPlan.
   * Uses real uploaded user assets when available, removing fallback demo images.
   */
  public static async generateSceneAssets(
    scenes: VideoScene[],
    aspectRatio: string = "9:16",
    mediaUrls?: string[]
  ): Promise<SceneAssetSpecification[]> {
    const validMedia = (mediaUrls || []).filter((url) => Boolean(url));

    return scenes.map((scene, index) => {
      const purposeKey = scene.purpose.toLowerCase();

      if (validMedia.length > 0) {
        const bgImage = scene.backgroundImageUrl || validMedia[index % validMedia.length];
        const prodImage = scene.productImageUrl || validMedia[(index + 1) % validMedia.length];
        const supportingVisuals = scene.supportingVisualUrls || [
          validMedia[(index + 2) % validMedia.length],
        ];

        let animationStyle = scene.animationStyle || "ken-burns-in";
        let transition = scene.transition || "cut";
        
        if (scene.motionMetadata) {
          const styleDef = MotionStyleRegistry.getStyleByMovement(scene.motionMetadata.movement);
          if (styleDef) {
            animationStyle = styleDef.renderMapping.animationStyle;
            transition = styleDef.renderMapping.transition;
          }
        }

        return {
          sceneNumber: scene.sceneNumber,
          backgroundImageUrl: bgImage,
          productImageUrl: prodImage,
          supportingVisualUrls: supportingVisuals,
          textOverlay: scene.textOverlay || `Scene ${scene.sceneNumber}`,
          animationStyle,
          transition,
        };
      }

      const pool =
        SCENE_BACKGROUND_POOLS[purposeKey] || SCENE_BACKGROUND_POOLS.default;

      // Select deterministic visual based on scene number
      const bgImage = scene.backgroundImageUrl || pool[index % pool.length];
      const prodImage = scene.productImageUrl || (
        index === 1 || purposeKey === "showcase"
          ? PRODUCT_IMAGE_POOL[index % PRODUCT_IMAGE_POOL.length]
          : undefined
      );

      const supportingVisuals = [
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
      ];

      let animationStyle = scene.animationStyle || "ken-burns-in";
      let transition = scene.transition || "cut";
      
      if (scene.motionMetadata) {
        const styleDef = MotionStyleRegistry.getStyleByMovement(scene.motionMetadata.movement);
        if (styleDef) {
          animationStyle = styleDef.renderMapping.animationStyle;
          transition = styleDef.renderMapping.transition;
        }
      }

      return {
        sceneNumber: scene.sceneNumber,
        backgroundImageUrl: bgImage,
        productImageUrl: prodImage,
        supportingVisualUrls: supportingVisuals,
        textOverlay: scene.textOverlay || `Scene ${scene.sceneNumber}`,
        animationStyle,
        transition,
      };
    });
  }
}
