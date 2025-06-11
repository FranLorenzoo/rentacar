import { AIMessage } from "@langchain/core/messages";

import { leadQualifierChain } from "./lead-qualifier.js";

import {
  typedUi,
  uiMessageReducer,
} from "@langchain/langgraph-sdk/react-ui/server";
import type { Auto } from "./types.js";
import { obtenerAutosDisponiblesParaAlquilar } from "./tools.js";
import {
  Annotation,
  LangGraphRunnableConfig,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";

import { LeadQualifierSchema } from "./types.js";

import { ConfigurationSchema, ensureConfiguration } from "./configuration.js";

import { loadChatModel } from "./utils.js";

interface ObtenerAutosArgs {
  fechaInicio: string;
  fechaFin: string;
  tipoAuto: "auto" | "camioneta" | "SUV" | "familiar" | "económico";
  cantidadPasajeros: number;
}

// Definamos un state para el workflow
const stateGraph = Annotation.Root({
  ...MessagesAnnotation.spec,
  cars: Annotation<Auto[]>,
  leadQualifier: Annotation<LeadQualifierSchema>,
  ui: Annotation({ reducer: uiMessageReducer, default: () => [] }),
});

const tools = [obtenerAutosDisponiblesParaAlquilar ];

const configuration = ensureConfiguration({
  configurable: { model: "gpt-4o" },
});
const model = (await loadChatModel(configuration.model)).bindTools(tools);

// Define la función que llama al modelo
async function callModel(
  state: typeof stateGraph.State
  // config: RunnableConfig
): Promise<typeof stateGraph.Update> {
  /** Llama al LLM de nuestro agente. **/

  const response = await model.invoke([
    {
      role: "system",
      content: configuration.systemPromptTemplate.replace(
        "{system_time}",
        new Date().toISOString()
      ),
    },
    ...state.messages,
  ]);

  // Retonarmos una lista, porque esto se agregara a la lista existente
  return { messages: [...state.messages, response] };
}

// Define la función que determina si continuar o no
function routeModelOutput(state: typeof stateGraph.State): string {
  const { messages } = state;

  const lastMessage = messages[messages.length - 1];
  // Si hay llamada a herramientas ingresa por ahi
  if ((lastMessage as AIMessage)?.tool_calls?.length || 0 > 0) {
    return "tools";
  }
  // De otra manera termina el graph
  else {
    return "__end__";
  }
}

const toolNode = async (
  state: typeof stateGraph.State,
  config: LangGraphRunnableConfig
) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1] as AIMessage;
  const ui = typedUi(config);

  if (lastMessage && lastMessage.tool_calls) {
    const toolArgs = lastMessage.tool_calls[0].args as ObtenerAutosArgs;

    const response = await obtenerAutosDisponiblesParaAlquilar.invoke(toolArgs);
    if (response && response.cars.length > 0) {
      console.log("lastMessage.id: ", lastMessage.id);

      const metadata = {
        message_id: lastMessage.id, // Aseguramos que el id del mensaje sea el correcto
      };

      ui.push(
        {
          name: "carCarousel",
          props: { cars: response.cars, user: { nombre: "Mariano" } },
          metadata: {
            ...metadata, // Aseguramos que el id del mensaje sea el correcto
          },
        },
        { merge: true, message: lastMessage }
      );

      console.log("ui.items: ", ui.items);

      return { ui: ui.items, messages: [...messages, response.message] };
    }
  }

  // Si no hay tool call, retornamos el estado actual
  return {
    ui: ui.items,
    messages: [...messages],
  };
};

const leadQualifierNode = async (state: typeof stateGraph.State) => {
  const { messages, leadQualifier } = state;

  console.log("Lead Qualifier , calificado: ", leadQualifier);

  if (leadQualifier && leadQualifier.calificado)
    return {
      messages: [...messages],
    };

  if (messages.length === 0)
    return {
      messages: [...messages],
    };

  try {
    console.log("Calificando lead...");

    const result = await leadQualifierChain.invoke({
      messages: messages,
    });

    console.log(
      `📊 Lead calificado - Score: ${result.score}/10, Calificado: ${result.calificado}`
    );
    console.log(`💡 Razón: ${result.razon}`);
    console.log(`🎯 Siguiente acción: ${result.siguiente_accion}`);

    return {
      leadQualifier: result,
      messages: [...messages],
    };
  } catch (error) {
    console.error("Error al calificar lead:", error);
    return {
      messages: [...messages],
      leadQualification: {
        score: 1,
        calificado: false,
        razon: "Error en el sistema de calificación",
        siguiente_accion: "Contactar soporte técnico",
      },
    };
  }
};

// const itemsNode = (state: typeof stateGraph.State, config:LangGraphRunnableConfig) => {
//     const { messages, cars } = state;
//   // Aca se puede customizar prompt, modelo y logica

//   const ui = typedUi(config);

//   console.log("id lastMessage: ", messages[messages.length - 1].id);
//   console.log("last message: ", messages[messages.length - 1].getType());

//   // TODO: Pasar bien el id del mensaje, estoy manejando mal el id del mensaje de tool
//   if(cars && cars.length > 0) {
//     ui.push(
//         {
//         name: "carCarousel",
//         props: { cars, user: { nombre: "Mariano"}},
//         metadata: {
//           message_id: messages[messages.length - 1].id,
//         }
//       },

//       { message: messages[messages.length - 1] },
//     )
//   }

//   return {ui:ui.items , messages:[...messages]}

// }

// https://langchain-ai.github.io/langgraphjs/concepts/low_level/#messagesannotation
const workflow = new StateGraph(stateGraph, ConfigurationSchema)

  .addNode("callModel", callModel)
  .addNode("tools", toolNode)
  .addNode("leadQualifierNode", leadQualifierNode)
  .addEdge("__start__", "leadQualifierNode")
  .addEdge("leadQualifierNode", "callModel")
  .addConditionalEdges("callModel", routeModelOutput, ["tools", "__end__"])
  .addEdge("tools", "callModel");

export const graph = workflow.compile({
  interruptBefore: [], // if you want to update the state before calling the tools
  interruptAfter: [],
});
