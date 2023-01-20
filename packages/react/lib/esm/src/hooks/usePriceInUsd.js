import { usePriceInSol } from "./usePriceInSol";
import { useSolPrice } from "./useSolPrice";
export function usePriceInUsd(token) {
    const solPrice = useSolPrice();
    const solAmount = usePriceInSol(token);
    return solAmount && solPrice && solAmount * solPrice;
}
//# sourceMappingURL=usePriceInUsd.js.map