import { SplTokenBonding } from "@strata-foundation/spl-token-bonding";
import { SplTokenCollective } from "@strata-foundation/spl-token-collective";
import { FungibleEntangler } from "@strata-foundation/fungible-entangler";
import { SplTokenMetadata } from "@strata-foundation/spl-utils";
import React, { useMemo } from "react";
import { useAsync } from "react-async-hook";
import { useProvider } from "../hooks/useProvider";
export const StrataSdksContext = React.createContext({
    loading: true,
});
async function tryProm(prom) {
    try {
        return await prom;
    }
    catch (e) {
        console.error(e);
    }
    return undefined;
}
async function getSdks(provider) {
    if (!provider) {
        console.warn("No provider passed via ProviderContext to StrataSdkContext. Please provide a provider");
        return {};
    }
    const [tokenCollective, tokenBonding, fungibleEntangler, splTokenMetadataSdk,] = (await tryProm(Promise.all([
        SplTokenCollective.init(provider),
        SplTokenBonding.init(provider),
        FungibleEntangler.init(provider),
        SplTokenMetadata.init(provider),
    ])) || []);
    return {
        tokenCollectiveSdk: tokenCollective,
        tokenBondingSdk: tokenBonding,
        tokenMetadataSdk: splTokenMetadataSdk,
        fungibleEntanglerSdk: fungibleEntangler,
    };
}
export const StrataSdksProvider = ({ children }) => {
    const { provider } = useProvider();
    const { result, loading, error } = useAsync(getSdks, [provider]);
    const sdks = useMemo(() => ({
        tokenCollectiveSdk: result?.tokenCollectiveSdk,
        tokenBondingSdk: result?.tokenBondingSdk,
        fungibleEntanglerSdk: result?.fungibleEntanglerSdk,
        tokenMetadataSdk: result?.tokenMetadataSdk,
        error,
        loading,
    }), [result, loading, error, provider]);
    return (React.createElement(StrataSdksContext.Provider, { value: sdks }, children));
};
//# sourceMappingURL=strataSdkContext.js.map