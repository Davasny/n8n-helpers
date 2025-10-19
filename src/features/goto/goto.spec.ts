import * as v from "valibot";
import { afterAll, describe, expect, it } from "vitest";
import { Browser } from "./browser";
import { gotoApp } from "./router";

const responseSchema = v.object({
  pageContent: v.string(),
});

describe("/goto", async () => {
  afterAll(async () => {
    const browser = await Browser.getInstance({});
    await browser.shutdown();
  });

  it("Opens a static page", async () => {
    const res = await gotoApp.request("/goto?url=https://example.com");

    expect(res.status).toBe(200);

    const data = await res.json();
    const responseObject = v.parse(responseSchema, data);
    expect(responseObject.pageContent).toContain("Example Domain");
  });

  it("Opens a single page app (client side only)", async () => {
    const res = await gotoApp.request(
      "/goto?url=https://app.pushpushgo.com/login",
    );

    expect(res.status).toBe(200);

    const data = await res.json();
    const responseObject = v.parse(responseSchema, data);
    expect(responseObject.pageContent).toContain("Welcome back");
  });
}, 30_000);
