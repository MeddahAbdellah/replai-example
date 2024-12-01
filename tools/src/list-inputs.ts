import { Browser, Page } from "puppeteer";
import { wait } from "./wait.js";
import { ToolContext } from "replai";

export async function listInputs(
  context: ToolContext<{ browser: Browser; page: Page }>,
) {
  const { browser, page } = context.getContext();
  try {
    const focusableElements: any[] = [];
    const typableInputLikeElementTags = ["input", "textarea", "select"];
    const maxIterations = 100;
    let iterations = 0;

    while (iterations < maxIterations) {
      iterations++;
      await page.keyboard.press("Tab");
      const element = await page.evaluate(() => {
        const typableInputLikeElementTags = ["input", "textarea", "select"];
        const inputLikeElementTags = [
          ...typableInputLikeElementTags,
          "datalist",
          "output",
          "progress",
          "meter",
        ];
        const el = document.activeElement;
        if (el && "value" in el && (el.value as string)?.length > 0) {
          return undefined;
        }
        if (
          !el ||
          !inputLikeElementTags.includes(el.tagName.toLocaleLowerCase())
        ) {
          return undefined;
        }
        el.scrollIntoView();
        const id = `element-${crypto.randomUUID()}`;
        const revisited = el.id && el.id.includes("element-");
        if (!revisited) {
          el.id = id;
        }
        return {
          id,
          tagName: el.tagName,
          type: (el as HTMLInputElement).type,
          outerHTML: el.outerHTML,
          revisited,
        };
      });

      if (element?.revisited) {
        break;
      }

      if (!element) {
        continue;
      }

      if (element) {
        focusableElements.push(element);
      }
    }
    const elementHandles = await Promise.all(
      focusableElements.map(async (element) => {
        const handle = await page.$(`#${element.id}`);
        return {
          ...element,
          handle,
        };
      }),
    );

    const finalElements: any[] = [];
    for (let i = 0; i < elementHandles.length; i++) {
      const element = elementHandles[i];
      const handle = elementHandles[i].handle;
      if (!handle) {
        continue;
      }
      if (
        typableInputLikeElementTags.includes(
          element.tagName.toLocaleLowerCase(),
        ) &&
        element.type !== "file"
      ) {
        await handle.click();
        await handle.focus();
        await page.keyboard.press("Space");
        await page.keyboard.press("Delete");
        await wait(500);
      }
      const focusableElement = { ...element };
      finalElements.push(focusableElement);
    }
    const elementsMessages = finalElements.flatMap((element) => [
      {
        type: "text",
        text: element.outerHTML,
      },
    ]);
    return elementsMessages;
  } catch (e) {
    browser.close();
    return e;
  }
}
