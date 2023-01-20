import axios from "axios";
import { useState } from "react";
import { useInterval } from "./useInterval";
import LRU from "lru-cache";
const lru = new LRU({
    ttl: 1000 * 60 * 2,
    ttlAutopurge: true
});
export async function getCoinGeckoPriceUsd(tokenName = "solana") {
    let searchName = tokenName.toLowerCase();
    // Some mappings
    if (searchName === "grape") {
        searchName = "grape-2";
    }
    if (!lru.has(searchName)) {
        const resp = await axios(`https://api.coingecko.com/api/v3/simple/price?ids=${searchName}&vs_currencies=usd`);
        const result = resp.data[searchName];
        if (result) {
            lru.set(searchName, result.usd);
        }
    }
    return lru.get(searchName);
}
export const useCoinGeckoPrice = (tokenName = "solana") => {
    const [price, setPrice] = useState();
    useInterval(() => {
        getCoinGeckoPriceUsd(tokenName)?.then(p => setPrice(p)).catch(console.log);
    }, 2 * 60 * 1000);
    return price;
};
//# sourceMappingURL=useCoinGeckoPrice.js.map