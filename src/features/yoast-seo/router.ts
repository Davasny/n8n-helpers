import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import * as v from "valibot";
import {
  type AssessmentResult,
  assessments,
  assessors,
  interpreters,
  Paper,
} from "yoastseo";
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
    const { text, keyword, slug, title, description } = c.req.valid("json");

    const paper = new Paper(text, {
      title,
      description,
      keyword,
      slug,
      locale: "en_US",
    });

    const { SEOAssessor, ContentAssessor, ...restAssessors } = assessors;

    const researcherClass = getResearcher("en");
    const researcher = new researcherClass(paper);

    const seoAssessor = new SEOAssessor(researcher);
    for (const [key, value] of Object.entries(assessments.seo)) {
      // both assessments are deprecated
      if (
        key === "KeywordDensityAssessment" ||
        key === "UrlKeywordAssessment"
      ) {
        continue;
      }

      // @ts-expect-error
      seoAssessor.addAssessment(key, new value());
    }

    const contentAssessor = new ContentAssessor(researcher);
    for (const [key, value] of Object.entries(assessments.readability)) {
      // @ts-expect-error
      contentAssessor.addAssessment(key, new value());
    }

    const results: AssessmentResult[] = [];

    for (const [assessorName, assessorClass] of Object.entries(restAssessors)) {
      // product assessors are part of paid features
      if (assessorName.startsWith("Product")) {
        continue;
      }

      try {
        const resultAssessor = new assessorClass(researcher);
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
          .map((r) => ({ ...r, rating: interpreters.scoreToRating(r.score) }))
          .filter((r) => r.rating !== "good" && r.rating !== "ok")
          .map((r) => r.text),
      ),
    );

    return c.json({ errors: uniqueErrors.map((err) => removeLastAnchor(err)) });
  },
);
