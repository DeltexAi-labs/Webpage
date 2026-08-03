import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import { fenceUntrusted, inspectForInjection, scrubChunk, INJECTION_REFUSAL } from "@/lib/assistant/guard";
import { retrieveContext, systemPrompt } from "@/lib/assistant/knowledge";

export type ChatTurn = { role: "user" | "assistant"; content: string };

/**
 * Hard ceiling on the reply. The prompt asks for at most 180 words (~260 tokens), so 700 is
 * generous headroom — and the provider counts the requested ceiling against the per-minute token
 * budget, so asking for less keeps the assistant available under bursts.
 */
export const MAX_ANSWER_TOKENS = 700;

/** Turns kept verbatim. Enough for a multi-step conversation without unbounded prompt growth. */
export const HISTORY_TURNS = 12;

/** Characters of history sent to the model, oldest dropped first. */
const HISTORY_CHAR_BUDGET = 6000;

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
  refusal: Annotation<string>({
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

/** Keeps the most recent turns that fit the budget, never splitting a turn in half. */
function trimHistory(history: ChatTurn[]) {
  const kept: ChatTurn[] = [];
  let used = 0;

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const turn = history[index];
    if (used + turn.content.length > HISTORY_CHAR_BUDGET) break;
    used += turn.content.length;
    kept.unshift(turn);
  }

  return kept.slice(-HISTORY_TURNS);
}

// Node 1: screen the question before anything else looks at it.
function guard(state: typeof AssistantState.State) {
  const report = inspectForInjection(state.question);
  return report.suspicious ? { refusal: INJECTION_REFUSAL } : { refusal: "" };
}

// Node 2: pull reference material, using recent turns to resolve follow-ups.
function retrieve(state: typeof AssistantState.State) {
  const recent = trimHistory(state.history).map((turn) => turn.content);
  return { context: retrieveContext(state.question, recent) };
}

// Node 3: answer strictly from that material.
async function respond(state: typeof AssistantState.State) {
  const model = createModel();
  const history = trimHistory(state.history);

  const messages = [
    new SystemMessage(`${systemPrompt()}\n\n${fenceUntrusted(state.context)}`),
    ...history.map((turn) =>
      turn.role === "user" ? new HumanMessage(turn.content) : new AIMessage(turn.content),
    ),
    new HumanMessage(state.question),
  ];

  await model.invoke(messages);
  return {};
}

function afterGuard(state: typeof AssistantState.State) {
  return state.refusal ? END : "retrieve";
}

const workflow = new StateGraph(AssistantState)
  .addNode("guard", guard)
  .addNode("retrieve", retrieve)
  .addNode("respond", respond)
  .addEdge(START, "guard")
  .addConditionalEdges("guard", afterGuard, { [END]: END, retrieve: "retrieve" })
  .addEdge("retrieve", "respond")
  .addEdge("respond", END);

const app = workflow.compile();

/**
 * Yields the answer token by token as the model produces it. streamEvents surfaces the model's
 * own chunks from inside the graph, so the visitor sees text within a few hundred milliseconds
 * instead of waiting for the whole reply.
 */
export async function* streamAnswer(question: string, history: ChatTurn[] = []) {
  const screened = inspectForInjection(question);
  if (screened.suspicious) {
    yield INJECTION_REFUSAL;
    return;
  }

  const events = app.streamEvents({ question: screened.clean, history }, { version: "v2" });

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

    // Cheap per-chunk scrub. Must not trim: the spaces inside a token are the spaces between words.
    const safe = scrubChunk(text);
    if (safe) yield safe;
  }
}
