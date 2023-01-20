import { ISwapArgs, IPreInstructionArgs, IPostInstructionArgs } from "@strata-foundation/spl-token-bonding";
import { InstructionResult } from "@strata-foundation/spl-utils";
export type SwapArgs = {
    preInstructions?: (args: IPreInstructionArgs) => Promise<InstructionResult<null>>;
    postInstructions?: (args: IPostInstructionArgs) => Promise<InstructionResult<null>>;
};
export declare const useSwap: (swapArgs?: SwapArgs) => {
    execute: (args: ISwapArgs) => Promise<{
        targetAmount: number;
    }>;
    data: {
        targetAmount: number;
    } | undefined;
    loading: boolean;
    error: Error | undefined;
};
//# sourceMappingURL=useSwap.d.ts.map