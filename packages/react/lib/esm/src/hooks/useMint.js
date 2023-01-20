import { MintLayout, u64 } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { useAccount } from "./useAccount";
const deserializeMint = (data) => {
    if (data.length !== MintLayout.span) {
        throw new Error("Not a valid Mint");
    }
    const mintInfo = MintLayout.decode(data);
    if (mintInfo.mintAuthorityOption === 0) {
        mintInfo.mintAuthority = null;
    }
    else {
        mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority);
    }
    mintInfo.supply = u64.fromBuffer(mintInfo.supply);
    mintInfo.isInitialized = mintInfo.isInitialized !== 0;
    if (mintInfo.freezeAuthorityOption === 0) {
        mintInfo.freezeAuthority = null;
    }
    else {
        mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority);
    }
    return mintInfo;
};
export const MintParser = (pubKey, info) => {
    const buffer = Buffer.from(info.data);
    const data = deserializeMint(buffer);
    const details = {
        pubkey: pubKey,
        account: {
            ...info,
        },
        info: data,
    };
    return details;
};
export function useMint(key) {
    return useAccount(key, MintParser).info?.info;
}
//# sourceMappingURL=useMint.js.map