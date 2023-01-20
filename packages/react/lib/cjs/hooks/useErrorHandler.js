"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useErrorHandler = void 0;
const react_1 = require("react");
const errorHandlerContext_1 = require("../contexts/errorHandlerContext");
const useErrorHandler = () => {
    const context = (0, react_1.useContext)(errorHandlerContext_1.ErrorHandlerContext);
    if (context === undefined) {
        throw new Error("useErrorHandler must be used within ErrorHandlerProvider");
    }
    return context;
};
exports.useErrorHandler = useErrorHandler;
//# sourceMappingURL=useErrorHandler.js.map