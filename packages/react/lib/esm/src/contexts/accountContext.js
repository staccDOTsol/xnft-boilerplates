import { useConnection } from "wallet-adapter-react-xnft";
import { AccountFetchCache } from "@strata-foundation/spl-utils";
import React, { createContext, useEffect, useState } from "react";
import { DEFAULT_COMMITMENT } from "../constants/globals";
export const AccountContext = createContext(undefined);
export const AccountProvider = ({ children, commitment = DEFAULT_COMMITMENT, extendConnection = true, }) => {
    const { connection } = useConnection();
    const [cache, setCache] = useState();
    useEffect(() => {
        if (connection) {
            cache?.close();
            setCache(new AccountFetchCache({
                connection,
                delay: 50,
                commitment,
                extendConnection,
            }));
        }
    }, [connection]);
    return (React.createElement(AccountContext.Provider, { value: cache }, children));
    return null;
};
//# sourceMappingURL=accountContext.js.map