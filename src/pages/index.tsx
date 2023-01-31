import {
  ActionIcon,
  Button,
  Code,
  Container,
  CopyButton,
  Flex,
  Group,
  Image,
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
        <title>E-Test Checker - Ontario, Canada</title>
        <meta name="description" content="Created by Josh Andromidas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Flex direction="row-reverse">
        <ActionIcon radius="xl" size="xl" mt={10} mr={10}>
          <a
            href="https://github.com/andromidasj"
            target="_blank"
            rel="noreferrer"
          >
            <Image src="./github.svg" alt="https://github.com/andromidasj" />
          </a>
        </ActionIcon>
      </Flex>

      <Container>
        <Space h="xl" />
        <Title align="center">E-Test Checker - Ontario, Canada</Title>
        <Space h="xl" />

        <Stack align="center">
          <Textarea
            label={
              <Text>
                Paste the VINs below and click <Code>Check</Code>. Then browse
                the results in the table below, or copy and paste them into your
                spreasheet with the <Code>Copy results</Code> button.
              </Text>
            }
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
