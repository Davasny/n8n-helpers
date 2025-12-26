import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import { z } from "zod";
import { convertExcelToCsv } from "./convert-excel-to-csv";

const mcpServer = new McpServer({
  name: "convert-mcp",
  version: "1.0.0",
});

mcpServer.registerTool(
  "convert-excel-to-csv",
  {
    description:
      "Convert an Excel file (xlsx) to CSV format. Accepts base64-encoded file content and returns CSV as text.",
    inputSchema: {
      fileName: z.string().describe("Original filename of the Excel file"),
      base64Content: z
        .string()
        .describe("Base64-encoded content of the Excel file"),
    },
  },
  async ({ fileName, base64Content }) => {
    const csv = await convertExcelToCsv(base64Content);
    const outputFileName = fileName.replace(/\.(xlsx|xls)$/i, ".csv");

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ csv, outputFileName }),
        },
      ],
    };
  },
);

const transport = new StreamableHTTPTransport();

export const convertMcpApp = new Hono();

convertMcpApp.all("/mcp/convert", async (c) => {
  if (!mcpServer.isConnected()) {
    await mcpServer.connect(transport);
  }
  return transport.handleRequest(c);
});
