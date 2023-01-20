"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrataProviders = void 0;
const react_1 = __importDefault(require("react"));
const accountContext_1 = require("../contexts/accountContext");
const errorHandlerContext_1 = require("../contexts/errorHandlerContext");
const providerContext_1 = require("../contexts/providerContext");
const strataSdkContext_1 = require("../contexts/strataSdkContext");
const theme_1 = require("../contexts/theme");
const defaultOnError = (error) => console.log(error);
const StrataProviders = ({ children, onError = defaultOnError, resetCSS = false, }) => (react_1.default.createElement(theme_1.ThemeProvider, { resetCSS: resetCSS },
    react_1.default.createElement(errorHandlerContext_1.ErrorHandlerProvider, { onError: onError },
        react_1.default.createElement(providerContext_1.ProviderContextProvider, null,
            react_1.default.createElement(accountContext_1.AccountProvider, { commitment: "confirmed" },
                react_1.default.createElement(strataSdkContext_1.StrataSdksProvider, null, children))))));
exports.StrataProviders = StrataProviders;
//# sourceMappingURL=StrataProviders.js.map