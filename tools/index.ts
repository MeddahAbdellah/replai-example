import { z } from "zod";
import { fetchCv } from "./src/fetch-cv.js";
import { clickOnButtonThatContainsText } from "./src/click-on-button-that-contains-text.js";
import { takeScreenShot } from "./src/take-screenshot.js";
import { openPage } from "./src/open-page.js";
import { openBrowser } from "./src/open-browser.js";
import { closeBrowser } from "./src/close-browser.js";
import { visualizeTaggedPage } from "./src/visualize-tagged-page.js";
import { clickOnElementWithId } from "./src/click-on-element-with-id.js";
import {
  writeToElementWithId,
  writeToElementWithIdSchema,
} from "./src/write-to-element-with-id.js";

export const getCvDocumentTool = {
  func: fetchCv,
  fields: {
    name: "getCvDocument",
    description: "Call to get the CV document in text",
    schema: z.void(),
  },
};

export const clickOnButtonThatContainsTextTool = {
  func: clickOnButtonThatContainsText,
  fields: {
    name: "clickOnButtonThatContainsText",
    description: "Call to click on a button that contains a certain text.",
    schema: z.string().describe("The text in the button to be clicked on"),
  },
};

export const visualizeTaggedPageTool = {
  func: visualizeTaggedPage,
  fields: {
    name: "visualizeTaggedPage",
    description: `Call to visualize the page with the clickable elements tagged with ids (html ids) that you can use later to click on them.
there is no output, this will make the user send you the screenshot with the tagged elements`,
    schema: z.void(),
  },
};

export const clickOnElementWithIdTool = {
  func: clickOnElementWithId,
  fields: {
    name: "clickOnElementWithId",
    description: `Call to only click on an element with a specific id.`,
    schema: z.string().describe("The id of the element to click on"),
  },
};

export const writeToElementWithIdTool = {
  func: writeToElementWithId,
  fields: {
    name: "writeToElementWithId",
    description: `Call to write something to an element with a specific id.`,
    schema: writeToElementWithIdSchema,
  },
};

export const takeScreenShotTool = {
  func: takeScreenShot,
  fields: {
    name: "takeScreenShot",
    description:
      "Call to take the screenshot of the current page. there is no output, but it will make the user send you the screenshot",
    schema: z.void(),
  },
};

export const openBrowserTool = {
  func: openBrowser,
  fields: {
    name: "openBrowser",
    description:
      "Call to open a browser (must be called before trying to open a page)",
    schema: z.void(),
  },
};

export const closeBrowserTool = {
  func: closeBrowser,
  fields: {
    name: "closeBrowser",
    description:
      "Call to close a browser, must be called at the end to not leave the browser running.",
    schema: z.void(),
  },
};

export const openPageTool = {
  func: openPage,
  fields: {
    name: "openPage",
    description:
      "Call to open a page and navigate to a specific URL in the browser",
    schema: z.string().url().describe("The URL to open"),
  },
};
