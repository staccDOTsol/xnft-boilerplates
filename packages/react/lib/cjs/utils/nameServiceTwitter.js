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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReverseTwitterRegistry = exports.createVerifiedTwitterRegistry = exports.getTwitterRegistry = exports.getTwitterRegistryKey = void 0;
const spl_name_service_1 = require("@solana/spl-name-service");
const web3_js_1 = require("@solana/web3.js");
const borsh_1 = require("borsh");
const bn_js_1 = __importDefault(require("bn.js"));
function getTwitterRegistryKey(handle, twitterRootParentRegistryKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const hashedTwitterHandle = yield (0, spl_name_service_1.getHashedName)(handle);
        const twitterHandleRegistryKey = yield (0, spl_name_service_1.getNameAccountKey)(hashedTwitterHandle, undefined, twitterRootParentRegistryKey);
        return twitterHandleRegistryKey;
    });
}
exports.getTwitterRegistryKey = getTwitterRegistryKey;
function getTwitterRegistry(connection, twitter_handle, twitterRootParentRegistryKey = spl_name_service_1.TWITTER_ROOT_PARENT_REGISTRY_KEY) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = yield getTwitterRegistryKey(twitter_handle, twitterRootParentRegistryKey);
        const registry = spl_name_service_1.NameRegistryState.retrieve(connection, key);
        return registry;
    });
}
exports.getTwitterRegistry = getTwitterRegistry;
function createVerifiedTwitterRegistry(connection, twitterHandle, verifiedPubkey, space, // The space that the user will have to write data into the verified registry
payerKey, nameProgramId = spl_name_service_1.NAME_PROGRAM_ID, twitterVerificationAuthority = spl_name_service_1.TWITTER_VERIFICATION_AUTHORITY, twitterRootParentRegistryKey = spl_name_service_1.TWITTER_ROOT_PARENT_REGISTRY_KEY) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create user facing registry
        const hashedTwitterHandle = yield (0, spl_name_service_1.getHashedName)(twitterHandle);
        const twitterHandleRegistryKey = yield (0, spl_name_service_1.getNameAccountKey)(hashedTwitterHandle, undefined, twitterRootParentRegistryKey);
        let instructions = [
            (0, spl_name_service_1.createInstruction)(nameProgramId, web3_js_1.SystemProgram.programId, twitterHandleRegistryKey, verifiedPubkey, payerKey, hashedTwitterHandle, new spl_name_service_1.Numberu64(yield connection.getMinimumBalanceForRentExemption(space)), new bn_js_1.default(space), undefined, twitterRootParentRegistryKey, twitterVerificationAuthority // Twitter authority acts as owner of the parent for all user-facing registries
            ),
        ];
        instructions = instructions.concat(yield createReverseTwitterRegistry(connection, twitterHandle, twitterHandleRegistryKey, verifiedPubkey, payerKey, nameProgramId, twitterVerificationAuthority, twitterRootParentRegistryKey));
        return instructions;
    });
}
exports.createVerifiedTwitterRegistry = createVerifiedTwitterRegistry;
function createReverseTwitterRegistry(connection, twitterHandle, twitterRegistryKey, verifiedPubkey, payerKey, nameProgramId = spl_name_service_1.NAME_PROGRAM_ID, twitterVerificationAuthority = spl_name_service_1.TWITTER_VERIFICATION_AUTHORITY, twitterRootParentRegistryKey = spl_name_service_1.TWITTER_ROOT_PARENT_REGISTRY_KEY) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create the reverse lookup registry
        const hashedVerifiedPubkey = yield (0, spl_name_service_1.getHashedName)(verifiedPubkey.toString());
        const reverseRegistryKey = yield (0, spl_name_service_1.getNameAccountKey)(hashedVerifiedPubkey, twitterVerificationAuthority, twitterRootParentRegistryKey);
        let reverseTwitterRegistryStateBuff = (0, borsh_1.serialize)(spl_name_service_1.ReverseTwitterRegistryState.schema, new spl_name_service_1.ReverseTwitterRegistryState({
            twitterRegistryKey: twitterRegistryKey.toBuffer(),
            twitterHandle,
        }));
        return [
            (0, spl_name_service_1.createInstruction)(nameProgramId, web3_js_1.SystemProgram.programId, reverseRegistryKey, verifiedPubkey, payerKey, hashedVerifiedPubkey, new spl_name_service_1.Numberu64(yield connection.getMinimumBalanceForRentExemption(reverseTwitterRegistryStateBuff.length)), new bn_js_1.default(reverseTwitterRegistryStateBuff.length), twitterVerificationAuthority, // Twitter authority acts as class for all reverse-lookup registries
            twitterRootParentRegistryKey, // Reverse registries are also children of the root
            twitterVerificationAuthority),
            (0, spl_name_service_1.updateInstruction)(nameProgramId, reverseRegistryKey, new spl_name_service_1.Numberu32(0), Buffer.from(reverseTwitterRegistryStateBuff), twitterVerificationAuthority, undefined),
        ];
    });
}
exports.createReverseTwitterRegistry = createReverseTwitterRegistry;
//# sourceMappingURL=nameServiceTwitter.js.map