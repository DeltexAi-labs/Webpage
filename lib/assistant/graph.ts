import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import { retrieveContext, systemPrompt } from "@/lib/assistant/knowledge";

export type ChatTurn = { role: "user" | "assistant"; content: string };

/** Hard ceiling on the reply. The prompt also asks for brevity; this is the guarantee. */
export const MAX_ANSWER_TOKENS = 1000;

const AssistantState = Annotation.Root({
  question: Annotation<string>,
  history: Annotation<ChatTurn[]>({
    reducer: (_current, incoming) => incoming,
    default: () => [],
  }),
  context: Annotation<string>({
    reducer: (_current, incoming) => incoming,
    default: () => "",
  }),
  answer: Annotation<string>({
    reducer: (_current, incoming) => incoming,
    default: () => "",
  }),
});

function createModel() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  return new ChatGroq({
    apiKey,
    model: process.env.GROQ_CHAT_MODEL?.trim() || "llama-3.3-70b-versatile",
    temperature: 0.2,
    maxTokens: MAX_ANSWER_TOKENS,
  });
}

// Node 1: pull the reference material this question needs.
function retrieve(state: typeof AssistantState.State) {
  return { context: retrieveContext(state.question) };
}

// Node 2: answer strictly from that material.
async function respond(state: typeof AssistantState.State) {
  const model = createModel();

  const messages = [
    new SystemMessage(`${systemPrompt()}\n\nREFERENCE MATERIAL\n${state.context}`),
    ...state.history.slice(-6).map((turn) =>
      turn.role === "user" ? new HumanMessage(turn.content) : new AIMessage(turn.content),
    ),
    new HumanMessage(state.question),
  ];

  const reply = await model.invoke(messages);
  const answer = typeof reply.content === "string" ? reply.content : JSON.stringify(reply.content);

  return { answer: answer.trim() };
}

const workflow = new StateGraph(AssistantState)
  .addNode("retrieve", retrieve)
  .addNode("respond", respond)
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "respond")
  .addEdge("respond", END);

const app = workflow.compile();

/**
 * Yields the answer token by token as the model produces it. streamEvents surfaces the model's
 * own chunks from inside the graph, so the visitor sees text within a few hundred milliseconds
 * instead of waiting for the whole reply.
 */
export async function* streamAnswer(question: string, history: ChatTurn[] = []) {
  const events = app.streamEvents({ question, history }, { version: "v2" });

  for await (const event of events) {
    if (event.event !== "on_chat_model_stream") continue;

    const chunk = event.data?.chunk as { content?: unknown } | undefined;
    const text =
      typeof chunk?.content === "string"
        ? chunk.content
        : Array.isArray(chunk?.content)
          ? chunk.content
              .map((part) => (typeof part === "object" && part && "text" in part ? String(part.text) : ""))
              .join("")
          : "";

    if (text) yield text;
  }
}
