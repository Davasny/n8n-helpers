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

		const maxTries = 3;

		for (let counter = 1; counter <= maxTries; counter++) {
			try {
				await page.goto(url, { waitUntil: "networkidle2", timeout: 10_000 });
				break;
			} catch (e) {
				if (e instanceof Error && e.name === "TimeoutError") {
					console.warn("Got TimeoutError, retrying...", counter);

					if (counter === maxTries) {
						console.error("Max retries reached. Failing.");
						throw e;
					}
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
