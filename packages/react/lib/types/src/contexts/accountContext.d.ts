import { Commitment } from "@solana/web3.js";
import { AccountFetchCache } from "@strata-foundation/spl-utils";
import React, { FC, ReactNode } from "react";
export interface IAccountProviderProps {
    children: ReactNode;
    commitment: Commitment;
    extendConnection?: boolean;
}
export declare const AccountContext: React.Context<AccountFetchCache>;
export declare const AccountProvider: FC<IAccountProviderProps>;
//# sourceMappingURL=accountContext.d.ts.map