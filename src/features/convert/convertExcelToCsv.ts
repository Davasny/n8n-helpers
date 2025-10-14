import * as XLSX from "xlsx";

export function convertExcelToCsv(base64: string) {
  const buffer = Buffer.from(base64, "base64");

  const workbook = XLSX.read(buffer, { type: "buffer" });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const csv = XLSX.utils.sheet_to_csv(worksheet);
  return csv;
}
