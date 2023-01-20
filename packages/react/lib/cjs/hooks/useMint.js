"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMint = exports.MintParser = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const useAccount_1 = require("./useAccount");
const deserializeMint = (data) => {
    if (data.length !== spl_token_1.MintLayout.span) {
        throw new Error("Not a valid Mint");
    }
    const mintInfo = spl_token_1.MintLayout.decode(data);
    if (mintInfo.mintAuthorityOption === 0) {
        mintInfo.mintAuthority = null;
    }
    else {
        mintInfo.mintAuthority = new web3_js_1.PublicKey(mintInfo.mintAuthority);
    }
    mintInfo.supply = spl_token_1.u64.fromBuffer(mintInfo.supply);
    mintInfo.isInitialized = mintInfo.isInitialized !== 0;
    if (mintInfo.freezeAuthorityOption === 0) {
        mintInfo.freezeAuthority = null;
    }
    else {
        mintInfo.freezeAuthority = new web3_js_1.PublicKey(mintInfo.freezeAuthority);
    }
    return mintInfo;
};
const MintParser = (pubKey, info) => {
    const buffer = Buffer.from(info.data);
    const data = deserializeMint(buffer);
    const details = {
        pubkey: pubKey,
        account: Object.assign({}, info),
        info: data,
    };
    return details;
};
exports.MintParser = MintParser;
function useMint(key) {
    var _a;
    return (_a = (0, useAccount_1.useAccount)(key, exports.MintParser).info) === null || _a === void 0 ? void 0 : _a.info;
}
exports.useMint = useMint;
//# sourceMappingURL=useMint.js.map