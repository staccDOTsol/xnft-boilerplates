"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const react_1 = require("@chakra-ui/react");
const react_2 = __importDefault(require("react"));
const Notification = ({ type, heading, show, message, onDismiss, }) => (react_2.default.createElement(react_1.Alert, { w: "full", bgColor: "white", borderTop: "1px", borderTopColor: "gray.200", fontFamily: "body", color: "black", status: type },
    react_2.default.createElement(react_1.AlertIcon, null),
    react_2.default.createElement(react_1.Box, { flex: "1" },
        react_2.default.createElement(react_1.AlertTitle, null, heading),
        message && (react_2.default.createElement(react_1.AlertDescription, { display: "block" }, message))),
    react_2.default.createElement(react_1.CloseButton, { position: "absolute", right: "8px", top: "8px", color: "gray.400", _hover: { color: "gray.600", cursor: "pointer" }, onClick: onDismiss })));
exports.Notification = Notification;
//# sourceMappingURL=Notification.js.map