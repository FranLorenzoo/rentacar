/**
 * Define the configurable parameters for the agent.
 */
import { Annotation } from "@langchain/langgraph";
import { SYSTEM_PROMPT_TEMPLATE } from "./prompts.js";
import { RunnableConfig } from "@langchain/core/runnables";

export const ConfigurationSchema = Annotation.Root({
  /**
   * El system prompt para ser usado por el agente
   */
  systemPromptTemplate: Annotation<string>,

  /**
   * El nombre del modelo a usar.
   */
  model: Annotation<string>,
});

export function ensureConfiguration(
  config: RunnableConfig
): typeof ConfigurationSchema.State {
  /**
   * Ensure the defaults are populated.
   */
  const configurable = config.configurable ?? {};
  return {
    systemPromptTemplate:
      configurable.systemPromptTemplate ?? SYSTEM_PROMPT_TEMPLATE,
    model: configurable.model ?? "claude-3-7-sonnet-latest",
  };
}
