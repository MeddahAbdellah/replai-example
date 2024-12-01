// import {
//   localSpawner,
//   toolsWithContext,
//   amqpPublisher,
//   restfulRunner,
//   postgresql,
//   consoleLogger,
//   evaluateTask,
// } from "replai";
// import {
//   getCvDocumentTool,
//   clickOnButtonThatContainsTextTool,
//   openBrowserTool,
//   closeBrowserTool,
//   openPageTool,
//   visualizeTaggedPageTool,
//   clickOnElementWithIdTool,
//   takeScreenShotTool,
// } from "./tools/index.js";

// import { agent } from "./src/agent.js";
// import { HumanMessage } from "@langchain/core/messages";

// await localSpawner({
//   identifier: "fill-form",
//   agentInvokeFactory: agent,
//   runner: restfulRunner({
//     port: 9999,
//     processor: await amqpPublisher({
//       queue: "fill-form",
//       amqpUrl: "amqp://localhost",
//     }),
//     logger: consoleLogger(),
//   }),
//   tools: toolsWithContext([
//     getCvDocumentTool,
//     clickOnButtonThatContainsTextTool,
//     openBrowserTool,
//     closeBrowserTool,
//     openPageTool,
//     visualizeTaggedPageTool,
//     clickOnElementWithIdTool,
//     takeScreenShotTool,
//   ]),
//   database: await postgresql({
//     connectionString:
//       "postgresql://postgres:langreplay@localhost:5434/postgres",
//   }),
//   messages: [
//     new HumanMessage(
//       `Fill inputs on this page: {targetUrl}, using the CV Document.
// Here are the steps to do it:
// 1 - Navigate to the page using the navigate tool.
// 2 - Check if there is a modal that's blocking the access to the form by using the takeScreenShot tool, usually a cookie button. Accept all cookies by clicking on the button to accept them using the clickOnButtonThatContainsText tool.
// 3 - Using the listInputs, get the list of inputs to fill.
// 4 - Using the getCvDocument, get the cv information.
// 5 - With that information, use the writeToInputs tool to write the correct values to the form (make sure the values are correct, if the input is a select, the value must be one that's available in website, if you don't find the corresponding information in the CV, put a random value).
// 6 - Find the submit button using the takeScreenShot tool, and with the clickOnButtonThatContainsText click on it.
// 7 - Using the takeScreenShot tool, check if the submit has been successful. If it hasn't and there have been errors, take them into account and go back to step 4 to fill the inputs with the right information until you're successful.

// ${evaluateTask({
//   successCriteria: "- If the form is successfully submitted.",
//   failureCriteria: `
//   - If you can't find or interact with the cookie acceptance button after 2 attempts
//   - If the list of inputs is empty or you can't interpret it after 2 attempts
//   - If you can't extract necessary information from the CV after 2 attempts
//   - If you've made 5 unsuccessful attempts to submit the form
// `,
//   needHumanHelpCriteria:
//     "- If you encounter any unexpected situation not covered by these instructions",
// })}
// `,
//     ),
//   ],
// });
