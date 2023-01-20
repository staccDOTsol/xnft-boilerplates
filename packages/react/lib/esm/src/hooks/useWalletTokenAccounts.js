import { useConnection } from "wallet-adapter-react-xnft";
import { useAsync } from "react-async-hook";
import { getWalletTokenAccounts } from "../utils/getWalletTokenAccounts";
/**
 * Get all token accounts associated with this wallet
 * @param owner
 * @returns
 */
export const useWalletTokenAccounts = (owner) => {
    const { connection } = useConnection();
    return useAsync(getWalletTokenAccounts, [connection, owner]);
};
//# sourceMappingURL=useWalletTokenAccounts.js.map