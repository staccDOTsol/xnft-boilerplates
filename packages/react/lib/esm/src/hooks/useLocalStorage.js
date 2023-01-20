import { useState, useCallback } from "react";
import { useInterval } from "./useInterval";
export function useLocalStorage(key, defaultState) {
    const isBrowser = (() => typeof window !== "undefined")();
    const [valueRaw, setValueRaw] = useState(() => {
        if (isBrowser) {
            return localStorage.getItem(key);
        }
        return typeof defaultState == "string" ? defaultState : JSON.stringify(defaultState);
    });
    const [value, setValue] = useState(() => {
        if (isBrowser) {
            if (valueRaw) {
                // gross, but handling the case where T is a string
                let ret = valueRaw;
                try {
                    ret = JSON.parse(valueRaw);
                }
                catch {
                    // ignore
                }
                // @ts-ignore
                return ret;
            }
        }
        return defaultState;
    });
    const setLocalStorage = useCallback((newValue) => {
        if (newValue === value)
            return;
        setValue(newValue);
        setValueRaw(typeof newValue == "string" ? newValue : JSON.stringify(newValue));
        if (newValue === null) {
            localStorage.removeItem(key);
        }
        else {
            localStorage.setItem(key, JSON.stringify(newValue));
        }
    }, [value, setValue, key]);
    useInterval(() => {
        if (isBrowser && localStorage.getItem(key) != valueRaw) {
            const value = typeof localStorage !== "undefined" && localStorage.getItem(key);
            if (value) {
                // gross, but handling the case where T is a string
                let ret = value;
                try {
                    ret = JSON.parse(value);
                }
                catch {
                    // ignore
                }
                setValueRaw(value);
                // @ts-ignore
                setValue(ret);
            }
        }
    }, 1000);
    return [value, setLocalStorage];
}
//# sourceMappingURL=useLocalStorage.js.map