import { Button, Code, Group, Text, Textarea } from "@mantine/core";
import type { UseQueryResult } from "@tanstack/react-query";
import { validate } from "@voxasoftworks/vin";
import type { AxiosResponse } from "axios";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import type { APIResponse, VinObj } from "../types";

interface Props {
  vinQueries: UseQueryResult<AxiosResponse<APIResponse>>[];
  setCheckHasRun: Dispatch<SetStateAction<boolean>>;
  vinArr: VinObj[];
  setVinArr: Dispatch<SetStateAction<VinObj[]>>;
}

export default function FormArea({
  vinQueries,
  setCheckHasRun,
  vinArr,
  setVinArr,
}: Props) {
  // const [vinArr, setVinArr] = useState<VinObj[]>([]);
  const [loading, setLoading] = useState(false);

  // Stop loader once all queries are no longer loading
  if (loading && !vinQueries.some((v) => v.isLoading && v.isFetching)) {
    setLoading(false);
    setCheckHasRun(true);
  }

  return (
    <>
      <Textarea
        label={
          <Text>
            Paste the VINs below and click <Code>Check</Code>. Then browse the
            results in the table below, or copy and paste them into your
            spreadsheet with the <Code>Copy results</Code> button.
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
    </>
  );
}
