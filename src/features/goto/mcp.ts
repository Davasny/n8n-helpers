import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import { z } from "zod";
import { Browser } from "./browser";
import {
  captureFailureScreenshot,
  getScreenshot,
  listScreenshots,
} from "./screenshots";

const mcpServer = new McpServer({
  name: "goto-mcp",
  version: "1.0.0",
});

mcpServer.registerTool(
  "fetch-page-html",
  {
    description:
      "Navigate to a URL using a real browser and return the page HTML content. Handles JavaScript-rendered pages.",
    inputSchema: {
      url: z.string().url().describe("The URL to navigate to"),
    },
  },
  async ({ url }) => {
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
      await browser.shutdown();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ html }),
          },
        ],
      };
    } catch (error) {
      await captureFailureScreenshot(page, url);
      await browser.shutdown();

      throw error;
    }
  },
);

mcpServer.registerTool(
  "list-failure-screenshots",
  {
    description:
      "List all saved failure screenshots from browser navigation errors. Returns UUIDs that can be used with get-failure-screenshot.",
    inputSchema: {},
  },
  async () => {
    const fileIds = await listScreenshots();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ fileIds }),
        },
      ],
    };
  },
);

mcpServer.registerTool(
  "get-failure-screenshot",
  {
    description:
      "Get a failure screenshot by its UUID. Returns the screenshot as base64-encoded PNG.",
    inputSchema: {
      fileId: z.string().uuid().describe("UUID of the screenshot file"),
    },
  },
  async ({ fileId }) => {
    try {
      const file = await getScreenshot(fileId);
      const base64Png = file.toString("base64");

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ base64Png }),
          },
        ],
      };
    } catch (error) {
      const err = error as NodeJS.ErrnoException;

      if (err?.code === "ENOENT") {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Screenshot not found" }),
            },
          ],
          isError: true,
        };
      }

      throw error;
    }
  },
);

const transport = new StreamableHTTPTransport();

export const gotoMcpApp = new Hono();

gotoMcpApp.all("/mcp/goto", async (c) => {
  if (!mcpServer.isConnected()) {
    await mcpServer.connect(transport);
  }
  return transport.handleRequest(c);
});
