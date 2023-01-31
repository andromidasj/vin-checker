import dayjs from "dayjs";
import { DATE_FORMAT } from "../consts";
import type { VinObj } from "../types";

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
