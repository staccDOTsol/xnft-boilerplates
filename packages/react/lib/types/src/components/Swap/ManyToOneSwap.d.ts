import { PublicKey } from "@solana/web3.js";
import { IManyToOneSwapDriverArgs } from "../../hooks/useManyToOneSwapDriver";
interface IManyToOneSwapProps extends Pick<IManyToOneSwapDriverArgs, "onConnectWallet" | "extraTransactionInfo" | "inputs"> {
    targetMint: PublicKey;
}
export declare const ManyToOneSwap: ({ onConnectWallet, extraTransactionInfo, inputs, targetMint, }: IManyToOneSwapProps) => JSX.Element;
export {};
//# sourceMappingURL=ManyToOneSwap.d.ts.map