import { Page } from "puppeteer";
import { ToolContext } from "replai";

export async function clickOnElementWithId(
  context: ToolContext<{
    page: Page;
  }>,
  id: string,
) {
  const { page } = context.getContext();
  try {
    return await page.evaluate((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.click();
        return "Clicked successfully";
      }
      return "Failed to click";
    }, id);
  } catch (e) {
    return `There was an error ${JSON.stringify(e)}`;
  }
}
