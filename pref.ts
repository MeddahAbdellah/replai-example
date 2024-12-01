import {
  simpleSpawner,
  toolsWithContext,
  amqpPublisher,
  restfulRunner,
  postgresql,
  consoleLogger,
  evaluateTask,
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
import { HumanMessage } from "@langchain/core/messages";

await simpleSpawner({
  runner: restfulRunner({
    port: 9999,
    processor: await amqpPublisher({
      queue: "pref",
      amqpUrl: "amqp://localhost",
    }),
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
    messages: [
      new HumanMessage(
        `I need you to find a way to get Titre de séjour in {pays} in Rueil-malmaison, and try to apply to it
  Here are the steps to do it:
  1 - Navigate to google.
  2 - accept cookies or whatever is blocking the access to the search bar.
  2 - Click on the search bar and write the appropriate query to find the website where you can apply for the Titre de séjour.
  3 - Click on the button to launch the search.
  4 - Click on the most relevant link.
  5 - Go into the website and fill the necessary form from the CV.
  
  ${evaluateTask({
    successCriteria: "- If the form is successfully submitted.",
    failureCriteria: `
    - you couldn't find the website where to apply.
    - you couldn't fill the form.
  `,
    needHumanHelpCriteria:
      "- there is a login page that you don't have credentials for.",
  })}
  Close the browser after you're done.
  `,
      ),
    ],
  }),
});
