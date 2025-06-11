import { initChatModel } from "langchain/chat_models/universal";
import { Auto } from "./types.js"; // ajustá el path a tu interfaz
import { parseISO } from "date-fns";

/**
 * Carga un modelo de chat con el nombre especifico
 * @param fullySpecifiedName - String en el formato 'provider/model' o 'provider/account/provider/model'.
 * @returns Una promesa que resuelve a una instancia de BaseChatModel.
 */
export async function loadChatModel(
  fullySpecifiedName: string
): Promise<ReturnType<typeof initChatModel>> {
  const index = fullySpecifiedName.indexOf("/");
  if (index === -1) {
    // Si no hay "/", asumimos que es solo el modelo
    return await initChatModel(fullySpecifiedName);
  } else {
    const provider = fullySpecifiedName.slice(0, index);
    const model = fullySpecifiedName.slice(index + 1);
    return await initChatModel(model, { modelProvider: provider });
  }
}

/**
 * Obtiene el ID de la llamada a la herramienta especificada en los mensajes.
 * @param messages - Array de mensajes que contienen las llamadas a herramientas.
 * @param toolName - Nombre de la herramienta para la cual se desea obtener el ID de llamada.
 * @returns El ID de la llamada a la herramienta, o undefined si no se encuentra.
 */

export const getToolCallId = (messages: any[], toolName: string) => {
  const tool_call_id = messages
    .at(-1)
    ?.tool_calls.find((tool_call: any) => tool_call.name === toolName)?.id;

  return tool_call_id;
};

interface BuscarAutosParams {
  fechaInicio: string; // formato "YYYY-MM-DD"
  fechaFin: string;
  tipoAuto?: Auto["tipo"];
  cantidadPasajeros: number;
  maxResultados?: number;
}

export function buscarAutosSimilares(
  autos: Auto[],
  {
    fechaInicio,
    fechaFin,
    tipoAuto,
    cantidadPasajeros,
    maxResultados = 5,
  }: BuscarAutosParams
): Auto[] {
  const inicio = parseISO(fechaInicio);
  const fin = parseISO(fechaFin);

  const resultados: { auto: Auto; score: number }[] = [];

  for (const auto of autos) {
    // 1. Verificar si está activo
    if (!auto.activo) continue;

    // 2. Verificar disponibilidad en fecha
    const ocupado = auto.fechas_ocupado.some((rango) =>
      isOverlap(inicio, fin, parseISO(rango.inicio), parseISO(rango.fin))
    );
    if (ocupado) continue;

    // 3. Verificar cantidad de pasajeros
    if (auto.cantidad_pasajeros < cantidadPasajeros) continue;

      // 4. FILTRO ESTRICTO: Si se especifica un tipo, solo mostrar ese tipo
    if (tipoAuto ) {
      if (auto.tipo.toLowerCase() !== tipoAuto.toLowerCase()) continue;
    }

    // 4. Scoring: coincidencia exacta sube puntos
    let score = 0;
    if (auto.tipo === tipoAuto) score += 2;
    if (auto.cantidad_pasajeros === cantidadPasajeros) score += 1;

    resultados.push({ auto, score });
  }

  // 5. Ordenar por mejor coincidencia
  return resultados
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResultados)
    .map((r) => r.auto);
}

// Utilidad: verificar superposición de fechas
function isOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 <= end2 && start2 <= end1;
}
