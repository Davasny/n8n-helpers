import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import * as yoast from "yoastseo";
import { z } from "zod";
import getResearcher from "./utils/get-researcher";
import { removeLastAnchor } from "./utils/remove-last-anchor";

const mcpServer = new McpServer({
  name: "yoast-seo-mcp",
  version: "1.0.0",
});

mcpServer.registerTool(
  "analyze-seo",
  {
    description:
      "Analyze text content for SEO issues using Yoast SEO. Returns a list of SEO and readability errors/warnings.",
    inputSchema: {
      text: z.string().describe("The main text content to analyze"),
      title: z.string().describe("The page/article title"),
      description: z.string().describe("Meta description"),
      keyword: z.string().describe("Focus keyword/keyphrase"),
      slug: z.string().describe("URL slug"),
    },
  },
  async ({ text, title, description, keyword, slug }) => {
    // biome-ignore lint/suspicious/noExplicitAny: yoastseo types are incomplete
    const normalizeCtor = <T extends new (...args: any[]) => any>(
      value: unknown,
    ): T | null => {
      // biome-ignore lint/suspicious/noExplicitAny: yoastseo types are incomplete
      const maybe = (value as any)?.default ?? value;
      return typeof maybe === "function" ? (maybe as T) : null;
    };

    const paper = new yoast.Paper(text, {
      title,
      description,
      keyword,
      slug,
      locale: "en_US",
    });

    const { SEOAssessor, ContentAssessor, ...restAssessors } =
      // biome-ignore lint/suspicious/noExplicitAny: yoastseo types are incomplete
      yoast.assessors as Record<string, unknown> as any;

    const researcherClass = getResearcher("en");
    const researcher = new researcherClass(paper);

    const SEOAssessorCtor =
      normalizeCtor<typeof yoast.assessors.SEOAssessor>(SEOAssessor) ??
      // biome-ignore lint/suspicious/noExplicitAny: yoastseo types are incomplete
      (SEOAssessor as any);
    const seoAssessor = new SEOAssessorCtor(researcher);
    for (const [key, value] of Object.entries(yoast.assessments.seo)) {
      // both assessments are deprecated
      if (
        key === "KeywordDensityAssessment" ||
        key === "UrlKeywordAssessment"
      ) {
        continue;
      }

      const Ctor = normalizeCtor(value);
      if (!Ctor) continue;
      seoAssessor.addAssessment(key, new Ctor());
    }

    const ContentAssessorCtor =
      normalizeCtor<typeof yoast.assessors.ContentAssessor>(ContentAssessor) ??
      // biome-ignore lint/suspicious/noExplicitAny: yoastseo types are incomplete
      (ContentAssessor as any);
    const contentAssessor = new ContentAssessorCtor(researcher);
    for (const [key, value] of Object.entries(yoast.assessments.readability)) {
      const Ctor = normalizeCtor(value);
      if (!Ctor) continue;
      contentAssessor.addAssessment(key, new Ctor());
    }

    const results: yoast.AssessmentResult[] = [];

    for (const [assessorName, assessorClass] of Object.entries(restAssessors)) {
      // product assessors are part of paid features
      if (assessorName.startsWith("Product")) {
        continue;
      }

      try {
        const Ctor = normalizeCtor(assessorClass);
        if (!Ctor) {
          console.warn(
            `[yoast-seo] Skipping ${assessorName}: not a constructor`,
          );
          continue;
        }
        const resultAssessor = new Ctor(researcher);
        resultAssessor.assess(paper);

        const rawResults = resultAssessor.getValidResults();
        results.push(...rawResults);
      } catch (error) {
        console.warn(
          `[yoast-seo] Could not run ${assessorName}: ${(error as Error).message}`,
        );
      }
    }

    seoAssessor.assess(paper);
    const seoResults = seoAssessor.getValidResults();
    results.push(...seoResults);

    contentAssessor.assess(paper);
    const contentResults = contentAssessor.getValidResults();
    results.push(...contentResults);

    const uniqueErrors = Array.from(
      new Set(
        results
          .map((r) => ({
            ...r,
            rating: yoast.interpreters.scoreToRating(r.score),
          }))
          .filter((r) => r.rating !== "good" && r.rating !== "ok")
          .map((r) => r.text),
      ),
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            errors: uniqueErrors.map((err) => removeLastAnchor(err)),
          }),
        },
      ],
    };
  },
);

const transport = new StreamableHTTPTransport();

export const yoastSeoMcpApp = new Hono();

yoastSeoMcpApp.all("/mcp/yoast-seo", async (c) => {
  if (!mcpServer.isConnected()) {
    await mcpServer.connect(transport);
  }
  return transport.handleRequest(c);
});
