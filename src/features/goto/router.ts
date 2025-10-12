import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import * as v from "valibot";
import { Browser } from "./browser";
import {
	captureFailureScreenshot,
	getScreenshot,
	listScreenshots,
} from "./screenshots";

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
			await browser.shutdown()

			return c.json({ pageContent: html });
		} catch (error) {
			await captureFailureScreenshot(page, url);
			await browser.shutdown()

			throw error;
		}
	},
);

gotoApp.get("/goto/screenshots", async (c) => {
	const files = await listScreenshots();
	return c.json({ files });
});

gotoApp.get(
	"/goto/screenshots/:fileId",
	vValidator("param", v.object({ fileId: v.pipe(v.string(), v.uuid()) })),
	async (c) => {
		const { fileId } = c.req.param();

		try {
			const file = await getScreenshot(fileId);
			return c.body(Buffer.from(file), 200, {
				"Content-Type": "image/png",
			});
		} catch (error) {
			const err = error as NodeJS.ErrnoException;

			if (err?.code === "ENOENT") {
				return c.json({ msg: "Screenshot not found" }, 404);
			}

			throw error;
		}
	},
);
