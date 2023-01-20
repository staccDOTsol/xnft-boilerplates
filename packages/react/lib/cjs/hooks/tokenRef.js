"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTokenRefForName = exports.usePrimaryClaimedTokenRef = exports.useMintTokenRef = exports.useTokenRefFromBonding = exports.useClaimedTokenRefKey = exports.useClaimedTokenRefKeyForName = exports.useUnclaimedTokenRefKeyForName = exports.getUnclaimedTokenRefKeyForName = exports.getClaimedTokenRefKeyForName = exports.getOwnerForName = void 0;
const spl_name_service_1 = require("@solana/spl-name-service");
const wallet_adapter_react_xnft_1 = require("wallet-adapter-react-xnft");
const spl_token_collective_1 = require("@strata-foundation/spl-token-collective");
const borsh_1 = require("borsh");
const react_1 = require("react");
const react_async_hook_1 = require("react-async-hook");
const useAccountFetchCache_1 = require("../hooks/useAccountFetchCache");
const useTokenBonding_1 = require("../hooks/useTokenBonding");
const useTokenRef_1 = require("../hooks/useTokenRef");
const nameServiceTwitter_1 = require("../utils/nameServiceTwitter");
function getOwnerForName(cache, handle, tld) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = handle && (yield (0, nameServiceTwitter_1.getTwitterRegistryKey)(handle, tld));
        if (key && cache) {
            const [registry, dispose] = yield cache.searchAndWatch(key, (pubkey, account) => {
                const info = (0, borsh_1.deserializeUnchecked)(spl_name_service_1.NameRegistryState.schema, spl_name_service_1.NameRegistryState, account.data);
                return {
                    pubkey,
                    account,
                    info,
                };
            }, true);
            setTimeout(dispose, 30 * 1000); // Keep this state around for 30s
            return registry === null || registry === void 0 ? void 0 : registry.info.owner;
        }
    });
}
exports.getOwnerForName = getOwnerForName;
function getClaimedTokenRefKeyForName(cache, handle, mint = undefined, tld) {
    return __awaiter(this, void 0, void 0, function* () {
        const owner = yield getOwnerForName(cache, handle, tld);
        if (owner) {
            return (yield spl_token_collective_1.SplTokenCollective.ownerTokenRefKey({
                owner,
                mint,
            }))[0];
        }
    });
}
exports.getClaimedTokenRefKeyForName = getClaimedTokenRefKeyForName;
function getUnclaimedTokenRefKeyForName(handle, mint, tld) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = yield (0, nameServiceTwitter_1.getTwitterRegistryKey)(handle, tld);
        return (yield spl_token_collective_1.SplTokenCollective.ownerTokenRefKey({
            name,
            mint: mint || spl_token_collective_1.SplTokenCollective.OPEN_COLLECTIVE_MINT_ID,
        }))[0];
    });
}
exports.getUnclaimedTokenRefKeyForName = getUnclaimedTokenRefKeyForName;
const useUnclaimedTokenRefKeyForName = (name, mint, tld) => {
    const { connection } = (0, wallet_adapter_react_xnft_1.useConnection)();
    const { result: key, loading } = (0, react_async_hook_1.useAsync)((name, mint, tld) => __awaiter(void 0, void 0, void 0, function* () {
        if (connection && name) {
            return getUnclaimedTokenRefKeyForName(name, mint, tld);
        }
    }), [name, mint, tld]);
    return { result: key, loading };
};
exports.useUnclaimedTokenRefKeyForName = useUnclaimedTokenRefKeyForName;
const useClaimedTokenRefKeyForName = (name, mint, tld) => {
    const cache = (0, useAccountFetchCache_1.useAccountFetchCache)();
    const { result: key, loading, error } = (0, react_async_hook_1.useAsync)((cache, name, mint, tld) => __awaiter(void 0, void 0, void 0, function* () {
        if (cache && name && tld) {
            return getClaimedTokenRefKeyForName(cache, name, mint, tld);
        }
    }), [cache, name, mint, tld]);
    return { result: key, loading, error };
};
exports.useClaimedTokenRefKeyForName = useClaimedTokenRefKeyForName;
const useClaimedTokenRefKey = (owner, mint) => {
    const { result } = (0, react_async_hook_1.useAsync)((owner) => __awaiter(void 0, void 0, void 0, function* () { return owner && spl_token_collective_1.SplTokenCollective.ownerTokenRefKey({ owner, mint }); }), [owner]);
    return result ? result[0] : undefined;
};
exports.useClaimedTokenRefKey = useClaimedTokenRefKey;
/**
 * Get a token ref from the bonding instance
 *
 * @param tokenBonding
 * @returns
 */
function useTokenRefFromBonding(tokenBonding) {
    const bonding = (0, useTokenBonding_1.useTokenBonding)(tokenBonding);
    const { result: key } = (0, react_async_hook_1.useAsync)((bonding) => __awaiter(this, void 0, void 0, function* () { return bonding && spl_token_collective_1.SplTokenCollective.mintTokenRefKey(bonding.targetMint); }), [bonding.info]);
    return (0, useTokenRef_1.useTokenRef)(key && key[0]);
}
exports.useTokenRefFromBonding = useTokenRefFromBonding;
/**
 * Given a social token mint, get the social token TokenRef
 *
 * @param mint
 * @returns
 */
function useMintTokenRef(mint) {
    const { result: key } = (0, react_async_hook_1.useAsync)((mint) => __awaiter(this, void 0, void 0, function* () { return mint && spl_token_collective_1.SplTokenCollective.mintTokenRefKey(mint); }), [mint]);
    return (0, useTokenRef_1.useTokenRef)(key && key[0]);
}
exports.useMintTokenRef = useMintTokenRef;
/**
 * Get the token ref for this wallet
 * @param owner
 * @returns
 */
function usePrimaryClaimedTokenRef(owner) {
    const key = (0, exports.useClaimedTokenRefKey)(owner, null);
    return (0, useTokenRef_1.useTokenRef)(key);
}
exports.usePrimaryClaimedTokenRef = usePrimaryClaimedTokenRef;
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
const useTokenRefForName = (name, mint, tld) => {
    const { result: claimedKey, loading: twitterLoading, error } = (0, exports.useClaimedTokenRefKeyForName)(name, mint, tld);
    if (error) {
        console.error(error);
    }
    const { result: unclaimedKey, loading: claimedLoading } = (0, exports.useUnclaimedTokenRefKeyForName)(name, mint, tld);
    const claimed = (0, useTokenRef_1.useTokenRef)(claimedKey);
    const unclaimed = (0, useTokenRef_1.useTokenRef)(unclaimedKey);
    const result = (0, react_1.useMemo)(() => {
        if (claimed.info) {
            return claimed;
        }
        return unclaimed;
    }, [claimed === null || claimed === void 0 ? void 0 : claimed.info, unclaimed === null || unclaimed === void 0 ? void 0 : unclaimed.info, claimed.loading, unclaimed.loading]);
    const loading = (0, react_1.useMemo)(() => {
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
    return Object.assign(Object.assign({}, result), { loading });
};
exports.useTokenRefForName = useTokenRefForName;
//# sourceMappingURL=tokenRef.js.map