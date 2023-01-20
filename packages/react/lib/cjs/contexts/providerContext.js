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
exports.ProviderContextProvider = exports.ProviderContext = void 0;
const anchor_1 = require("@project-serum/anchor");
const wallet_adapter_react_xnft_1 = require("wallet-adapter-react-xnft");
const web3_js_1 = require("@solana/web3.js");
const react_1 = __importDefault(require("react"));
exports.ProviderContext = react_1.default.createContext({
    awaitingApproval: false,
});
const ProviderContextProvider = ({ children }) => {
    const { connection } = (0, wallet_adapter_react_xnft_1.useConnection)();
    const { wallet } = (0, wallet_adapter_react_xnft_1.useWallet)();
    const [awaitingApproval, setAwaitingApproval] = react_1.default.useState(false);
    const provider = react_1.default.useMemo(() => {
        if (connection) {
            // Let adapter be null, it'll fail if anyone issues transaction commands but will let fetch go through
            // @ts-ignore
            const provider = new anchor_1.AnchorProvider(connection, wallet === null || wallet === void 0 ? void 0 : wallet.adapter, {});
            // The default impl of send does not use the transaction resuling from wallet.signTransaciton. So we need to fix it.
            provider.sendAndConfirm = function FixedSend(tx, signers, opts) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (signers === undefined) {
                        signers = [];
                    }
                    if (opts === undefined) {
                        opts = this.opts;
                    }
                    tx.feePayer = this.wallet.publicKey;
                    tx.recentBlockhash = (yield this.connection.getRecentBlockhash(opts === null || opts === void 0 ? void 0 : opts.preflightCommitment)).blockhash;
                    setAwaitingApproval(true);
                    try {
                        const signed = yield this.wallet.signTransaction(tx);
                        setAwaitingApproval(false);
                        signers
                            .filter((s) => s !== undefined)
                            .forEach((kp) => {
                            signed.partialSign(kp);
                        });
                        const rawTx = signed.serialize();
                        const txId = yield (0, web3_js_1.sendAndConfirmRawTransaction)(connection, rawTx, opts);
                        return txId;
                    }
                    finally {
                        setAwaitingApproval(false);
                    }
                });
            };
            return provider;
        }
    }, [connection, wallet]);
    return (react_1.default.createElement(exports.ProviderContext.Provider, { value: { awaitingApproval, provider } }, children));
};
exports.ProviderContextProvider = ProviderContextProvider;
//# sourceMappingURL=providerContext.js.map