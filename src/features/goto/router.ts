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

		for (let counter = 0; counter < 3; counter++) {
			try {
				await page.goto(url, { waitUntil: "networkidle2", timeout: 10_000 });
				break;
			} catch (e) {
				if (e instanceof Error && e.name === "TimeoutError") {
					console.warn("Got TimeoutError, retrying...", counter);
				} else {
					console.error("Failed to navigate to the page:", e);
					throw e;
				}
			}
		}

		const html = await page.content();
		browser.touch();

		return c.json({ pageContent: html });
	},
);
