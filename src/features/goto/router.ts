import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import * as v from "valibot";
import { Browser } from "./browser";

export const gotoApp = new Hono();

gotoApp.get(
  "/goto",
  vValidator(
    "query",
    v.object({
      url: v.pipe(v.string(), v.nonEmpty(), v.url()),
    }),
  ),
  async (c) => {
    const { url } = c.req.valid("query");
    const browser = await Browser.getInstance({});
    const page = browser.page;

    try {
      await page.goto(url, { waitUntil: "networkidle2" });
    } catch (error) {
      const isNavigationTimeout =
        error instanceof Error &&
        error.name === "TimeoutError" &&
        error.message.includes("Navigation timeout");

      if (isNavigationTimeout) {
        const readyState = await page
          .evaluate(() => document.readyState)
          .catch(() => null);

        if (
          (readyState === "complete" || readyState === "interactive") &&
          page.url() !== "about:blank"
        ) {
          console.warn(
            `Navigation timed out waiting for network idle. Continuing with document in '${readyState}' state for ${page.url()}.`,
          );
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

    const html = await page.content();
    browser.touch();

    return c.json({ pageContent: html });
  },
);
