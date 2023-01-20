import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, CloseButton, } from "@chakra-ui/react";
import React from "react";
export const Notification = ({ type, heading, show, message, onDismiss, }) => (React.createElement(Alert, { w: "full", bgColor: "white", borderTop: "1px", borderTopColor: "gray.200", fontFamily: "body", color: "black", status: type },
    React.createElement(AlertIcon, null),
    React.createElement(Box, { flex: "1" },
        React.createElement(AlertTitle, null, heading),
        message && (React.createElement(AlertDescription, { display: "block" }, message))),
    React.createElement(CloseButton, { position: "absolute", right: "8px", top: "8px", color: "gray.400", _hover: { color: "gray.600", cursor: "pointer" }, onClick: onDismiss })));
//# sourceMappingURL=Notification.js.map