import { SplTokenBonding } from "@strata-foundation/spl-token-bonding";
import { SplTokenCollective } from "@strata-foundation/spl-token-collective";
import { FungibleEntangler } from "@strata-foundation/fungible-entangler";
import { SplTokenMetadata } from "@strata-foundation/spl-utils";
import React from "react";
export declare const StrataSdksContext: React.Context<IStrataSdksReactState>;
export interface IStrataSdks {
    tokenBondingSdk?: SplTokenBonding;
    tokenCollectiveSdk?: SplTokenCollective;
    fungibleEntanglerSdk?: FungibleEntangler;
    tokenMetadataSdk?: SplTokenMetadata;
}
export interface IStrataSdksReactState extends IStrataSdks {
    error?: Error;
    loading: boolean;
}
export declare const StrataSdksProvider: React.FC<React.PropsWithChildren<{}>>;
//# sourceMappingURL=strataSdkContext.d.ts.map