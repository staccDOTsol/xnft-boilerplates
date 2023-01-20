import { useAsync } from "react-async-hook";
import { useStrataSdks } from "./useStrataSdks";
async function getWrappedSol(tokenBondingSdk) {
    if (!tokenBondingSdk) {
        return;
    }
    return (await tokenBondingSdk.getState())?.wrappedSolMint;
}
export function useTwWrappedSolMint() {
    const { tokenBondingSdk } = useStrataSdks();
    const { result: wrappedSolMint, error } = useAsync(getWrappedSol, [tokenBondingSdk]);
    if (error) {
        console.error(error);
    }
    return wrappedSolMint;
}
//# sourceMappingURL=useTwWrappedSolMint.js.map