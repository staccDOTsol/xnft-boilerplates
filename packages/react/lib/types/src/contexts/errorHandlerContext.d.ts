import React, { FC, ReactNode } from "react";
export interface IErrorHandlerProviderProps {
    children: ReactNode;
    onError?: (error: Error) => void;
}
export interface IErrorHandlerContextState {
    handleErrors: (...errors: (Error | undefined)[]) => void;
}
export declare const ErrorHandlerContext: React.Context<IErrorHandlerContextState>;
export declare const ErrorHandlerProvider: FC<IErrorHandlerProviderProps>;
//# sourceMappingURL=errorHandlerContext.d.ts.map