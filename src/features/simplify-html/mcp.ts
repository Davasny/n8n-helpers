import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Readability } from "@mozilla/readability";
import { Hono } from "hono";
import { JSDOM } from "jsdom";
import { z } from "zod/v4";

const mcpServer = new McpServer({
  name: "simplify-html-mcp",
  version: "1.0.0",
});

mcpServer.registerTool(
  "simplify-html",
  {
    description:
      "Extract readable content from HTML using Mozilla Readability. Returns cleaned article content, title, excerpt, and metadata.",
    inputSchema: {
      html: z.string().describe("The HTML content to simplify"),
      sourceUrl: z
        .string()
        .url()
        .optional()
        .describe(
          "Original URL of the HTML content (helps with relative link resolution)",
        ),
    },
  },
  async ({ html, sourceUrl }) => {
    const dom = new JSDOM(html, {
      url: sourceUrl ? sourceUrl : undefined,
    });

    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    const result = {
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
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result),
        },
      ],
    };
  },
);

const transport = new StreamableHTTPTransport();

export const simplifyHtmlMcpApp = new Hono();

simplifyHtmlMcpApp.all("/mcp/simplify-html", async (c) => {
  if (!mcpServer.isConnected()) {
    await mcpServer.connect(transport);
  }
  return transport.handleRequest(c);
});
