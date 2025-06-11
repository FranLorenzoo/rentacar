import type { Auto } from "./types.js";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import {ToolMessage} from "@langchain/core/messages";
import { getToolCallId } from "./utils.js";
import { buscarAutosSimilares } from "./utils.js";
import { loadJsonFromAgent } from "../utils/loadJsonFromAgent.js";
import { graph } from "./graph.js";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const autosDisponibles: Auto[] = loadJsonFromAgent("docs/autos.json");

export const obtenerAutosDisponiblesParaAlquilar = tool(
  async (
    { fechaInicio, fechaFin, tipoAuto, cantidadPasajeros },
    config: LangGraphRunnableConfig
  ) => {
    const state = await graph.getState({
      configurable: { thread_id: config.configurable?.thread_id },
    });

    const { messages } = state.values;

    const tool_call_id = getToolCallId(
      messages,
      "obtenerAutosDisponiblesParaAlquilar"
    );

    if (!tool_call_id) {
      return {message: new ToolMessage("No se pudo encontrar el ID de la llamada a la herramienta.", "123" , "obtenerAutosDisponiblesParaAlquilar") , cars:[]};
    }

    

    const autosSugeridos = buscarAutosSimilares(autosDisponibles, {
      fechaInicio,
      fechaFin,
      tipoAuto,
      cantidadPasajeros,
    });

    if (!autosSugeridos || autosSugeridos.length === 0) {
      return {
        message:
          new ToolMessage("No se encontraron autos disponibles para alquilar con los criterios especificados.", tool_call_id, "obtenerAutosDisponiblesParaAlquilar"),
        cars: [],
      };
    }

    const message = `
    Hemos encontrado ${autosSugeridos.length} autos disponibles para alquilar:
    ${JSON.stringify(autosSugeridos, null, 2)}
    Por favor verificar si estos autos cumplen con tus requerimientos.`;

    return {
      message: new ToolMessage(message, tool_call_id, "obtenerAutosDisponiblesParaAlquilar"),
      cars: autosSugeridos,
    };
  },
  {
    name: "obtenerAutosDisponiblesParaAlquilar",
    description:
      "Herramienta para obtener los autos disponibles para alquilar, según los requerimientos del usuario.",
    schema: z.object({
      fechaInicio: z
        .string()
        .describe("Fecha de inicio del alquiler en formato YYYY-MM-DD."),
      fechaFin: z
        .string()
        .describe("Fecha de fin del alquiler en formato YYYY-MM-DD."),
      tipoAuto: z
        .enum(["auto", "camioneta", "SUV", "familiar", "económico"])
        .describe(
          "Tipo de auto preferido, esto puede ser opcional, el usuario puede pedir un tipo en particular o puede quedar abierto a cualquier tipo de auto disponible."
        ),
      cantidadPasajeros: z
        .number()
        .describe(
          "Cantidad de pasajeros que van a viajar en el auto, ésta información debe ser brindada por el usuario, entre 1 y 7 pasajeros son posibles, según la disponibilidad de autos."
        ),
    }),
  }
);
