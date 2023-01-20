"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCollective = void 0;
const useAccount_1 = require("./useAccount");
const useStrataSdks_1 = require("./useStrataSdks");
function useCollective(collective) {
    const { tokenCollectiveSdk } = (0, useStrataSdks_1.useStrataSdks)();
    return (0, useAccount_1.useAccount)(collective, tokenCollectiveSdk === null || tokenCollectiveSdk === void 0 ? void 0 : tokenCollectiveSdk.collectiveDecoder, false);
}
exports.useCollective = useCollective;
//# sourceMappingURL=useCollective.js.map