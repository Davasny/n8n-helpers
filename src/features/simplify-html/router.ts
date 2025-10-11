import { vValidator } from "@hono/valibot-validator";
import { Readability } from "@mozilla/readability";
import { Hono } from "hono";
import { JSDOM } from "jsdom";
import * as v from "valibot";

export const simplifyHtmlApp = new Hono();

simplifyHtmlApp.post(
  "/simplify-html",
  vValidator(
    "json",
    v.object({
      content: v.pipe(v.string(), v.nonEmpty()),
      originalUrl: v.optional(v.nullable(v.pipe(v.string(), v.url()))),
    }),
  ),
  async (c) => {
    const { content, originalUrl } = c.req.valid("json");

    const dom = new JSDOM(content, {
      url: originalUrl ? originalUrl : undefined,
    });

    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    return c.json({
      title: article?.title || null,
      content: article?.content || null,
      textContent: article?.textContent || null,
      length: article?.length || null,
      excerpt: article?.excerpt || null,
      byline: article?.byline || null,
      dir: article?.dir || null,
      siteName: article?.siteName || null,
      lang: article?.lang || null,
      publishedTime: article?.publishedTime || null,
    });
  },
);

