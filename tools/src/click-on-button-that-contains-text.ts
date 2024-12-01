import { Page } from "puppeteer";
import { ToolContext } from "replai";

export async function clickOnButtonThatContainsText(
  context: ToolContext<{ page: Page }>,
  text: string,
) {
  const { page } = context.getContext();
  try {
    const status = await page.evaluate((text: any) => {
      const buttons = [...document.querySelectorAll("button, input")].filter(
        (e) => !!e,
      );
      const button = buttons.find((btn) => btn?.textContent?.includes(text));
      if (button) {
        //@ts-ignore
        button.click();
        return true;
      }
      return false;
    }, text);
    if (status === false) {
      return `Couldn't find a button with this text: ${text}`;
    }
    return "Clicked successfully";
  } catch (e) {
    return `There was an error ${JSON.stringify(e)}`;
  }
}
