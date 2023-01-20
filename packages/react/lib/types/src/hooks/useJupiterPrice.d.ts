import { PublicKey } from "@solana/web3.js";
export declare function getJupiterPriceCached(inputMint: PublicKey | undefined, priceMint: PublicKey | undefined, inputDecimals: number | undefined, priceDecimals: number | undefined): Promise<number | undefined>;
export declare const useJupiterPrice: (inputMint: PublicKey | undefined, priceMint: PublicKey | undefined) => number | undefined;
//# sourceMappingURL=useJupiterPrice.d.ts.map