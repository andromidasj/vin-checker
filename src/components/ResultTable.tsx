import { Code, Table } from "@mantine/core";
import dayjs from "dayjs";
import { useAtomValue } from "jotai";
import { DATE_FORMAT, FALSE_ICON, NO_CHECK_ICON, TRUE_ICON } from "../consts";
import { vinArrAtom } from "../pages";

export default function ResultTable() {
  const vinArr = useAtomValue(vinArrAtom);

  const rows = vinArr.map(({ vin, valid, date, pass }) => {
    const datePassed = date ? dayjs(date).format(DATE_FORMAT) : "";

    return (
      <tr key={vin}>
        <td>
          <Code>{vin}</Code>
        </td>
        <td>{valid ? TRUE_ICON : FALSE_ICON}</td>
        <td>
          {valid
            ? pass === true
              ? TRUE_ICON
              : pass === false
              ? FALSE_ICON
              : ""
            : NO_CHECK_ICON}
        </td>
        <td>{valid && pass ? datePassed : NO_CHECK_ICON}</td>
      </tr>
    );
  });

  return (
    <Table>
      <thead>
        <tr>
          <td>VIN</td>
          <td>Valid</td>
          <td>Pass</td>
          <td>Date</td>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
  );
}
