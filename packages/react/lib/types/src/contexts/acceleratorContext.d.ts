import { Accelerator } from "@strata-foundation/accelerator";
import React from "react";
export declare const AcceleratorContext: React.Context<IAcceleratorReactState>;
export interface IAcceleratorReactState {
    error?: Error;
    loading: boolean;
    accelerator?: Accelerator;
}
export declare const AcceleratorProviderRaw: React.FC<React.PropsWithChildren<{
    url: string;
}>>;
export declare const AcceleratorProvider: React.FC<React.PropsWithChildren<{
    url: string;
}>>;
export declare const useAccelerator: () => IAcceleratorReactState;
//# sourceMappingURL=acceleratorContext.d.ts.map