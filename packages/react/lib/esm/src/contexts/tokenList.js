import { TokenListProvider as Provider, ENV } from "@solana/spl-token-registry";
import React, { useEffect, useState } from "react";
export const TokenListContext = React.createContext(undefined);
export const TokenListProvider = ({ children }) => {
    const [tokenMap, setTokenMap] = useState(new Map());
    useEffect(() => {
        new Provider().resolve().then((tokens) => {
            const tokenList = tokens.filterByChainId(ENV.MainnetBeta).getList();
            setTokenMap(tokenList.reduce((map, item) => {
                map.set(item.address, item);
                return map;
            }, new Map()));
        });
    }, [setTokenMap]);
    return React.createElement(TokenListContext.Provider, { value: tokenMap }, children);
};
//# sourceMappingURL=tokenList.js.map