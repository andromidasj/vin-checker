import {
  Button,
  Container,
  CopyButton,
  Flex,
  Space,
  Stack,
  Title,
} from "@mantine/core";
import { useQueries } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import axios from "axios";
import { atom, useAtom, useAtomValue } from "jotai";
import { type NextPage } from "next";
import Head from "next/head";
import FormArea from "../components/FormArea";
import Github from "../components/Github";
import ResultTable from "../components/ResultTable";
import { INSPECT_PASS } from "../consts";
import type { APIResponse, VinObj } from "../types";
import { arrToCsv } from "../util/arrToCsv";

export const vinArrAtom = atom<VinObj[]>([]);
export const hasRunAtom = atom(false);

const API_ERROR_MSG = "Error calling API...";
const VIN_ID = "vin";
const URL = "https://driveonportal.com/on-icaa-service/getVehicleTestResults/";

const Home: NextPage = () => {
  const [vinArr, setVinArr] = useAtom(vinArrAtom);
  const checkHasRun = useAtomValue(hasRunAtom);

  const vinQueries = useQueries({
    queries: vinArr.map(({ vin, valid }, idx) => ({
      queryKey: [VIN_ID, vin],
      queryFn: valid ? () => axios.get<APIResponse>(URL + vin) : () => null,
      enabled: false,
      onError() {
        console.error(API_ERROR_MSG);
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
          <FormArea vinQueries={vinQueries} />

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

          {!!vinArr.length && <ResultTable />}
        </Stack>
      </Container>
    </>
  );
};

export default Home;
