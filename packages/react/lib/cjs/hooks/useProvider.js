"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProvider = void 0;
const react_1 = require("react");
const providerContext_1 = require("../contexts/providerContext");
/**
 * Get an anchor provider with signTransaction wrapped so that it hits the wallet adapter from wallet-adapter-react.
 *
 * @returns
 */
function useProvider() {
    return (0, react_1.useContext)(providerContext_1.ProviderContext);
}
exports.useProvider = useProvider;
//# sourceMappingURL=useProvider.js.map