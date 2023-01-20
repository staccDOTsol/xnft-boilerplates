"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePublicKey = void 0;
const react_1 = require("react");
const web3_js_1 = require("@solana/web3.js");
const usePublicKey = (publicKeyStr) => (0, react_1.useMemo)(() => {
    if (publicKeyStr) {
        try {
            return new web3_js_1.PublicKey(publicKeyStr);
        }
        catch (_a) {
            // ignore
        }
    }
}, [publicKeyStr]);
exports.usePublicKey = usePublicKey;
//# sourceMappingURL=usePublicKey.js.map