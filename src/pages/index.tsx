import {
  Button,
  Code,
  Container,
  CopyButton,
  Flex,
  Group,
  Space,
  Stack,
  Table,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { useQueries } from "@tanstack/react-query";
import { validate } from "@voxasoftworks/vin";
import type { AxiosResponse } from "axios";
import axios from "axios";
import dayjs from "dayjs";
import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";

type VinObj = {
  vin: string;
  valid?: boolean;
  pass?: boolean;
  date?: string;
};

type APIResponse = {
  inspectionId: number;
  inspectionDate: string; // Date
  stationId: string;
  stationName: string;
  vin: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  overallInspectionResult: string;
}[];

const URL = "https://driveonportal.com/on-icaa-service/getVehicleTestResults/";
const TRUE_ICON = "✅";
const FALSE_ICON = "❌";
const INSPECT_PASS = "P";
const DATE_FORMAT = "MM/DD/YYYY";
const NO_CHECK_ICON = "-";

function arrToCsv(vinArr: VinObj[]) {
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

const Home: NextPage = () => {
  const [vinArr, setVinArr] = useState<VinObj[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkHasRun, setCheckHasRun] = useState(false);

  const vinQueries = useQueries({
    queries: vinArr.map(({ vin, valid }, idx) => ({
      queryKey: ["vin", vin],
      queryFn: valid ? () => axios.get<APIResponse>(URL + vin) : () => null,
      // enabled: valid ? loading : false,
      enabled: false,
      onError() {
        console.error("error calling API...");
      },
      onSuccess(data: AxiosResponse<APIResponse>) {
        const newVinArr: VinObj[] = [...vinArr];

        newVinArr[idx]!.pass =
          data.data[0]?.overallInspectionResult === INSPECT_PASS;
        newVinArr[idx]!.date = data.data[0]?.inspectionDate;

        setVinArr(newVinArr);
      },
    })),
  });

  // Stop loader once all queries are no longer loading
  if (loading && !vinQueries.some((v) => v.isLoading && v.isFetching)) {
    setLoading(false);
    setCheckHasRun(true);
  }

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
    <>
      <Head>
        <title>VIN Checker</title>
        <meta name="description" content="Created by Josh Andromidas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container>
        <Space h="xl" />
        <Title align="center">VIN Checker</Title>
        <Space h="xl" />

        <Stack align="center">
          <Textarea
            label="Paste the VIN numbers you'd like to check"
            autosize
            minRows={2}
            maxRows={10}
            w={400}
            onChange={({ target: { value } }) => {
              const newVinArr: VinObj[] = value
                .split("\n")
                .filter((e) => e.length)
                .map((vin) => ({ vin, valid: validate(vin) }));

              setVinArr(newVinArr);
              setCheckHasRun(false);
            }}
          />

          <Group w={400} position="apart">
            <Text>VINs: {vinArr.length}</Text>
            <Button
              loading={loading}
              onClick={() => {
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                vinQueries.forEach(async (e) => await e.refetch());
                setLoading(true);
              }}
            >
              Check
            </Button>
          </Group>

          {checkHasRun && (
            <Flex justify="flex-end">
              <CopyButton value={arrToCsv(vinArr)}>
                {({ copied, copy }) => (
                  <Button color={copied ? "teal" : "blue"} onClick={copy}>
                    {copied ? "Copied results!" : "Copy results"}
                  </Button>
                )}
              </CopyButton>
            </Flex>
          )}

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
        </Stack>
      </Container>
    </>
  );
};

export default Home;
