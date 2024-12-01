import { launch } from "puppeteer";
import { ToolContext } from "replai";

export async function openBrowser(context: ToolContext<{}>): Promise<string> {
  const browser = await launch({
    headless: false,
  });
  context.updateContext({ browser });
  return "Browser opened successfully";
}
