import { MetadataMeta } from "../../../src/components/MetadataMeta";
import { Box, Center, Container, Heading, Spinner } from "@chakra-ui/react";
import {
  Swap,
  usePublicKey,
  useTokenSwapFromId,
} from "@strata-foundation/react";
import {
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import { useRouter } from "next/router";
import React from "react";
import { mintMetadataServerSideProps } from "../../../src/utils/tokenMetadataServerProps";
import { SITE_URL } from "../../../src/constants";
import { 
  GetStaticPaths } from 'next' 
export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {

  return {
      paths: [], //indicates that no page needs be created at build time
      fallback: 'blocking' //indicates the type of fallback
  }
}
export const getStaticProps: GetStaticProps =
  mintMetadataServerSideProps;

export const SwapDisplay: NextPage = ({
  name,
  image,
  description,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  const { id: idRaw } = router.query;
  const id = usePublicKey(idRaw as string);
  const { 
    tokenBonding, 
    loading,
  } = useTokenSwapFromId(id);
  return (
    <Box
      w="full"
      backgroundColor="#f9f9f9"
      height="100vh"
      overflow="auto"
      paddingBottom="200px"
    >
      <MetadataMeta
        title={`Strata Swap | ${name}`}
        description={description}
        image={image}
        url={`${SITE_URL}/swap/${ id?.toString() }/`}
      />
      <Box padding="54px" backgroundColor="black.500" />
      <Container mt="-72px" justifyContent="stretch" maxW="460px">
        <Heading mb={2} color="white" fontSize="24px" fontWeight={600}>
          Swap
        </Heading>
        <Box
          padding={4}
          zIndex={1}
          bg="white"
          shadow="xl"
          rounded="lg"
          minH="400px"
        >
          {loading && (
            <Center>
              <Spinner />
            </Center>
          )}
          {!loading && tokenBonding && (
            <Swap id={id!} />
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default SwapDisplay;
