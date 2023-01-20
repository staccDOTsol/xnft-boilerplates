import { Governance, GovernanceAccountParser } from "@solana/spl-governance";
import { PublicKey } from "@solana/web3.js";
import { useAccount } from "./useAccount";
function govParser(pubkey, account) {
    const parse = GovernanceAccountParser(Governance);
    if (account.owner.equals(new PublicKey("GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw"))) {
        return parse(pubkey, account).account;
    }
}
export function useGovernance(governance) {
    return useAccount(governance, govParser);
}
//# sourceMappingURL=useGovernance.js.map