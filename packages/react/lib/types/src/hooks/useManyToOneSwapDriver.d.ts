import { PublicKey } from "@solana/web3.js";
import { ISwapFormProps } from "../components/Swap/SwapForm";
import { ISwapDriverArgs } from "./useSwapDriver";
export interface IManyToOneSwapDriverArgs extends Omit<ISwapDriverArgs, "id" | "tradingMints"> {
    inputs: {
        baseMint: PublicKey;
        tokenBonding: PublicKey;
    }[];
    baseMint: PublicKey;
    targetMint: PublicKey;
}
export declare const useManyToOneSwapDriver: ({ onConnectWallet, extraTransactionInfo, inputs, onTradingMintsChange, swap, baseMint, targetMint }: IManyToOneSwapDriverArgs) => Omit<ISwapFormProps, "isSubmitting"> & {
    loading: boolean;
};
//# sourceMappingURL=useManyToOneSwapDriver.d.ts.map