import {
  simpleSpawner,
  toolsWithContext,
  amqpRunner,
  postgresql,
  consoleLogger,
  lcReplayCallbackFactory,
} from "replai";
import {
  getCvDocumentTool,
  clickOnButtonThatContainsTextTool,
  openBrowserTool,
  closeBrowserTool,
  openPageTool,
  visualizeTaggedPageTool,
  clickOnElementWithIdTool,
  takeScreenShotTool,
  writeToElementWithIdTool,
} from "./tools/index.js";

import { agent } from "./src/agent.js";

await simpleSpawner({
  runner: amqpRunner({
    queue: "pref",
    amqpUrl: "amqp://localhost",
    agentInvokeFactory: agent,
    logger: consoleLogger(),
    replayCallbackFactory: lcReplayCallbackFactory,
    tools: toolsWithContext([
      getCvDocumentTool,
      clickOnButtonThatContainsTextTool,
      openBrowserTool,
      closeBrowserTool,
      openPageTool,
      visualizeTaggedPageTool,
      clickOnElementWithIdTool,
      takeScreenShotTool,
      writeToElementWithIdTool,
    ]),
    database: await postgresql({
      connectionString:
        "postgresql://postgres:langreplay@localhost:5434/postgres",
    }),
  }),
});
