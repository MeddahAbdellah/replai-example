import { Browser } from "puppeteer";
import { ToolContext } from "replai";

export async function closeBrowser(context: ToolContext<{ browser: Browser }>) {
  const { browser } = context.getContext();
  await browser.close();
  return "Browser closed successfully";
}
