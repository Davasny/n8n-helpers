import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { simplifyHtmlApp } from "./router";


const responseSchema = v.object({
	title: v.nullable(v.string()),
	content: v.nullable(v.string()),
	textContent: v.nullable(v.string()),
	length: v.nullable(v.number()),
	excerpt: v.nullable(v.string()),
	byline: v.nullable(v.string()),
	dir: v.nullable(v.string()),
	siteName: v.nullable(v.string()),
	lang: v.nullable(v.string()),
	publishedTime: v.nullable(v.string()),
});

describe("/simplify-html", async () => {
	it("Simplifies github docs page", async () => {
		const htmlPath = resolve(__dirname, "simplify-html-github.html");
		const html = await readFile(htmlPath, "utf8");

		const res = await simplifyHtmlApp.request("/simplify-html", {
			method: "POST",
			body: JSON.stringify({
				content: html,
				originalUrl: "https://docs.github.com/en/actions/concepts/metrics",
			}),
			headers: new Headers({ "Content-Type": "application/json" }),
		});

		expect(res.status).toBe(200);

		const data = await res.json();
		const responseObject = v.parse(responseSchema, data);

		expect(responseObject.title).toContain("About GitHub Actions metrics")
	});
}, 30_000);
