import ExcelJS from "exceljs";

export async function convertExcelToCsv(base64: string) {
  const buffer = Buffer.from(base64, "base64");

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer.buffer);

  const csvBuffer = await workbook.csv.writeBuffer({
    sheetId: 1,
  });

  return csvBuffer.toString();
}
