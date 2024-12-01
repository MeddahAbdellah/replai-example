import { ElementHandle, Page } from "puppeteer";
import z from "zod";
import path from "path";
import { wait } from "./wait.js";
import { ToolContext } from "replai";

export const writeInputSchema = z
  .object({})
  .catchall(
    z
      .union([z.string(), z.boolean(), z.number()])
      .describe("The value to write to the input"),
  )
  .describe(
    "An object which keys are the ids of the HTML input, and values are the values that the HTML inputs should be filled with.",
  );

export async function writeToInputs(
  context: ToolContext<{ page: Page }>,
  elementsToFill: z.infer<typeof writeInputSchema>,
) {
  const { page } = context.getContext();
  const elementsToFillHandles = Object.entries(
    elementsToFill as Record<string, string>,
  )
    .map(([key, value]: [string, string]) => [
      `#${key.replace(/\./g, "\\.")}`,
      value,
    ])
    .map(async ([selector, value]) => {
      const handle = await page.$(selector);
      if (!handle) {
        console.log("Element not found: ", selector);
        return undefined;
      }
      const tagName = await page.$eval(selector, (el: any) =>
        el.tagName.toLowerCase(),
      );
      const type = await page.$eval(selector, (el: any) =>
        (el as HTMLInputElement).type?.toLowerCase(),
      );
      return {
        handle,
        tagName,
        type,
        value,
        id: selector.replace("#", ""),
      };
    });
  const elementsHandles = (await Promise.all(elementsToFillHandles)).filter(
    (e: any) => !!e,
  );
  await wait(2000);
  for (let element of elementsHandles) {
    if (!element) {
      continue;
    }

    const inputElement = element.handle as ElementHandle<HTMLInputElement>;
    const tagName = element.tagName;
    const type = element.type;
    const value = element.value;
    if (value === "file_input" && type !== "file") {
      continue;
    }

    if (type === "file") {
      await inputElement.uploadFile(path.resolve("./cv_ds.pdf"));
    } else if (tagName === "select") {
      await inputElement.select(value);
    } else if (
      tagName === "textarea" ||
      type === "text" ||
      type === "email" ||
      type === "password"
    ) {
      await inputElement.evaluate((el) => (el.value = ""));
      await inputElement.type(value);
    } else if (type === "checkbox" || type === "radio") {
      const isChecked = await inputElement.evaluate((el) => el.checked);
      if (isChecked !== (value === "true")) {
        await inputElement.click();
        await inputElement.evaluate((el, value) => (el.value = value), value);
      }
    } else {
      await inputElement.evaluate((el, value) => (el.value = value), value);
    }
  }

  return "writing to inputs has been done successfully";
}
