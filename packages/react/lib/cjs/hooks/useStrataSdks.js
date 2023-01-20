"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStrataSdks = void 0;
const react_1 = __importDefault(require("react"));
const strataSdkContext_1 = require("../contexts/strataSdkContext");
/**
 * Get all of the Strata sdks for use in react functions
 * @returns
 */
function useStrataSdks() {
    const context = react_1.default.useContext(strataSdkContext_1.StrataSdksContext);
    if (context === undefined) {
        throw new Error("useStrataSdks must be used within StrataProgramsProvider");
    }
    return context;
}
exports.useStrataSdks = useStrataSdks;
//# sourceMappingURL=useStrataSdks.js.map