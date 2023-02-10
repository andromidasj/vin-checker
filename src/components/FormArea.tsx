import { Button, Code, Group, Text, Textarea } from "@mantine/core";
import type { UseQueryResult } from "@tanstack/react-query";
import { validate } from "@voxasoftworks/vin";
import type { AxiosResponse } from "axios";
import { atom, useAtom, useSetAtom } from "jotai";
import { useEffect } from "react";
import { hasRunAtom, vinArrAtom } from "../pages";
import type { APIResponse, VinObj } from "../types";

export const loadingAtom = atom(false);

interface Props {
  vinQueries: UseQueryResult<AxiosResponse<APIResponse>>[];
}

export default function FormArea({ vinQueries }: Props) {
  const [loading, setLoading] = useAtom(loadingAtom);
  const setCheckHasRun = useSetAtom(hasRunAtom);
  const [vinArr, setVinArr] = useAtom(vinArrAtom);

  useEffect(() => {
    // Stop loader once all queries are no longer loading
    if (loading && vinQueries.every((v) => v.isSuccess)) {
      setLoading(false);
      setCheckHasRun(true);
    }
  }, [loading, setCheckHasRun, setLoading, vinQueries]);

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
            setLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            vinQueries.forEach(async (e) => await e.refetch());
          }}
        >
          Check
        </Button>
      </Group>
    </>
  );
}
