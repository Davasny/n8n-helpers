import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import * as v from "valibot";
import { Browser } from "./browser";

const READY_STATE_TIMEOUT_MS = 5_000;

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
      await page.goto(url, { waitUntil: "networkidle2" });
    } catch (error) {
      const isNavigationTimeout =
        error instanceof Error &&
        error.name === "TimeoutError" &&
        error.message.includes("Navigation timeout");

      if (isNavigationTimeout) {
        console.warn(
          `Navigation to ${url} timed out waiting for network idle. Checking document readiness...`,
        );

        const readyStateTimeoutSignal = Symbol("ready-state-evaluation-timeout");
        type ReadyState = "loading" | "interactive" | "complete";

        const readyState = await Promise.race<
          ReadyState | typeof readyStateTimeoutSignal | null
        >([
          page.evaluate(() => document.readyState as ReadyState),
          new Promise<typeof readyStateTimeoutSignal>((resolve) => {
            setTimeout(() => resolve(readyStateTimeoutSignal), READY_STATE_TIMEOUT_MS);
          }),
        ]).catch(() => null);

        if (readyState === readyStateTimeoutSignal) {
          console.warn(
            `Falling back because checking document.readyState exceeded ${READY_STATE_TIMEOUT_MS}ms.`,
          );
        }

        const isDocumentReady =
          readyState === "complete" || readyState === "interactive";
        const evaluationTimedOut = readyState === readyStateTimeoutSignal;
        const stateLabel = evaluationTimedOut
          ? "timed-out"
          : readyState ?? "unknown";

        if (
          (isDocumentReady || evaluationTimedOut) &&
          page.url() !== "about:blank"
        ) {
          console.warn(
            `Navigation timed out waiting for network idle. Continuing with document in '${stateLabel}' state for ${page.url()}.`,
          );
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

    const html = await page.content();
    browser.touch();

    return c.json({ pageContent: html });
  },
);
