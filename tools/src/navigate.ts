import { launch } from "puppeteer";
import { ToolContext } from "replai";
import { Page } from "puppeteer";
import { wait } from "./wait.js";

export async function navigateAndPrepare(page: Page, url: string) {
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(url);
  await wait(1000);
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
    window.alert = () => {};
  });
  await wait(1000);
}

export async function navigate(
  storage: ToolContext<{ browser: any; page: any }>,
  url: string,
) {
  const browser = await launch({
    headless: false,
  });
  const page = await browser.newPage();
  storage.updateContext({ browser, page });
  await navigateAndPrepare(page, url);

  return "Navigation successful";
}
