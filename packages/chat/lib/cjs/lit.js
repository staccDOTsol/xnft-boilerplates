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
exports.getAuthSig = exports.AUTH_SIGNATURE_BODY = void 0;
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const util_1 = require("util");
const uint8arrays_1 = require("uint8arrays");
const NodeAndWebTextEncoder = typeof TextEncoder === "undefined" ? util_1.TextEncoder : TextEncoder;
exports.AUTH_SIGNATURE_BODY = "I am creating an account to use Lit Protocol at {{timestamp}}";
function getAuthSig(publicKey, signer) {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date().toISOString();
        const body = exports.AUTH_SIGNATURE_BODY.replace("{{timestamp}}", now);
        const data = new NodeAndWebTextEncoder().encode(body);
        let signed;
        if (signer instanceof Uint8Array) {
            // @ts-ignore
            signed = tweetnacl_1.default.sign.detached(data, signer);
        }
        else {
            try {
                // @ts-ignore
                signed = yield signer.signMessage(data, "utf8");
            }
            catch (e) {
                throw new Error(`Error signing lit message. This may be because you are using a Ledger, which does not support signMessage. ${e}`);
            }
        }
        const hexSig = (0, uint8arrays_1.toString)(signed, "base16");
        const authSig = {
            sig: hexSig,
            derivedVia: "solana.signMessage",
            signedMessage: body,
            address: publicKey.toBase58(),
        };
        return authSig;
    });
}
exports.getAuthSig = getAuthSig;
//# sourceMappingURL=lit.js.map