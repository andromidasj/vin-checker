import { ActionIcon, Flex, Image } from "@mantine/core";

export default function Github() {
  return (
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
  );
}
