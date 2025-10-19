import { describe, expect, it } from "vitest";
import { yoastSeoApp } from "./router";

describe("/yoast-seo", () => {
  it("Should return valid yoast seo analysis", async () => {
    const response = await yoastSeoApp.request("/yoast-seo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: "This is a sample text for Yoast SEO analysis.",
        title: "Sample Title",
        description: "Sample description for the webpage.",
        keyword: "sample keyword",
        slug: "sample-title",
      }),
    });

    expect(response.status).toBe(200);
  });
});
