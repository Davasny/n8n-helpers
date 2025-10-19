import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import * as v from "valibot";
import * as yoast from "yoastseo";
import getResearcher from "./utils/get-researcher";
import { removeLastAnchor } from "./utils/remove-last-anchor";

export const yoastSeoApp = new Hono();

const yoastSeoPayloadSchema = v.object({
  text: v.pipe(v.string(), v.nonEmpty()),

  title: v.pipe(v.string(), v.nonEmpty()),
  description: v.string(),
  keyword: v.string(),
  slug: v.string(),
});

yoastSeoApp.post(
  "/yoast-seo",
  vValidator("json", yoastSeoPayloadSchema),
  async (c) => {
    const normalizeCtor = <T extends new (...args: any[]) => any>(value: any): T | null => {
      const maybe = value?.default ?? value;
      return typeof maybe === "function" ? (maybe as T) : null;
    };

    const { text, keyword, slug, title, description } = c.req.valid("json");

    const paper = new yoast.Paper(text, {
      title,
      description,
      keyword,
      slug,
      locale: "en_US",
    });

    const { SEOAssessor, ContentAssessor, ...restAssessors } = yoast.assessors as Record<string, unknown> as any;

    const researcherClass = getResearcher("en");
    const researcher = new researcherClass(paper);

    const SEOAssessorCtor = normalizeCtor<typeof SEOAssessor>(SEOAssessor) ?? (SEOAssessor as any);
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

    const ContentAssessorCtor = normalizeCtor<typeof ContentAssessor>(ContentAssessor) ?? (ContentAssessor as any);
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
          console.warn(`[yoast-seo] Skipping ${assessorName}: not a constructor`);
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
          .map((r) => ({ ...r, rating: yoast.interpreters.scoreToRating(r.score) }))
          .filter((r) => r.rating !== "good" && r.rating !== "ok")
          .map((r) => r.text),
      ),
    );

    return c.json({ errors: uniqueErrors.map((err) => removeLastAnchor(err)) });
  },
);
