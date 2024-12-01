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
import { CallbackHandler } from "langfuse-langchain";
import {
  getCvDocumentTool,
  clickOnButtonThatContainsTextTool,
  openBrowserTool,
  closeBrowserTool,
  openPageTool,
  visualizeTaggedPageTool,
  clickOnElementWithIdTool,
  takeScreenShotTool,
} from "./tools/index.js";
import { toolsWithContext, sqlite, lcReplayCallbackFactory } from "replai";

const langfuseLangchainHandler = new CallbackHandler({
  publicKey: "pk-lf-534fd2d5-0761-4e4d-964a-c36635dbd664",
  secretKey: "sk-lf-4de469c2-0969-46b1-81c2-783efe3e8063",
  baseUrl: "http://localhost:3000",
  flushAt: 1, // cookbook-only: do not batch events, send them immediately
});

const isScreenShotToolMessage = (
  message: BaseMessage,
): message is ToolMessage => {
  return message.name === "takeScreenShot";
};

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
      //debugger;
      return x.concat(newMessages);
    },
  }),
});

const tools = toolsWithContext([
  getCvDocumentTool,
  clickOnButtonThatContainsTextTool,
  openBrowserTool,
  closeBrowserTool,
  openPageTool,
  visualizeTaggedPageTool,
  clickOnElementWithIdTool,
  takeScreenShotTool,
]);
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
  //debugger;
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

const targetUrl =
  "https://careers.thalesgroup.com/global/en/apply?jobSeqNo=TGPTGWGLOBALR0235440EXTERNALENGLOBAL&source=WORKDAY&utm_source=linkedin&utm_medium=phenom-feeds&step=1";

const database = await sqlite();

await aiAgent.invoke(
  {
    messages: [
      new HumanMessage(
        `Fill inputs on this page: ${targetUrl}, using the CV Document.
Here are the steps to do it:
1 - Navigate to the page using the navigate tool.
2 - Check if there is a modal that's blocking the access to the form by using the takeScreenShot tool, usually a cookie button. Accept all cookies by clicking on the button to accept them using the clickOnButtonThatContainsText tool.
3 - Using the listInputs, get the list of inputs to fill.
4 - Using the getCvDocument, get the cv information.
5 - With that information, use the writeToInputs tool to write the correct values to the form (make sure the values are correct, if the input is a select, the value must be one that's available in website, if you don't find the corresponding information in the CV, put a random value).
6 - Find the submit button using the takeScreenShot tool, and with the clickOnButtonThatContainsText click on it.
7 - Using the takeScreenShot tool, check if the submit has been successful. If it hasn't and there have been errors, take them into account and go back to step 4 to fill the inputs with the right information until you're successful.

Important: If at any point you encounter a situation where you're unsure how to proceed, have made multiple unsuccessful attempts, or need additional information, say "I'm stuck" and ask for human help. Specifically:
- If you can't find or interact with the cookie acceptance button after 2 attempts
- If the list of inputs is empty or you can't interpret it after 2 attempts
- If you can't extract necessary information from the CV after 2 attempts
- If you've made 5 unsuccessful attempts to submit the form
- If you encounter any unexpected situation not covered by these instructions

When requesting human help, clearly explain the issue you're facing and what you've tried so far. in the following JSON format:
{
  "success": boolean,
  "issue": "The issue you're facing",
  "attempts": "The attempts you've made so far"
}

If you're successful, the success should be true, if you're not, the success should be false.
`,
      ),
    ],
  },
  {
    configurable: { thread_id: "42" },
    callbacks: [
      langfuseLangchainHandler,
      await lcReplayCallbackFactory({ database, runId: "index" }),
    ],
    recursionLimit: 50,
  },
);
