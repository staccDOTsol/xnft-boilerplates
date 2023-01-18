import { SaleItem } from "../../../src/components/sales/SaleItem";
import { MetadataMeta } from "../../../src/components/MetadataMeta";
import { Box, Container } from "@chakra-ui/react";
import { usePublicKey } from "@strata-foundation/react";
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

export const MarketDisplay: NextPage = ({
  name,
  image,
  description,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  const { mintKey: mintKeyRaw } = router.query;

  const mintKey = usePublicKey(mintKeyRaw as string);

  return (
    <Box
      w="full"
      backgroundColor="#f9f9f9"
      minHeight="100vh"
      paddingBottom="200px"
    >
      <MetadataMeta
        title={`Strata Sales | ${name}`}
        description={description}
        image={image}
        cardType="summary_large_image"
        url={`${SITE_URL}/item/${mintKey}/`}
      />
      <Box padding="54px" backgroundColor="black.500" />
      <Container mt={"-50px"} justifyContent="stretch" maxW="960px">
        <Box zIndex={1} bg="white" shadow="xl" rounded="lg">
          <SaleItem
            name={name}
            description={description}
            image={image}
            mintKey={mintKey}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default MarketDisplay;
