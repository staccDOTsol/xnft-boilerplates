"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useInterval = void 0;
const react_1 = require("react");
function useInterval(callback, delay, deps = []) {
    const savedCallbackRef = (0, react_1.useRef)();
    (0, react_1.useEffect)(() => {
        savedCallbackRef.current = callback;
    }, [callback]);
    (0, react_1.useEffect)(() => {
        const handler = (...args) => savedCallbackRef.current(...args);
        if (delay !== null) {
            handler();
            const intervalId = setInterval(handler, delay);
            return () => clearInterval(intervalId);
        }
    }, [delay, ...deps]);
}
exports.useInterval = useInterval;
//# sourceMappingURL=useInterval.js.map