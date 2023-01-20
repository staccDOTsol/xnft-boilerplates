import { Text, Flex, HStack, Icon, Tooltip } from "@chakra-ui/react";
import React from "react";
import { RiInformationLine } from "react-icons/ri";
export const TransactionInfo = ({ name, tooltip, amount, formRef, }) => {
    return (React.createElement(Flex, { justify: "space-between", alignItems: "center" },
        React.createElement(HStack, null,
            React.createElement(Text, null, name),
            React.createElement(Tooltip, { placement: "top", label: tooltip, portalProps: { containerRef: formRef } },
                React.createElement(Flex, null,
                    React.createElement(Icon, { w: 5, h: 5, as: RiInformationLine, _hover: { color: "primary.500", cursor: "pointer" } })))),
        React.createElement(Flex, null, amount)));
};
//# sourceMappingURL=TransactionInfo.js.map