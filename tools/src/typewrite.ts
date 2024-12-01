import { Page } from "puppeteer";
import { ToolContext } from "replai";

export async function typewrite(
  context: ToolContext<{ page: Page }>,
  text: string,
) {
  const { page } = context.getContext();
  await page.keyboard.type(text);
  return "Typed successfully";
}
