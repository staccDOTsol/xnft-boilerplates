"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMetaplexTokenMetadata = exports.solMetadata = exports.toMetadata = void 0;
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const spl_token_1 = require("@solana/spl-token");
const spl_utils_1 = require("@strata-foundation/spl-utils");
const react_1 = require("react");
const react_async_hook_1 = require("react-async-hook");
const useStrataSdks_1 = require("./useStrataSdks");
const useAccount_1 = require("./useAccount");
const useMint_1 = require("./useMint");
const useTokenList_1 = require("./useTokenList");
const useTwWrappedSolMint_1 = require("./useTwWrappedSolMint");
function toMetadata(tokenInfo) {
    if (!tokenInfo) {
        return undefined;
    }
    return new mpl_token_metadata_1.MetadataData({
        updateAuthority: "",
        mint: tokenInfo.address,
        data: new mpl_token_metadata_1.DataV2({
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            uri: tokenInfo.logoURI || "",
            creators: null,
            sellerFeeBasisPoints: 0,
            collection: null,
            uses: null,
        }),
        primarySaleHappened: false,
        isMutable: false,
        editionNonce: null,
    });
}
exports.toMetadata = toMetadata;
const parser = (key, acct) => acct && new mpl_token_metadata_1.Metadata(key, acct).data;
exports.solMetadata = new mpl_token_metadata_1.MetadataData({
    updateAuthority: "",
    mint: spl_token_1.NATIVE_MINT.toBase58(),
    data: new mpl_token_metadata_1.DataV2({
        name: "Solana",
        symbol: "SOL",
        uri: "https://strata-token-metadata.s3.us-east-2.amazonaws.com/sol.json",
        creators: null,
        sellerFeeBasisPoints: 0,
        collection: null,
        uses: null,
    }),
    primarySaleHappened: false,
    isMutable: false,
    editionNonce: null,
});
/**
 * Get the token account and all metaplex metadata around the token
 *
 * @param token
 * @returns
 */
function useMetaplexTokenMetadata(token) {
    const { result: metadataAccountKey, loading, error, } = (0, react_async_hook_1.useAsync)((token) => __awaiter(this, void 0, void 0, function* () { return token ? mpl_token_metadata_1.Metadata.getPDA(token) : undefined; }), [token === null || token === void 0 ? void 0 : token.toBase58()]);
    let { info: metadata, loading: accountLoading } = (0, useAccount_1.useAccount)(metadataAccountKey, parser);
    const wrappedSolMint = (0, useTwWrappedSolMint_1.useTwWrappedSolMint)();
    const isSol = (token === null || token === void 0 ? void 0 : token.equals(spl_token_1.NATIVE_MINT)) ||
        (wrappedSolMint && (token === null || token === void 0 ? void 0 : token.equals(wrappedSolMint)));
    if (isSol) {
        metadata = exports.solMetadata;
    }
    const { tokenMetadataSdk: splTokenMetadataSdk } = (0, useStrataSdks_1.useStrataSdks)();
    const getEditionInfo = splTokenMetadataSdk
        ? splTokenMetadataSdk.getEditionInfo
        : () => Promise.resolve({});
    const { result: editionInfo } = (0, react_async_hook_1.useAsync)((metadata) => __awaiter(this, void 0, void 0, function* () { return (yield getEditionInfo(metadata)) || []; }), [metadata]);
    const tokenList = (0, useTokenList_1.useTokenList)();
    const { result: data, loading: dataLoading, error: dataError, } = (0, react_async_hook_1.useAsync)(spl_utils_1.SplTokenMetadata.getArweaveMetadata, [metadata === null || metadata === void 0 ? void 0 : metadata.data.uri]);
    const { result: image, loading: imageLoading, error: imageError, } = (0, react_async_hook_1.useAsync)(spl_utils_1.SplTokenMetadata.getImage, [metadata === null || metadata === void 0 ? void 0 : metadata.data.uri]);
    const mint = (0, useMint_1.useMint)(token);
    const metadataOrTokenListMetadata = (0, react_1.useMemo)(() => {
        if (metadata) {
            return metadata;
        }
        if (token) {
            return toMetadata(tokenList === null || tokenList === void 0 ? void 0 : tokenList.get(token.toBase58()));
        }
    }, [token, metadata]);
    const imageWithTokenlist = (0, react_1.useMemo)(() => {
        if (!image) {
            return metadataOrTokenListMetadata === null || metadataOrTokenListMetadata === void 0 ? void 0 : metadataOrTokenListMetadata.data.uri;
        }
        return image;
    }, [
        image,
        metadataOrTokenListMetadata,
    ]);
    const displayName = (metadataOrTokenListMetadata === null || metadataOrTokenListMetadata === void 0 ? void 0 : metadataOrTokenListMetadata.data.name.length) == 32
        ? data === null || data === void 0 ? void 0 : data.name
        : metadataOrTokenListMetadata === null || metadataOrTokenListMetadata === void 0 ? void 0 : metadataOrTokenListMetadata.data.name;
    return Object.assign({ loading: Boolean(token && (loading || accountLoading || dataLoading || imageLoading)), displayName, error: error || dataError || imageError, mint, metadata: metadataOrTokenListMetadata, metadataKey: metadataAccountKey, data, image: imageWithTokenlist, description: data === null || data === void 0 ? void 0 : data.description }, editionInfo);
}
exports.useMetaplexTokenMetadata = useMetaplexTokenMetadata;
//# sourceMappingURL=useMetaplexMetadata.js.map