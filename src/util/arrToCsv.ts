import dayjs from "dayjs";

export function arrToCsv(vinArr: VinObj[]) {
  const csvOutput = [];
  for (const { vin, valid, pass, date } of vinArr) {
    const row = [
      vin,
      valid,
      pass,
      date ? dayjs(date).format(DATE_FORMAT) : "",
    ].join("\t");
    csvOutput.push(row);
  }
  return csvOutput.join("\n");
}
