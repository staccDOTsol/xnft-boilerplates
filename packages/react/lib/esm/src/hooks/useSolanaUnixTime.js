import { SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useAccount } from "./useAccount";
export function useSolanaUnixTime() {
    const { info: currentTime } = useAccount(SYSVAR_CLOCK_PUBKEY, (_, data) => {
        //@ts-ignore
        const unixTime = data.data.readBigInt64LE(8 * 4);
        return unixTime;
    });
    const [currentTimeSecondly, setCurrentTime] = useState();
    useEffect(() => {
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
//# sourceMappingURL=useSolanaUnixTime.js.map