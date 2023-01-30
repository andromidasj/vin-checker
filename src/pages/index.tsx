import {
  Button,
  Code,
  Container,
  Group,
  Space,
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

// const dummyData = [
//   "1FVHCYFE1KHKJ5620",
//   "1FVHG3DV 4MHMJ645",
//   "1FVHCYDC65HN96015",
//   "1FVHCYBS0DHBW7139",
//   "1HTSHAAR41H376727",
//   "1HTWXAHT27J461864",
// ];

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

const url = "https://driveonportal.com/on-icaa-service/getVehicleTestResults/";

const Home: NextPage = () => {
  const [vinArr, setVinArr] = useState<VinObj[]>([]);
  const [loading, setLoading] = useState(false);

  useQueries({
    queries: vinArr.map(({ vin }, idx) => ({
      queryKey: ["vin", vin],
      queryFn: () => axios.get<APIResponse>(url + vin),
      enabled: loading,
      onError() {
        console.error("error calling API...");
      },
      onSuccess(data: AxiosResponse<APIResponse>) {
        const newVinArr: VinObj[] = [...vinArr];

        newVinArr[idx]!.pass = data.data[0]?.overallInspectionResult === "P";
        newVinArr[idx]!.date = data.data[0]?.inspectionDate;

        setVinArr(newVinArr);
      },
      onSettled: () => setLoading(false),
    })),
  });

  const rows = vinArr.map(({ vin, valid, date, pass }) => (
    <tr key={vin}>
      <td>
        <Code>{vin}</Code>
      </td>
      <td>{valid ? "✅" : "❌"}</td>
      <td>{pass === true ? "✅" : pass === false ? "❌" : ""}</td>
      <td>{dayjs(date).format("MM/DD/YYYY")}</td>
    </tr>
  ));

  // console.log(vinQueries);
  console.log(vinArr);

  return (
    <>
      <Head>
        <title>VIN Checker</title>
        <meta name="description" content="Created by Josh Andromidas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container>
        <Title align="center">VIN Checker</Title>
        <Space h="xl" />

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
          }}
        />

        <Group>
          <Button
            loading={loading}
            onClick={() => {
              setLoading(true);
            }}
          >
            Check
          </Button>
          <Text>VINs: {vinArr.length}</Text>
        </Group>

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
      </Container>
    </>
  );
};

export default Home;
