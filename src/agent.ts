import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver, Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  AgentInvokeFactoryConfig,
  AgentInvokeFn,
  AgentInvokeParams,
} from "replai";

const isScreenShotToolMessage = (
  message: BaseMessage,
): message is ToolMessage => {
  return (
    message.name === "takeScreenShot" || message.name === "visualizeTaggedPage"
  );
};

export async function agent(
  config: AgentInvokeFactoryConfig,
): Promise<AgentInvokeFn<BaseMessage, any>> {
  const { tools } = config;
  const GraphState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: (x, y) => {
        const newMessages = y.flatMap((newMessage) => {
          if (isScreenShotToolMessage(newMessage)) {
            const toolMessage = new ToolMessage({
              tool_call_id: newMessage.tool_call_id,
              name: newMessage.name,
              content: "The user is going to send you the screenshot",
            });

            const humanMessage = new HumanMessage({
              content: newMessage.content,
            });

            return [toolMessage, humanMessage];
          }
          return [newMessage];
        });
        debugger;
        return x.concat(newMessages);
      },
    }),
  });

  //@ts-ignore
  const toolNode = new ToolNode<typeof GraphState.State>(tools);

  const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0,
  }).bindTools(tools);

  async function shouldContinue(state: typeof GraphState.State) {
    const messagesPre = state.messages;
    const lastMessage = messagesPre[messagesPre.length - 1];
    if (state.messages.length > 30) {
      return "__end__";
    }

    if (lastMessage instanceof AIMessage && lastMessage.tool_calls?.length) {
      return "tools";
    }
    return "__end__";
  }

  async function callModel(state: typeof GraphState.State) {
    const messages = state.messages;
    const response = await model.invoke(messages);

    return { messages: [response] };
  }

  const workflow = new StateGraph(GraphState)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  const checkpointer = new MemorySaver();

  const aiAgent = workflow.compile({
    checkpointer,
  });

  return async ({ messages, replayCallback }: AgentInvokeParams<BaseMessage>) =>
    aiAgent.invoke(
      {
        messages,
      },
      {
        configurable: { thread_id: "42" },
        callbacks: [replayCallback as any],
        recursionLimit: 50,
      },
    );
}
