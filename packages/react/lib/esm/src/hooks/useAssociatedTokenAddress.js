import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useAsync } from "react-async-hook";
const fetch = async (wallet, mint) => {
    if (!wallet || !mint) {
        return undefined;
    }
    return Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, wallet, true);
};
export function useAssociatedTokenAddress(wallet, mint) {
    const { result, loading } = useAsync(fetch, [wallet, mint]);
    return { result, loading };
}
//# sourceMappingURL=useAssociatedTokenAddress.js.map