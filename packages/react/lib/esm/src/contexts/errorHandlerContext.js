import { truthy } from "@strata-foundation/spl-utils";
import React, { createContext, useCallback } from "react";
export const ErrorHandlerContext = createContext({});
export const ErrorHandlerProvider = ({ children, onError = (error) => console.log(error), }) => {
    const sentErrors = new Set();
    const handleErrors = useCallback(async (...errors) => {
        const actualErrors = Array.from(new Set(errors.filter(truthy))).filter((e) => !sentErrors.has(e));
        actualErrors.forEach(sentErrors.add.bind(sentErrors));
        actualErrors.map(onError);
    }, [onError]);
    return (React.createElement(ErrorHandlerContext.Provider, { value: {
            handleErrors,
        } }, children));
};
//# sourceMappingURL=errorHandlerContext.js.map