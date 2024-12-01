import { Browser, Page } from "puppeteer";
import { ToolContext } from "replai";

export async function wait(time: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(() => {
      res();
    }, time);
  });
}

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

export async function openPage(
  context: ToolContext<{ browser: Browser; page: Page }>,
  url: string,
) {
  const { browser } = context.getContext();
  const page = await browser.newPage();
  await navigateAndPrepare(page, url);
  context.updateContext({ page });
  return "Page opened successfully";
}
