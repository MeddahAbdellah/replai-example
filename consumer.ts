// import {
//   localSpawner,
//   toolsWithContext,
//   amqpRunner,
//   postgresql,
//   consoleLogger,
// } from "replai";
// import {
//   openBrowserTool,
//   closeBrowserTool,
//   openPageTool,
//   visualizeTaggedPageTool,
//   getCvDocumentTool,
//   clickOnButtonThatContainsTextTool,
//   clickOnElementWithIdTool,
//   takeScreenShotTool,
// } from "./tools/index.js";

// import { agent } from "./src/agent.js";

// await localSpawner({
//   identifier: "fill-form",
//   runner: amqpRunner({
//     queue: "fill-form",
//     amqpUrl: "amqp://localhost",
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
//   agentInvokeFactory: agent,
// });
