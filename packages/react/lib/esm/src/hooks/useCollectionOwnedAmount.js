import { useWallet } from "wallet-adapter-react-xnft";
import { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import { gql, useQuery } from "@apollo/client";
const GET_MINTS_IN_COLLECTION = gql `
  query GetMintsInCollection(
    $collection: PublicKey!
    $wallet: PublicKey!
    $limit: Int!
    $offset: Int!
  ) {
    nfts(
      owners: [$wallet]
      collection: $collection
      limit: $limit
      offset: $offset
    ) {
      mintAddress
    }
  }
`;
export function useCollectionOwnedAmount(collection) {
    const { publicKey } = useWallet();
    const { data: { nfts } = {}, error, loading, } = useQuery(GET_MINTS_IN_COLLECTION, {
        variables: {
            collection: collection?.toBase58(),
            wallet: publicKey?.toBase58(),
            offset: 0,
            limit: 1000,
        },
    });
    const matches = useMemo(() => {
        if (nfts) {
            return nfts.map((nft) => new PublicKey(nft.mintAddress));
        }
    }, [nfts, collection?.toBase58()]);
    const amount = useMemo(() => {
        if (matches) {
            return matches.reduce((acc, nft) => {
                return acc + 1;
            }, 0);
        }
    }, [matches]);
    return {
        error,
        loading,
        matches,
        amount,
    };
}
//# sourceMappingURL=useCollectionOwnedAmount.js.map