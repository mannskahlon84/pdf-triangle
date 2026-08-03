import { AnimationStyle, TransitionStyle } from "./types/planner.types";

export class TransitionPlanner {
  private static defaultTransitions: TransitionStyle[] = [
    "zoom-in",
    "whip-pan",
    "slide-left",
    "fade",
    "cut",
  ];

  private static defaultAnimations: AnimationStyle[] = [
    "ken-burns-in",
    "kinetic-text",
    "3d-float",
    "ken-burns-out",
    "static-highlight",
  ];

  public static getTransitionForScene(
    sceneIndex: number,
    preferred?: TransitionStyle
  ): TransitionStyle {
    if (preferred) return preferred;
    return this.defaultTransitions[sceneIndex % this.defaultTransitions.length];
  }

  public static getAnimationForScene(
    sceneIndex: number,
    preferred?: AnimationStyle
  ): AnimationStyle {
    if (preferred) return preferred;
    return this.defaultAnimations[sceneIndex % this.defaultAnimations.length];
  }

  public static applyTransitionRules(
    sceneCount: number
  ): { transition: TransitionStyle; animation: AnimationStyle }[] {
    const list: { transition: TransitionStyle; animation: AnimationStyle }[] = [];
    for (let i = 0; i < sceneCount; i++) {
      list.push({
        transition: this.getTransitionForScene(i),
        animation: this.getAnimationForScene(i),
      });
    }
    return list;
  }
}
