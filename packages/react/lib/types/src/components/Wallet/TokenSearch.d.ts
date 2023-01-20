import { StackProps } from "@chakra-ui/react";
import { ITokenWithMetaAndAccount } from "@strata-foundation/spl-token-collective";
import React from "react";
export declare const TokenSearch: React.MemoExoticComponent<({ onSelect, placeholder, resultsStackProps, onBlur, includeSol }: {
    onBlur?: () => void;
    placeholder?: string;
    resultsStackProps?: StackProps;
    onSelect: (tokenWithMeta: ITokenWithMetaAndAccount) => void;
    includeSol?: boolean;
}) => JSX.Element>;
//# sourceMappingURL=TokenSearch.d.ts.map