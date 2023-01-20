import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
export interface IClusterState {
    cluster: WalletAdapterNetwork | "localnet";
    endpoint: string;
    setClusterOrEndpoint: (clusterOrEndpoint: string) => void;
}
export declare function getClusterAndEndpoint(clusterOrEndpoint: string): {
    cluster: string;
    endpoint: string;
};
export declare function useEndpoint(): IClusterState;
//# sourceMappingURL=useEndpoint.d.ts.map