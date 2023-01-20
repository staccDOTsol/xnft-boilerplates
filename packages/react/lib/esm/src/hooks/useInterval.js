import { useRef, useEffect } from "react";
export function useInterval(callback, delay, deps = []) {
    const savedCallbackRef = useRef();
    useEffect(() => {
        savedCallbackRef.current = callback;
    }, [callback]);
    useEffect(() => {
        const handler = (...args) => savedCallbackRef.current(...args);
        if (delay !== null) {
            handler();
            const intervalId = setInterval(handler, delay);
            return () => clearInterval(intervalId);
        }
    }, [delay, ...deps]);
}
//# sourceMappingURL=useInterval.js.map