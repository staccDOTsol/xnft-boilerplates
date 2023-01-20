"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Creator = exports.truncatePubkey = exports.WUMBO_TWITTER_TLD = exports.WUMBO_TWITTER_VERIFIER = void 0;
const react_1 = require("@chakra-ui/react");
const web3_js_1 = require("@solana/web3.js");
const useSocialTokenMetadata_1 = require("../hooks/useSocialTokenMetadata");
const useErrorHandler_1 = require("../hooks/useErrorHandler");
const react_2 = __importDefault(require("react"));
const nameService_1 = require("../hooks/nameService");
const useGovernance_1 = require("../hooks/useGovernance");
exports.WUMBO_TWITTER_VERIFIER = new web3_js_1.PublicKey("DTok7pfUzNeNPqU3Q6foySCezPQE82eRyhX1HdhVNLVC");
exports.WUMBO_TWITTER_TLD = new web3_js_1.PublicKey("Fhqd3ostRQQE65hzoA7xFMgT9kge2qPnsTNAKuL2yrnx");
// export const WUMBO_TWITTER_VERIFIER = new PublicKey(
//   "GibysS6yTqHWw4AZap416Xs26rAo9nV9HTRviKuutytp"
// );
// export const WUMBO_TWITTER_TLD = new PublicKey(
//   "EEbZHaBD4mreYS6enRqytXvXfmRESLWXXrXbtZLWyd6X"
// );
const truncatePubkey = (pkey) => {
    const pkeyStr = pkey.toString();
    return `${pkeyStr.substr(0, 4)}...${pkeyStr.substr(pkeyStr.length - 4)}`;
};
exports.truncatePubkey = truncatePubkey;
exports.Creator = react_2.default.memo(({ creator, onClick }) => {
    const { handleErrors } = (0, useErrorHandler_1.useErrorHandler)();
    const { metadata, tokenRef, error, image } = (0, useSocialTokenMetadata_1.useSocialTokenMetadata)(creator);
    const { nameString: handle, error: reverseTwitterError2 } = (0, nameService_1.useReverseName)(creator, exports.WUMBO_TWITTER_VERIFIER, exports.WUMBO_TWITTER_TLD);
    handleErrors(error, reverseTwitterError2);
    const { info: governance } = (0, useGovernance_1.useGovernance)(creator);
    const children = (react_2.default.createElement(react_2.default.Fragment, null,
        metadata && (react_2.default.createElement(react_1.HStack, { spacing: 1 },
            react_2.default.createElement(react_1.Avatar, { size: "xs", src: image }),
            react_2.default.createElement(react_1.Text, null, metadata.data.name))),
        !metadata && !handle && (0, exports.truncatePubkey)(creator),
        !metadata && handle && `@${handle}`));
    if (governance) {
        react_2.default.createElement(react_1.Link, { isExternal: true, href: `https://realms.today/dao/${governance.realm.toBase58()}` }, children);
    }
    return (react_2.default.createElement(react_1.Box, { _hover: { cursor: 'pointer', textDecoration: 'underline' }, onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick(creator, metadata, tokenRef, handle);
        } }, children));
});
//# sourceMappingURL=Creator.js.map