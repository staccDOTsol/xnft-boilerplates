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
exports.AnchorSdk = void 0;
const transaction_1 = require("./transaction");
class AnchorSdk {
    constructor(args) {
        var _a;
        this.program = args.program;
        this.provider = args.provider;
        this.programId = args.program.programId;
        this.rpc = args.program.rpc;
        this.instruction = args.program.instruction;
        this.wallet = args.provider.wallet;
        this.account = args.program.account;
        this.errors = (_a = args.program.idl.errors) === null || _a === void 0 ? void 0 : _a.reduce((acc, err) => {
            acc.set(err.code, `${err.name}: ${err.msg}`);
            return acc;
        }, new Map());
    }
    getAccount(key, decoder) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield this.provider.connection.getAccountInfo(key);
            if (account) {
                return decoder(key, account);
            }
            return null;
        });
    }
    sendInstructions(instructions, signers, payer, commitment) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield (0, transaction_1.sendInstructions)(this.errors || new Map(), this.provider, instructions, signers, payer, commitment);
            }
            catch (e) {
                // If all compute was consumed, this can often mean that the bonding price moved too much, causing
                // our root estimates to be off.
                if (e.logs &&
                    e.logs.some((l) => l.endsWith("consumed 200000 of 200000 compute units"))) {
                    throw new Error("Consumed all of the compute units. It's possible the price has moved too much, please try again.");
                }
                throw e;
            }
        });
    }
    execute(command, payer = this.wallet.publicKey, commitment) {
        return __awaiter(this, void 0, void 0, function* () {
            const { instructions, signers, output } = yield command;
            if (instructions.length > 0) {
                const txid = yield this.sendInstructions(instructions, signers, payer, commitment);
                return Object.assign({ txid }, output);
            }
            return output;
        });
    }
    executeBig(command, payer = this.wallet.publicKey, finality) {
        return __awaiter(this, void 0, void 0, function* () {
            const { instructions, signers, output } = yield command;
            if (instructions.length > 0) {
                const txids = yield (0, transaction_1.sendMultipleInstructions)(this.errors || new Map(), this.provider, instructions, signers, payer || this.wallet.publicKey, finality);
                return Object.assign(Object.assign({}, output), { txids: Array.from(txids) });
            }
            return output;
        });
    }
}
exports.AnchorSdk = AnchorSdk;
//# sourceMappingURL=anchorSdk.js.map