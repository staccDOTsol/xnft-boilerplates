import qs from "query-string";
import { useState, useCallback } from "react";
import { useInterval } from "./useInterval";
const setQueryStringWithoutPageReload = (qsValue) => {
    if (typeof window !== "undefined") {
        const newurl = window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname +
            qsValue;
        window.history.pushState({ path: newurl }, "", newurl);
    }
};
const setQueryStringValue = (key, value, queryString = window.location.search) => {
    const values = qs.parse(queryString);
    const newQsValue = qs.stringify({ ...values, [key]: value });
    setQueryStringWithoutPageReload(`?${newQsValue}`);
};
export const getQueryStringValue = (key, queryString = typeof window !== "undefined" && window.location.search) => {
    if (queryString) {
        const values = qs.parse(queryString);
        return values[key];
    }
};
export function useQueryString(key, initialValue) {
    const [value, setValue] = useState(getQueryStringValue(key) || initialValue);
    useInterval(() => {
        const newValue = getQueryStringValue(key);
        if (newValue && newValue != value) {
            setValue(newValue);
        }
    }, 500);
    const onSetValue = useCallback((newValue) => {
        setValue(newValue);
        setQueryStringValue(key, newValue);
    }, [key]);
    return [value, onSetValue];
}
//# sourceMappingURL=useQueryString.js.map