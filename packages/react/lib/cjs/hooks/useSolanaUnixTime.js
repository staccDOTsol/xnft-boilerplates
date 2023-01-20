"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSolanaUnixTime = void 0;
const web3_js_1 = require("@solana/web3.js");
const react_1 = require("react");
const useAccount_1 = require("./useAccount");
function useSolanaUnixTime() {
    const { info: currentTime } = (0, useAccount_1.useAccount)(web3_js_1.SYSVAR_CLOCK_PUBKEY, (_, data) => {
        //@ts-ignore
        const unixTime = data.data.readBigInt64LE(8 * 4);
        return unixTime;
    });
    const [currentTimeSecondly, setCurrentTime] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        setCurrentTime(Number(currentTime));
        const interval = setInterval(() => {
            setCurrentTime((previousTime) => previousTime ? previousTime + 1 : undefined);
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, [currentTime]);
    return Number(currentTimeSecondly);
}
exports.useSolanaUnixTime = useSolanaUnixTime;
//# sourceMappingURL=useSolanaUnixTime.js.map