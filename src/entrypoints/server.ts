import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { convertMcpApp } from "../features/convert/mcp";
import { convertApp } from "../features/convert/router";
import { gotoMcpApp } from "../features/goto/mcp";
import { gotoApp } from "../features/goto/router";
import { simplifyHtmlMcpApp } from "../features/simplify-html/mcp";
import { simplifyHtmlApp } from "../features/simplify-html/router";
import { yoastSeoMcpApp } from "../features/yoast-seo/mcp";
import { yoastSeoApp } from "../features/yoast-seo/router";

export const app = new Hono();
app.use(logger());

app.get("/", async (c) => c.json({ msg: "Hello from the helpers" }));

// HTTP REST endpoints
app.route("/", simplifyHtmlApp);
app.route("/", gotoApp);
app.route("/", convertApp);
app.route("/", yoastSeoApp);

// MCP endpoints
app.route("/", convertMcpApp);
app.route("/", gotoMcpApp);
app.route("/", simplifyHtmlMcpApp);
app.route("/", yoastSeoMcpApp);

serve(
  {
    fetch: app.fetch,
    port: 3012,
  },
  () => {
    console.info("Server started on :3012");
  },
);
