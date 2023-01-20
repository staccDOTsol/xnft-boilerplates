import { useAsyncCallback } from "react-async-hook";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useWallet } from "wallet-adapter-react-xnft";
import { useStrataSdks } from "./useStrataSdks";
export const useSwap = (swapArgs = {}) => {
    const { connected, publicKey } = useWallet();
    const { tokenBondingSdk, loading: sdkLoading } = useStrataSdks();
    const { result: data, execute, error, loading, } = useAsyncCallback(async (args) => {
        if (!connected || !publicKey || !tokenBondingSdk)
            throw new WalletNotConnectedError();
        return await tokenBondingSdk.swap({ ...args, ...swapArgs });
    });
    return {
        execute,
        data,
        loading,
        error,
    };
};
//# sourceMappingURL=useSwap.js.map