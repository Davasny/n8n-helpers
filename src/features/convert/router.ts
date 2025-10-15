import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import * as v from "valibot";
import { convertExcelToCsv } from "./convert-excel-to-csv";

export const convertApp = new Hono();

const conversionSchema = v.object({
  from: v.picklist(["xlsx", "xls"]),
  to: v.pipe(v.string(), v.length(3)),
  file: v.object({
    name: v.pipe(v.string(), v.minLength(1)),
    base64: v.pipe(v.string(), v.base64()),
  }),
});

convertApp.post(
  "/convert/base64",
  vValidator("json", conversionSchema),
  (c) => {
    const { from, to, file } = c.req.valid("json");
    const { name, base64 } = file;

    if (["xlsx", "xls"].includes(from) && to === "csv") {
      const csv = convertExcelToCsv(base64);

      return c.json(
        {
          data: csv,
          filename: name.replace(/\.(xlsx|xls)$/, ".csv"),
        },
        200
      );
    }

    return c.json(
      {
        message: `Conversion from ${from} to ${to} is not supported`,
      },
      400
    );
  }
);
