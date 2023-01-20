import { useWallet } from "wallet-adapter-react-xnft";
import { useMintTokenRef } from "./tokenRef";
import { useAssociatedAccount } from "./useAssociatedAccount";
import { useMetaplexTokenMetadata } from "./useMetaplexMetadata";
/**
 * Get the token account and all metaplex + token collective metadata around the token
 *
 * @param token
 * @returns
 */
export function useTokenMetadata(token) {
    const metaplexData = useMetaplexTokenMetadata(token);
    const wallet = useWallet();
    const { associatedAccount } = useAssociatedAccount(wallet.publicKey, token);
    const { info: mintTokenRef, loading: loadingTokenRef } = useMintTokenRef(token);
    return {
        ...metaplexData,
        tokenRef: mintTokenRef,
        loading: Boolean(token && (loadingTokenRef || metaplexData.loading)),
        account: associatedAccount,
    };
}
//# sourceMappingURL=useTokenMetadata.js.map