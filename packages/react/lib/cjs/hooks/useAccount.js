"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAccount = void 0;
const react_1 = require("react");
const useAccountFetchCache_1 = require("../hooks/useAccountFetchCache");
/**
 * Generic hook to get a cached, auto updating, deserialized form of any Solana account. Massively saves on RPC usage by using
 * the spl-utils accountFetchCache.
 *
 * @param key
 * @param parser
 * @param isStatic
 * @returns
 */
function useAccount(key, parser, isStatic = false // Set if the accounts data will never change, optimisation to lower websocket usage.
) {
    const cache = (0, useAccountFetchCache_1.useAccountFetchCache)();
    const [state, setState] = (0, react_1.useState)({
        loading: true,
    });
    const parsedAccountBaseParser = (pubkey, data) => {
        try {
            const info = parser(pubkey, data);
            return {
                pubkey,
                account: data,
                info,
            };
        }
        catch (e) {
            console.error("Error while parsing", e);
            return {
                pubkey,
                account: data,
                info: undefined,
            };
        }
    };
    const id = typeof key === "string" ? key : key === null || key === void 0 ? void 0 : key.toBase58();
    (0, react_1.useEffect)(() => {
        // Occassionally, dispose can get called while the cache promise is still going.
        // In that case, we want to dispose immediately.
        let shouldDisposeImmediately = false;
        let disposeWatch = () => {
            shouldDisposeImmediately = true;
        };
        if (!id || !cache) {
            setState({ loading: false });
            return;
        }
        else {
            setState({ loading: true });
        }
        let prevInfo = state.info;
        cache
            .searchAndWatch(id, parser ? parsedAccountBaseParser : undefined, isStatic)
            .then(([acc, dispose]) => {
            if (shouldDisposeImmediately) {
                dispose();
                shouldDisposeImmediately = false;
            }
            disposeWatch = dispose;
            if (acc) {
                try {
                    const nextInfo = mergePublicKeys(prevInfo, (parser && parser(acc.pubkey, acc.account)));
                    prevInfo = nextInfo;
                    setState({
                        loading: false,
                        info: nextInfo,
                        account: acc.account,
                    });
                }
                catch (e) {
                    console.error("Error while parsing", e);
                    setState({
                        loading: false,
                        info: undefined,
                        account: acc.account,
                    });
                }
            }
            else {
                setState({ loading: false });
            }
        })
            .catch((e) => {
            console.error(e);
            setState({ loading: false });
        });
        const disposeEmitter = cache.emitter.onCache((e) => {
            const event = e;
            if (event.id === id) {
                cache
                    .search(id, parser ? parsedAccountBaseParser : undefined)
                    .then((acc) => {
                    if (acc && acc.account != state.account) {
                        try {
                            setState({
                                loading: false,
                                info: mergePublicKeys(state.info, parser && parser(acc.pubkey, acc.account)),
                                account: acc.account,
                            });
                        }
                        catch (e) {
                            console.error("Error while parsing", e);
                            setState({
                                loading: false,
                                info: undefined,
                                account: acc.account,
                            });
                        }
                    }
                });
            }
        });
        return () => {
            disposeEmitter();
            setTimeout(disposeWatch, 30 * 1000); // Keep cached accounts around for 30s in case a rerender is causing reuse
        };
    }, [cache, id, !parser]); // only trigger on change to parser if it wasn't defined before.
    return state;
}
exports.useAccount = useAccount;
function isPureObject(input) {
    return (null !== input &&
        typeof input === "object" &&
        Object.getPrototypeOf(input).isPrototypeOf(Object));
}
/**
 * Updates to a solana account will contain new PublicKeys that are
 * actually the same, just a new JS object. This will cause a lot of useMemo
 * to fail.
 */
function mergePublicKeys(arg0, arg1) {
    if (!isPureObject(arg1) || !arg1 || !arg0) {
        return arg1;
    }
    return Object.entries(arg1).reduce((acc, [key, value]) => {
        if (arg1[key] &&
            arg1[key].equals &&
            arg0[key] &&
            arg1[key].equals(arg0[key])) {
            acc[key] = arg0[key];
        }
        else {
            acc[key] = value;
        }
        return acc;
    }, {});
}
//# sourceMappingURL=useAccount.js.map