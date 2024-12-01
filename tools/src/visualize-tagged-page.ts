import { ToolContext } from "replai";
import { Page } from "puppeteer";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function visualizeTaggedPage(
  context: ToolContext<{ page: Page }>,
) {
  const { page } = context.getContext();
  const filePath = "temp.png";
  const screenshotPath = path.join(__dirname, filePath);
  await page.evaluate(() => {
    Object.assign(window, { taggedElements: [] });
    const generateId = () => crypto.randomUUID().slice(0, 8);

    ["input", "textarea", "button", "a"].forEach((selector) => {
      document.querySelectorAll(selector).forEach((e) => {
        const uniqueId = generateId();
        const element = e as HTMLElement;
        if (!element.id || element.id?.length > 8) {
          element.id = uniqueId;
        }
        debugger;
        (window as unknown as { taggedElements: string[] }).taggedElements.push(
          element.id,
        );

        // Create a wrapper div
        const wrapperDiv = document.createElement("div");
        wrapperDiv.style.position = "relative";
        wrapperDiv.style.padding = "2px";
        wrapperDiv.style.paddingBottom = "32px";
        wrapperDiv.style.boxSizing = "border-box";
        wrapperDiv.style.border = "2px solid red";
        wrapperDiv.style.minWidth = "100px";
        wrapperDiv.style.display = "inline-block"; // Ensure the wrapper fits the element

        // Insert the wrapper div before the element
        element.parentNode?.insertBefore(wrapperDiv, element);
        // Remove the element from its current position
        element.parentNode?.removeChild(element);
        // Move the element inside the wrapper div
        wrapperDiv.appendChild(element);

        const idLabel = document.createElement("span");
        idLabel.textContent = element.id;
        idLabel.style.position = "absolute";
        idLabel.style.bottom = "2px";
        idLabel.style.right = "2px";
        idLabel.style.fontSize = "1.2em";
        idLabel.style.color = "black";
        idLabel.style.backgroundColor = "red";
        idLabel.style.padding = "1px 3px";

        // Append the label to the wrapper div
        wrapperDiv.appendChild(idLabel);
      });
    });
  });
  await page.screenshot({ path: screenshotPath, fullPage: true });
  const imageBuffer = fs.readFileSync(screenshotPath);
  const imageBase64 = imageBuffer.toString("base64");
  await page.evaluate(() => {
    const { taggedElements } = window as unknown as {
      taggedElements: string[];
    };
    taggedElements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        const wrapperDiv = element.parentNode as HTMLElement;
        if (wrapperDiv && wrapperDiv.parentNode) {
          // Move the element out of the wrapper div
          wrapperDiv.parentNode.insertBefore(element, wrapperDiv);
          // Remove the wrapper div
          wrapperDiv.parentNode.removeChild(wrapperDiv);
        }
      }
    });
  });

  return [
    {
      type: "image_url",
      image_url: {
        url: `data:image/png;base64,${imageBase64}`,
      },
    },
  ];
}
