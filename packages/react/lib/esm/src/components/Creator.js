import { Avatar, Box, HStack, Link, Text } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import { useSocialTokenMetadata } from "../hooks/useSocialTokenMetadata";
import { useErrorHandler } from "../hooks/useErrorHandler";
import React from "react";
import { useReverseName } from "../hooks/nameService";
import { useGovernance } from "../hooks/useGovernance";
export const WUMBO_TWITTER_VERIFIER = new PublicKey("DTok7pfUzNeNPqU3Q6foySCezPQE82eRyhX1HdhVNLVC");
export const WUMBO_TWITTER_TLD = new PublicKey("Fhqd3ostRQQE65hzoA7xFMgT9kge2qPnsTNAKuL2yrnx");
// export const WUMBO_TWITTER_VERIFIER = new PublicKey(
//   "GibysS6yTqHWw4AZap416Xs26rAo9nV9HTRviKuutytp"
// );
// export const WUMBO_TWITTER_TLD = new PublicKey(
//   "EEbZHaBD4mreYS6enRqytXvXfmRESLWXXrXbtZLWyd6X"
// );
export const truncatePubkey = (pkey) => {
    const pkeyStr = pkey.toString();
    return `${pkeyStr.substr(0, 4)}...${pkeyStr.substr(pkeyStr.length - 4)}`;
};
export const Creator = React.memo(({ creator, onClick }) => {
    const { handleErrors } = useErrorHandler();
    const { metadata, tokenRef, error, image } = useSocialTokenMetadata(creator);
    const { nameString: handle, error: reverseTwitterError2 } = useReverseName(creator, WUMBO_TWITTER_VERIFIER, WUMBO_TWITTER_TLD);
    handleErrors(error, reverseTwitterError2);
    const { info: governance } = useGovernance(creator);
    const children = (React.createElement(React.Fragment, null,
        metadata && (React.createElement(HStack, { spacing: 1 },
            React.createElement(Avatar, { size: "xs", src: image }),
            React.createElement(Text, null, metadata.data.name))),
        !metadata && !handle && truncatePubkey(creator),
        !metadata && handle && `@${handle}`));
    if (governance) {
        React.createElement(Link, { isExternal: true, href: `https://realms.today/dao/${governance.realm.toBase58()}` }, children);
    }
    return (React.createElement(Box, { _hover: { cursor: 'pointer', textDecoration: 'underline' }, onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick(creator, metadata, tokenRef, handle);
        } }, children));
});
//# sourceMappingURL=Creator.js.map