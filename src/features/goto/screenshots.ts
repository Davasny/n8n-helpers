import { mkdir, readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { v7 as uuidv7 } from "uuid";
import type { Browser } from "./browser";

const SCREENSHOT_DIR = resolve(process.cwd(), "screenshots");

const ensureScreenshotDir = async () => {
  await mkdir(SCREENSHOT_DIR, { recursive: true });
};

export const captureFailureScreenshot = async (
  page: Browser["page"],
  url: string,
) => {
  const fileName = `${uuidv7()}.png`;
  console.info(`Saving failure screenshot for ${url} as ${fileName}`);

  try {
    await ensureScreenshotDir();
    const filePath = join(SCREENSHOT_DIR, fileName);
    await page.screenshot({ path: filePath, fullPage: true });
  } catch (screenshotError) {
    console.error("Unable to capture failure screenshot:", screenshotError);
  }
};

export const listScreenshots = async (): Promise<string[]> => {
  try {
    const entries = await readdir(SCREENSHOT_DIR, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name.replace(/\.png$/i, ""))
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err?.code === "ENOENT") {
      return [];
    }

    throw error;
  }
};

export const getScreenshot = async (fileId: string) => {
  const filePath = join(SCREENSHOT_DIR, `${fileId}.png`);
  return await readFile(filePath);
};
