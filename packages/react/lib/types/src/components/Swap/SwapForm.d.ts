import { PublicKey } from "@solana/web3.js";
import { BondingPricing } from "@strata-foundation/spl-token-bonding";
import React from "react";
import { TransactionInfoArgs } from "./TransactionInfo";
export interface ISwapFormValues {
    topAmount: number;
    bottomAmount: number;
    slippage: number;
    lastSet: "bottom" | "top";
}
export interface ISwapFormProps {
    isLoading?: boolean;
    isSubmitting: boolean;
    isBuying: boolean;
    onConnectWallet: () => void;
    onTradingMintsChange: (args: {
        base: PublicKey;
        target: PublicKey;
    }) => void;
    onBuyBase?: (tokenBonding: PublicKey) => void;
    onSubmit: (values: ISwapFormValues) => Promise<void>;
    goLiveDate: Date | undefined;
    id: PublicKey | undefined;
    pricing: BondingPricing | undefined;
    baseOptions: PublicKey[];
    targetOptions: PublicKey[];
    base: {
        name: string;
        ticker: string;
        image: string | undefined;
        publicKey: PublicKey;
    } | undefined;
    target: {
        name: string;
        ticker: string;
        image: string | undefined;
        publicKey: PublicKey;
    } | undefined;
    ownedBase: number | undefined;
    spendCap: number;
    mintCap?: number;
    numRemaining?: number;
    feeAmount?: number;
    showAttribution?: boolean;
    extraTransactionInfo?: Omit<TransactionInfoArgs, "formRef">[];
    swapBaseWithTargetEnabled?: boolean;
}
export declare const SwapForm: ({ isLoading, extraTransactionInfo, isSubmitting, onConnectWallet, onTradingMintsChange, onBuyBase, onSubmit, id, pricing, base, target, ownedBase, spendCap, feeAmount, baseOptions, targetOptions, mintCap, isBuying, goLiveDate, numRemaining, showAttribution, swapBaseWithTargetEnabled, }: ISwapFormProps) => JSX.Element;
export declare const MemodSwapForm: React.MemoExoticComponent<({ isLoading, extraTransactionInfo, isSubmitting, onConnectWallet, onTradingMintsChange, onBuyBase, onSubmit, id, pricing, base, target, ownedBase, spendCap, feeAmount, baseOptions, targetOptions, mintCap, isBuying, goLiveDate, numRemaining, showAttribution, swapBaseWithTargetEnabled, }: ISwapFormProps) => JSX.Element>;
//# sourceMappingURL=SwapForm.d.ts.map