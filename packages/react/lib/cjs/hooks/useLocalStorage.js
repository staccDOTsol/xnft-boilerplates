"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLocalStorage = void 0;
const react_1 = require("react");
const useInterval_1 = require("./useInterval");
function useLocalStorage(key, defaultState) {
    const isBrowser = (() => typeof window !== "undefined")();
    const [valueRaw, setValueRaw] = (0, react_1.useState)(() => {
        if (isBrowser) {
            return localStorage.getItem(key);
        }
        return typeof defaultState == "string" ? defaultState : JSON.stringify(defaultState);
    });
    const [value, setValue] = (0, react_1.useState)(() => {
        if (isBrowser) {
            if (valueRaw) {
                // gross, but handling the case where T is a string
                let ret = valueRaw;
                try {
                    ret = JSON.parse(valueRaw);
                }
                catch (_a) {
                    // ignore
                }
                // @ts-ignore
                return ret;
            }
        }
        return defaultState;
    });
    const setLocalStorage = (0, react_1.useCallback)((newValue) => {
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
    (0, useInterval_1.useInterval)(() => {
        if (isBrowser && localStorage.getItem(key) != valueRaw) {
            const value = typeof localStorage !== "undefined" && localStorage.getItem(key);
            if (value) {
                // gross, but handling the case where T is a string
                let ret = value;
                try {
                    ret = JSON.parse(value);
                }
                catch (_a) {
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
exports.useLocalStorage = useLocalStorage;
//# sourceMappingURL=useLocalStorage.js.map