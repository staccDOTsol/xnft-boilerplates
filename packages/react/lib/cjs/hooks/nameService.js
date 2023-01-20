"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNameOwner = exports.useReverseName = exports.reverseNameLookup = void 0;
const spl_name_service_1 = require("@solana/spl-name-service");
const wallet_adapter_react_xnft_1 = require("wallet-adapter-react-xnft");
const useAccount_1 = require("./useAccount");
const tokenRef_1 = require("./tokenRef");
const useAccountFetchCache_1 = require("./useAccountFetchCache");
const borsh_1 = require("borsh");
const react_async_hook_1 = require("react-async-hook");
function reverseNameLookup(connection, owner, verifier, tld) {
    return __awaiter(this, void 0, void 0, function* () {
        const hashedName = yield (0, spl_name_service_1.getHashedName)(owner.toString());
        const key = yield (0, spl_name_service_1.getNameAccountKey)(hashedName, verifier, tld);
        const reverseAccount = yield connection.getAccountInfo(key);
        if (!reverseAccount) {
            throw new Error("Invalid reverse account provided");
        }
        return (0, borsh_1.deserialize)(spl_name_service_1.ReverseTwitterRegistryState.schema, spl_name_service_1.ReverseTwitterRegistryState, reverseAccount.data.slice(spl_name_service_1.NameRegistryState.HEADER_LEN));
    });
}
exports.reverseNameLookup = reverseNameLookup;
function getNameString(connection, owner, verifier, tld) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!owner) {
            return;
        }
        return (yield reverseNameLookup(connection, owner, verifier, tld))
            .twitterHandle;
    });
}
function getHashedNameNullable(owner) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!owner) {
            return undefined;
        }
        return (0, spl_name_service_1.getHashedName)(owner.toString());
    });
}
function getNameAccountKeyNullable(hashedName, verifier, tld) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!hashedName) {
            return undefined;
        }
        return (0, spl_name_service_1.getNameAccountKey)(hashedName, verifier, tld);
    });
}
function useReverseName(owner, verifier, tld) {
    const { connection } = (0, wallet_adapter_react_xnft_1.useConnection)();
    const { result: hashedName, error: nameError, loading: loading1, } = (0, react_async_hook_1.useAsync)(getHashedNameNullable, [owner]);
    const { result: key, error: keyError, loading: loading2, } = (0, react_async_hook_1.useAsync)(getNameAccountKeyNullable, [hashedName, verifier, tld]);
    const { info: reverseAccount } = (0, useAccount_1.useAccount)(key, (key, acct) => {
        return (0, borsh_1.deserialize)(spl_name_service_1.ReverseTwitterRegistryState.schema, spl_name_service_1.ReverseTwitterRegistryState, acct.data.slice(spl_name_service_1.NameRegistryState.HEADER_LEN));
    });
    return {
        loading: loading1 || loading2,
        error: nameError || keyError,
        // @ts-ignore
        nameString: reverseAccount === null || reverseAccount === void 0 ? void 0 : reverseAccount.twitterHandle,
    };
}
exports.useReverseName = useReverseName;
function useNameOwner(nameString, tld) {
    const cache = (0, useAccountFetchCache_1.useAccountFetchCache)();
    const { loading, error, result: owner, } = (0, react_async_hook_1.useAsync)(tokenRef_1.getOwnerForName, [cache || undefined, nameString, tld]);
    return {
        loading,
        error,
        owner,
    };
}
exports.useNameOwner = useNameOwner;
//# sourceMappingURL=nameService.js.map