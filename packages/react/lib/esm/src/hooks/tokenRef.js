import { NameRegistryState } from "@solana/spl-name-service";
import { useConnection } from "wallet-adapter-react-xnft";
import { SplTokenCollective } from "@strata-foundation/spl-token-collective";
import { deserializeUnchecked } from "borsh";
import { useMemo } from "react";
import { useAsync } from "react-async-hook";
import { useAccountFetchCache } from "../hooks/useAccountFetchCache";
import { useTokenBonding } from "../hooks/useTokenBonding";
import { useTokenRef } from "../hooks/useTokenRef";
import { getTwitterRegistryKey } from "../utils/nameServiceTwitter";
export async function getOwnerForName(cache, handle, tld) {
    const key = handle && await getTwitterRegistryKey(handle, tld);
    if (key && cache) {
        const [registry, dispose] = await cache.searchAndWatch(key, (pubkey, account) => {
            const info = deserializeUnchecked(NameRegistryState.schema, NameRegistryState, account.data);
            return {
                pubkey,
                account,
                info,
            };
        }, true);
        setTimeout(dispose, 30 * 1000); // Keep this state around for 30s
        return registry?.info.owner;
    }
}
export async function getClaimedTokenRefKeyForName(cache, handle, mint = undefined, tld) {
    const owner = await getOwnerForName(cache, handle, tld);
    if (owner) {
        return (await SplTokenCollective.ownerTokenRefKey({
            owner,
            mint,
        }))[0];
    }
}
export async function getUnclaimedTokenRefKeyForName(handle, mint, tld) {
    const name = await getTwitterRegistryKey(handle, tld);
    return (await SplTokenCollective.ownerTokenRefKey({
        name,
        mint: mint || SplTokenCollective.OPEN_COLLECTIVE_MINT_ID,
    }))[0];
}
export const useUnclaimedTokenRefKeyForName = (name, mint, tld) => {
    const { connection } = useConnection();
    const { result: key, loading } = useAsync(async (name, mint, tld) => {
        if (connection && name) {
            return getUnclaimedTokenRefKeyForName(name, mint, tld);
        }
    }, [name, mint, tld]);
    return { result: key, loading };
};
export const useClaimedTokenRefKeyForName = (name, mint, tld) => {
    const cache = useAccountFetchCache();
    const { result: key, loading, error } = useAsync(async (cache, name, mint, tld) => {
        if (cache && name && tld) {
            return getClaimedTokenRefKeyForName(cache, name, mint, tld);
        }
    }, [cache, name, mint, tld]);
    return { result: key, loading, error };
};
export const useClaimedTokenRefKey = (owner, mint) => {
    const { result } = useAsync(async (owner) => owner && SplTokenCollective.ownerTokenRefKey({ owner, mint }), [owner]);
    return result ? result[0] : undefined;
};
/**
 * Get a token ref from the bonding instance
 *
 * @param tokenBonding
 * @returns
 */
export function useTokenRefFromBonding(tokenBonding) {
    const bonding = useTokenBonding(tokenBonding);
    const { result: key } = useAsync(async (bonding) => bonding && SplTokenCollective.mintTokenRefKey(bonding.targetMint), [bonding.info]);
    return useTokenRef(key && key[0]);
}
/**
 * Given a social token mint, get the social token TokenRef
 *
 * @param mint
 * @returns
 */
export function useMintTokenRef(mint) {
    const { result: key } = useAsync(async (mint) => mint && SplTokenCollective.mintTokenRefKey(mint), [mint]);
    return useTokenRef(key && key[0]);
}
/**
 * Get the token ref for this wallet
 * @param owner
 * @returns
 */
export function usePrimaryClaimedTokenRef(owner) {
    const key = useClaimedTokenRefKey(owner, null);
    return useTokenRef(key);
}
/**
 * Get a TokenRef using a twitter handle name service lookup on `name`. Searches for `name`, then grabs the owner.
 *
 * If the name is unclaimed, grabs the unclaimed token ref if it exists
 *
 * @param name
 * @param mint
 * @param tld
 * @returns
 */
export const useTokenRefForName = (name, mint, tld) => {
    const { result: claimedKey, loading: twitterLoading, error } = useClaimedTokenRefKeyForName(name, mint, tld);
    if (error) {
        console.error(error);
    }
    const { result: unclaimedKey, loading: claimedLoading } = useUnclaimedTokenRefKeyForName(name, mint, tld);
    const claimed = useTokenRef(claimedKey);
    const unclaimed = useTokenRef(unclaimedKey);
    const result = useMemo(() => {
        if (claimed.info) {
            return claimed;
        }
        return unclaimed;
    }, [claimed?.info, unclaimed?.info, claimed.loading, unclaimed.loading]);
    const loading = useMemo(() => {
        return (twitterLoading ||
            claimedLoading ||
            claimed.loading ||
            unclaimed.loading);
    }, [
        twitterLoading,
        claimedLoading,
        claimed,
        unclaimed,
    ]);
    return {
        ...result,
        loading,
    };
};
//# sourceMappingURL=tokenRef.js.map