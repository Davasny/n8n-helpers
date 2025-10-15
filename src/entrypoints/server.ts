import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { gotoApp } from "../features/goto/router";
import { simplifyHtmlApp } from "../features/simplify-html/router";
import { convertApp } from "../features/convert/router";

export const app = new Hono();
app.use(logger());

app.get("/", async (c) => c.json({ msg: "Hello from the helpers" }));

app.route("/", simplifyHtmlApp);
app.route("/", gotoApp);
app.route("/", convertApp);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  () => {
    console.info("Server started on :3000");
  }
);
