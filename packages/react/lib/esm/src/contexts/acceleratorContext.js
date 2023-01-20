import { Accelerator } from "@strata-foundation/accelerator";
import React, { useContext, useMemo } from "react";
import { useAsync } from "react-async-hook";
export const AcceleratorContext = React.createContext({
    loading: true,
});
async function tryProm(prom) {
    try {
        return await prom;
    }
    catch (e) {
        console.error(e);
    }
    return undefined;
}
async function getSdk(url) {
    return tryProm(Accelerator.init(url));
}
export const AcceleratorProviderRaw = ({ children, url, }) => {
    const { result, loading, error } = useAsync(getSdk, [url]);
    const sdks = useMemo(() => ({
        accelerator: result,
        error,
        loading,
    }), [result, loading, error]);
    return (React.createElement(AcceleratorContext.Provider, { value: sdks }, children));
};
export const AcceleratorProvider = ({ children, url, }) => {
    return React.createElement(AcceleratorProviderRaw, { url: url }, children);
};
export const useAccelerator = () => {
    return useContext(AcceleratorContext);
};
//# sourceMappingURL=acceleratorContext.js.map