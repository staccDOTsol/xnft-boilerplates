import React, { createContext } from "react";
import { PublicKey } from "@solana/web3.js";
import { useCoinGeckoPrice } from "../hooks/useCoinGeckoPrice";
import { useMarketPrice } from "../hooks/useMarketPrice";
export const SolPriceContext = createContext(undefined);
const SOL_TO_USD_MARKET = new PublicKey("9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT");
export const SolPriceProvider = ({ children }) => {
    const coinGeckoPrice = useCoinGeckoPrice();
    const marketPrice = useMarketPrice(SOL_TO_USD_MARKET);
    return (React.createElement(SolPriceContext.Provider, { value: marketPrice || coinGeckoPrice }, children));
};
//# sourceMappingURL=solPrice.js.map