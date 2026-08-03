import { SceneTemplateDefinition } from "./types/planner.types";
import { getSceneTemplateForIndustry, SCENE_TEMPLATES } from "./templates";

export class SceneTemplatesService {
  public static getTemplateById(templateId: string): SceneTemplateDefinition | undefined {
    return SCENE_TEMPLATES[templateId];
  }

  public static resolveTemplate(industry: string, goal?: string): SceneTemplateDefinition {
    return getSceneTemplateForIndustry(industry, goal);
  }

  public static listAllTemplates(): SceneTemplateDefinition[] {
    return Object.values(SCENE_TEMPLATES);
  }
}
