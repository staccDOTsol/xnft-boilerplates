"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.useBondingPricingFromMint = exports.useBondingPricing = exports.useOwnedAmount = exports.useUserOwnedAmount = exports.useSolOwnedAmount = exports.amountAsNum = exports.supplyAsNum = void 0;
const spl_token_1 = require("@solana/spl-token");
const wallet_adapter_react_xnft_1 = require("wallet-adapter-react-xnft");
const spl_token_bonding_1 = require("@strata-foundation/spl-token-bonding");
const react_1 = __importStar(require("react"));
const react_async_hook_1 = require("react-async-hook");
const useStrataSdks_1 = require("./useStrataSdks");
const useAccount_1 = require("./useAccount");
const useAssociatedAccount_1 = require("./useAssociatedAccount");
const useMint_1 = require("./useMint");
const useTwWrappedSolMint_1 = require("./useTwWrappedSolMint");
const useTokenBonding_1 = require("./useTokenBonding");
const useTokenAccount_1 = require("./useTokenAccount");
function supplyAsNum(mint) {
    return amountAsNum(mint.supply, mint);
}
exports.supplyAsNum = supplyAsNum;
function amountAsNum(amount, mint) {
    const decimals = new spl_token_1.u64(Math.pow(10, mint.decimals).toString());
    const decimal = amount.mod(decimals).toNumber() / decimals.toNumber();
    return amount.div(decimals).toNumber() + decimal;
}
exports.amountAsNum = amountAsNum;
function useSolOwnedAmount(ownerPublicKey) {
    const { info: lamports, loading } = (0, useAccount_1.useAccount)(ownerPublicKey, (_, account) => account.lamports);
    const result = react_1.default.useMemo(() => (lamports || 0) / Math.pow(10, 9), [lamports]);
    return {
        amount: result,
        loading,
    };
}
exports.useSolOwnedAmount = useSolOwnedAmount;
function useUserOwnedAmount(wallet, token) {
    const { amount: solOwnedAmount } = useSolOwnedAmount(wallet || undefined);
    const { associatedAccount, loading: loadingAssoc } = (0, useAssociatedAccount_1.useAssociatedAccount)(wallet, token);
    const wrappedSolMint = (0, useTwWrappedSolMint_1.useTwWrappedSolMint)();
    const mint = (0, useMint_1.useMint)(token);
    const [amount, setAmount] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        if ((token === null || token === void 0 ? void 0 : token.equals(spl_token_1.NATIVE_MINT)) ||
            (wrappedSolMint && (token === null || token === void 0 ? void 0 : token.equals(wrappedSolMint)))) {
            setAmount(solOwnedAmount);
        }
        else if (mint && associatedAccount) {
            setAmount(amountAsNum(associatedAccount.amount, mint));
        }
        else if (mint && !associatedAccount && !loadingAssoc) {
            setAmount(0);
        }
    }, [loadingAssoc, associatedAccount, mint, solOwnedAmount, wrappedSolMint]);
    return typeof amount === "undefined" ? amount : Number(amount);
}
exports.useUserOwnedAmount = useUserOwnedAmount;
function useOwnedAmount(token) {
    const { publicKey } = (0, wallet_adapter_react_xnft_1.useWallet)();
    return useUserOwnedAmount(publicKey || undefined, token);
}
exports.useOwnedAmount = useOwnedAmount;
/**
 * Get an {@link IPricingCurve} Object that can estimate pricing on this bonding curve,
 * in real time.
 *
 * @param tokenBonding
 * @returns
 */
function useBondingPricing(tokenBonding) {
    const { tokenBondingSdk } = (0, useStrataSdks_1.useStrataSdks)();
    const { info: tokenBondingAcct } = (0, useTokenBonding_1.useTokenBonding)(tokenBonding);
    const { info: reserves } = (0, useTokenAccount_1.useTokenAccount)(tokenBondingAcct === null || tokenBondingAcct === void 0 ? void 0 : tokenBondingAcct.baseStorage);
    const targetMint = (0, useMint_1.useMint)(tokenBondingAcct === null || tokenBondingAcct === void 0 ? void 0 : tokenBondingAcct.targetMint);
    const getPricing = (tokenBondingSdk, key, tokenBondingAcct, // Make the pricing be re-fetched whenever the bonding changes.
    reserves, // Make the pricing be re-fetched whenever the reserves change.
    mint // Make the pricing be re-fetched whenever the supply change. This doesn't account for
    // collective changes, but will due for now. TODO: Account for collective changes too
    ) => __awaiter(this, void 0, void 0, function* () {
        return tokenBondingSdk && key && tokenBondingSdk.getPricing(key);
    });
    const { result: pricing, loading, error, } = (0, react_async_hook_1.useAsync)(getPricing, [
        tokenBondingSdk,
        tokenBonding,
        tokenBondingAcct,
        reserves,
        targetMint,
    ]);
    return {
        pricing: pricing || undefined,
        tokenBonding: tokenBondingAcct,
        loading,
        error,
    };
}
exports.useBondingPricing = useBondingPricing;
const tokenBondingKey = (mint, index) => __awaiter(void 0, void 0, void 0, function* () { return mint && (yield spl_token_bonding_1.SplTokenBonding.tokenBondingKey(mint, index))[0]; });
/**
 * Same as {@link useBondingPricing}, just from a mint instead of the token bonding key
 *
 * @param mint
 * @param index
 * @returns
 */
function useBondingPricingFromMint(mint, index) {
    const { result: key, loading } = (0, react_async_hook_1.useAsync)(tokenBondingKey, [
        mint,
        index || 0,
    ]);
    const bondingPricing = useBondingPricing(key);
    return Object.assign(Object.assign({}, bondingPricing), { loading: bondingPricing.loading || loading });
}
exports.useBondingPricingFromMint = useBondingPricingFromMint;
//# sourceMappingURL=bondingPricing.js.map