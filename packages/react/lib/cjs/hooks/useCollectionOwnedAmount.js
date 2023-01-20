"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCollectionOwnedAmount = void 0;
const wallet_adapter_react_xnft_1 = require("wallet-adapter-react-xnft");
const web3_js_1 = require("@solana/web3.js");
const react_1 = require("react");
const client_1 = require("@apollo/client");
const GET_MINTS_IN_COLLECTION = (0, client_1.gql) `
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
function useCollectionOwnedAmount(collection) {
    const { publicKey } = (0, wallet_adapter_react_xnft_1.useWallet)();
    const { data: { nfts } = {}, error, loading, } = (0, client_1.useQuery)(GET_MINTS_IN_COLLECTION, {
        variables: {
            collection: collection === null || collection === void 0 ? void 0 : collection.toBase58(),
            wallet: publicKey === null || publicKey === void 0 ? void 0 : publicKey.toBase58(),
            offset: 0,
            limit: 1000,
        },
    });
    const matches = (0, react_1.useMemo)(() => {
        if (nfts) {
            return nfts.map((nft) => new web3_js_1.PublicKey(nft.mintAddress));
        }
    }, [nfts, collection === null || collection === void 0 ? void 0 : collection.toBase58()]);
    const amount = (0, react_1.useMemo)(() => {
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
exports.useCollectionOwnedAmount = useCollectionOwnedAmount;
//# sourceMappingURL=useCollectionOwnedAmount.js.map