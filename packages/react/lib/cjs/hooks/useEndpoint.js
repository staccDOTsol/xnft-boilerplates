"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEndpoint = exports.getClusterAndEndpoint = void 0;
const useQueryString_1 = require("./useQueryString");
const wallet_adapter_base_1 = require("@solana/wallet-adapter-base");
const react_1 = require("react");
const shortnames = new Set([
    "localnet",
    ...Object.values(wallet_adapter_base_1.WalletAdapterNetwork).map((v) => v.toString()),
]);
const DEFAULT_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_URL ||
    process.env.REACT_APP_SOLANA_URL ||
    "https://solana-mainnet.g.alchemy.com/v2/Ib9f7u11tv7lONBDceJ5ly84o5KXdeGE";
function getClusterAndEndpoint(clusterOrEndpoint) {
    if (clusterOrEndpoint) {
        if (clusterOrEndpoint.startsWith("http")) {
            if (clusterOrEndpoint.includes("dev") &&
                clusterOrEndpoint !=
                    "https://solana-mainnet.g.alchemy.com/v2/Ib9f7u11tv7lONBDceJ5ly84o5KXdeGE") {
                return { cluster: "devnet", endpoint: clusterOrEndpoint };
            }
            else {
                return { cluster: "mainnet-beta", endpoint: clusterOrEndpoint };
            }
        }
        else if (shortnames.has(clusterOrEndpoint)) {
            if (clusterOrEndpoint === "localnet") {
                return {
                    cluster: "localnet",
                    endpoint: "http://localhost:8899",
                };
            }
            else if (clusterOrEndpoint === "devnet") {
                return {
                    cluster: "devnet",
                    endpoint: "https://api.devnet.solana.com/",
                };
            }
            else if (clusterOrEndpoint === "mainnet-beta") {
                return {
                    cluster: "mainnet-beta",
                    endpoint: "https://solana-mainnet.g.alchemy.com/v2/Ib9f7u11tv7lONBDceJ5ly84o5KXdeGE",
                };
            }
            return {
                cluster: clusterOrEndpoint,
                endpoint: "http://localhost:8899",
            };
        }
    }
    return {
        cluster: "mainnet-beta",
        endpoint: DEFAULT_ENDPOINT,
    };
}
exports.getClusterAndEndpoint = getClusterAndEndpoint;
function useEndpoint() {
    const [clusterOrEndpoint, setCluster] = (0, useQueryString_1.useQueryString)("cluster", DEFAULT_ENDPOINT);
    const { cluster: actualCluster, endpoint } = (0, react_1.useMemo)(() => getClusterAndEndpoint(clusterOrEndpoint), [clusterOrEndpoint]);
    return {
        cluster: actualCluster,
        endpoint,
        setClusterOrEndpoint: setCluster,
    };
}
exports.useEndpoint = useEndpoint;
//# sourceMappingURL=useEndpoint.js.map