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

    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();
    await browser.shutdown();

    return c.json({ pageContent: html });
  },
);
