import { useAccount } from "./useAccount";
import { TokenAccountParser } from "../utils/getWalletTokenAccounts";
const parser = (pubkey, acct) => {
    return TokenAccountParser(pubkey, acct)?.info;
};
export function useTokenAccount(address) {
    return useAccount(address, parser);
}
//# sourceMappingURL=useTokenAccount.js.map