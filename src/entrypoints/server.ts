import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { convertApp } from "../features/convert/router";
import { gotoApp } from "../features/goto/router";
import { simplifyHtmlApp } from "../features/simplify-html/router";
import { yoastSeoApp } from "../features/yoast-seo/router";

export const app = new Hono();
app.use(logger());

app.get("/", async (c) => c.json({ msg: "Hello from the helpers" }));

app.route("/", simplifyHtmlApp);
app.route("/", gotoApp);
app.route("/", convertApp);
app.route("/", yoastSeoApp);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  () => {
    console.info("Server started on :3000");
  }
);
