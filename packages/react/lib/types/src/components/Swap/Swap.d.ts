import { PublicKey } from "@solana/web3.js";
import { ISwapArgs } from "@strata-foundation/spl-token-bonding";
import React from "react";
export declare const Swap: ({ id, onConnectWallet, onSuccess, }: {
    id: PublicKey;
    onConnectWallet?: () => void;
    onSuccess?: (values: ISwapArgs & {
        targetAmount: number;
    }) => void;
}) => JSX.Element;
export declare const MemodSwap: React.MemoExoticComponent<({ id, onConnectWallet, onSuccess, }: {
    id: PublicKey;
    onConnectWallet?: () => void;
    onSuccess?: (values: ISwapArgs & {
        targetAmount: number;
    }) => void;
}) => JSX.Element>;
//# sourceMappingURL=Swap.d.ts.map