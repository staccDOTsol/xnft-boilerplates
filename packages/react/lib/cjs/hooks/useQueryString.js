"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useQueryString = exports.getQueryStringValue = void 0;
const query_string_1 = __importDefault(require("query-string"));
const react_1 = require("react");
const useInterval_1 = require("./useInterval");
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
    const values = query_string_1.default.parse(queryString);
    const newQsValue = query_string_1.default.stringify(Object.assign(Object.assign({}, values), { [key]: value }));
    setQueryStringWithoutPageReload(`?${newQsValue}`);
};
const getQueryStringValue = (key, queryString = typeof window !== "undefined" && window.location.search) => {
    if (queryString) {
        const values = query_string_1.default.parse(queryString);
        return values[key];
    }
};
exports.getQueryStringValue = getQueryStringValue;
function useQueryString(key, initialValue) {
    const [value, setValue] = (0, react_1.useState)((0, exports.getQueryStringValue)(key) || initialValue);
    (0, useInterval_1.useInterval)(() => {
        const newValue = (0, exports.getQueryStringValue)(key);
        if (newValue && newValue != value) {
            setValue(newValue);
        }
    }, 500);
    const onSetValue = (0, react_1.useCallback)((newValue) => {
        setValue(newValue);
        setQueryStringValue(key, newValue);
    }, [key]);
    return [value, onSetValue];
}
exports.useQueryString = useQueryString;
//# sourceMappingURL=useQueryString.js.map