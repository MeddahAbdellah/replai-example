import { Page } from "puppeteer";
import { ToolContext } from "replai";
import z from "zod";

export const writeToElementWithIdSchema = z.object({
  id: z.string().describe("The id of the element to write to"),
  text: z.string().describe("The text to write to the element"),
});

export async function writeToElementWithId(
  context: ToolContext<{ page: Page }>,
  element: z.infer<typeof writeToElementWithIdSchema>,
) {
  const { id, text } = element;
  const { page } = context.getContext();
  try {
    const clicked = await page.evaluate((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.click();
        return true;
      }
      return false;
    }, id);
    if (clicked === false) {
      return `Couldn't find an element with this id: ${id}`;
    }
    await page.keyboard.type(text);
    return "wrote successfully";
  } catch (e) {
    return `There was an error ${JSON.stringify(e)}`;
  }
}
