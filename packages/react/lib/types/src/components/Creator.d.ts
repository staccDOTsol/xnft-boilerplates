import { MetadataData } from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey } from "@solana/web3.js";
import { ITokenRef } from "@strata-foundation/spl-token-collective";
import React from "react";
export declare const WUMBO_TWITTER_VERIFIER: PublicKey;
export declare const WUMBO_TWITTER_TLD: PublicKey;
export declare const truncatePubkey: (pkey: PublicKey) => string;
export type OnCreatorClick = (c: PublicKey, t: MetadataData | undefined, b: ITokenRef | undefined, h: string | undefined) => void;
export declare const Creator: React.MemoExoticComponent<({ creator, onClick }: {
    creator: PublicKey;
    onClick: OnCreatorClick;
}) => JSX.Element>;
//# sourceMappingURL=Creator.d.ts.map