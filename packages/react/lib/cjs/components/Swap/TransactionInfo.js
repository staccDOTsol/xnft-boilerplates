"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionInfo = void 0;
const react_1 = require("@chakra-ui/react");
const react_2 = __importDefault(require("react"));
const ri_1 = require("react-icons/ri");
const TransactionInfo = ({ name, tooltip, amount, formRef, }) => {
    return (react_2.default.createElement(react_1.Flex, { justify: "space-between", alignItems: "center" },
        react_2.default.createElement(react_1.HStack, null,
            react_2.default.createElement(react_1.Text, null, name),
            react_2.default.createElement(react_1.Tooltip, { placement: "top", label: tooltip, portalProps: { containerRef: formRef } },
                react_2.default.createElement(react_1.Flex, null,
                    react_2.default.createElement(react_1.Icon, { w: 5, h: 5, as: ri_1.RiInformationLine, _hover: { color: "primary.500", cursor: "pointer" } })))),
        react_2.default.createElement(react_1.Flex, null, amount)));
};
exports.TransactionInfo = TransactionInfo;
//# sourceMappingURL=TransactionInfo.js.map