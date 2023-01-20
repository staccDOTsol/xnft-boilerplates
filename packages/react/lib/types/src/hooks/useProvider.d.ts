import { AnchorProvider } from "@project-serum/anchor";
/**
 * Get an anchor provider with signTransaction wrapped so that it hits the wallet adapter from wallet-adapter-react.
 *
 * @returns
 */
export declare function useProvider(): {
    provider?: AnchorProvider;
    awaitingApproval: boolean;
};
//# sourceMappingURL=useProvider.d.ts.map