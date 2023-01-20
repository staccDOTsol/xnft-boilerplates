import { Avatar, Button, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { useOwnedAmount } from "../../hooks/bondingPricing";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { usePriceInUsd } from "../../hooks/usePriceInUsd";
import { useStrataSdks } from "../../hooks/useStrataSdks";
import { useTwWrappedSolMint } from "../../hooks/useTwWrappedSolMint";
import React from "react";
import { useAsyncCallback } from "react-async-hook";
import { RiCoinLine } from "react-icons/ri";
async function unwrapTwSol(tokenBondingSdk, account) {
    if (tokenBondingSdk) {
        await tokenBondingSdk.sellBondingWrappedSol({
            amount: 0,
            all: true,
            source: account,
        });
    }
}
export const TokenInfo = React.memo(({ tokenWithMeta, onClick, highlighted, }) => {
    const { metadata, image, account } = tokenWithMeta;
    const fiatPrice = usePriceInUsd(account?.mint);
    const ownedAmount = useOwnedAmount(account?.mint);
    const twSol = useTwWrappedSolMint();
    const { tokenBondingSdk } = useStrataSdks();
    const { execute: unwrap, loading, error } = useAsyncCallback(unwrapTwSol);
    const { handleErrors } = useErrorHandler();
    handleErrors(error);
    return (React.createElement(HStack, { onClick: (e) => {
            e.stopPropagation();
            e.preventDefault();
            onClick(tokenWithMeta);
        }, alignItems: "center", justify: "space-between", justifyItems: "center", _hover: { opacity: "0.5", cursor: "pointer" }, borderColor: highlighted ? "indigo.500" : undefined, borderWidth: highlighted ? "1px" : undefined, borderRadius: highlighted ? "4px" : undefined },
        React.createElement(HStack, { padding: 4, spacing: 3, align: "center" },
            React.createElement(Avatar, { name: metadata?.data.symbol, src: image }),
            React.createElement(Flex, { flexDir: "column" },
                React.createElement(Text, null, metadata?.data.name),
                React.createElement(HStack, { align: "center", spacing: 1 },
                    React.createElement(Icon, { as: RiCoinLine, w: "16px", h: "16px" }),
                    React.createElement(Text, null,
                        ownedAmount?.toFixed(2),
                        " ",
                        metadata?.data.symbol),
                    React.createElement(Text, { color: "gray.500" },
                        "(~$",
                        fiatPrice &&
                            ownedAmount &&
                            (fiatPrice * ownedAmount).toFixed(2),
                        ")")))),
        twSol && account && twSol.equals(account.mint) && (React.createElement(Button, { isLoading: loading, onClick: () => unwrap(tokenBondingSdk, account?.address), colorScheme: "indigo", size: "xs" }, "Unwrap"))));
});
//# sourceMappingURL=TokenInfo.js.map