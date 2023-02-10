import {
  Button,
  Code,
  Container,
  CopyButton,
  Flex,
  Space,
  Stack,
  Table,
  Title,
} from "@mantine/core";
import { useQueries } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import axios from "axios";
import dayjs from "dayjs";
import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import FormArea from "../components/FormArea";
import Github from "../components/Github";
import {
  DATE_FORMAT,
  FALSE_ICON,
  INSPECT_PASS,
  NO_CHECK_ICON,
  TRUE_ICON,
  URL,
} from "../consts";
import type { APIResponse, VinObj } from "../types";
import { arrToCsv } from "../util/arrToCsv";

const Home: NextPage = () => {
  const [vinArr, setVinArr] = useState<VinObj[]>([]);
  const [checkHasRun, setCheckHasRun] = useState(false);

  const vinQueries = useQueries({
    queries: vinArr.map(({ vin, valid }, idx) => ({
      queryKey: ["vin", vin],
      queryFn: valid ? () => axios.get<APIResponse>(URL + vin) : () => null,
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
        <title>E-Test Checker - Ontario, Canada</title>
        <meta name="description" content="Created by Josh Andromidas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Github />

      <Container>
        <Title align="center">E-Test Checker - Ontario, Canada</Title>
        <Space h="xl" />

        <Stack align="center">
          <FormArea
            vinQueries={vinQueries}
            setCheckHasRun={setCheckHasRun}
            vinArr={vinArr}
            setVinArr={setVinArr}
          />

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

          {!!vinArr.length && (
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
          )}
        </Stack>
      </Container>
    </>
  );
};

export default Home;
