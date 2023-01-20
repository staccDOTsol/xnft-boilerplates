import { useContext } from "react";
import { ProviderContext } from "../contexts/providerContext";
/**
 * Get an anchor provider with signTransaction wrapped so that it hits the wallet adapter from wallet-adapter-react.
 *
 * @returns
 */
export function useProvider() {
    return useContext(ProviderContext);
}
//# sourceMappingURL=useProvider.js.map