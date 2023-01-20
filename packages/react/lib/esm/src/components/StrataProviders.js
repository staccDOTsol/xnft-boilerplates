import React from "react";
import { AccountProvider } from "../contexts/accountContext";
import { ErrorHandlerProvider } from "../contexts/errorHandlerContext";
import { ProviderContextProvider } from "../contexts/providerContext";
import { StrataSdksProvider } from "../contexts/strataSdkContext";
import { ThemeProvider } from "../contexts/theme";
const defaultOnError = (error) => console.log(error);
export const StrataProviders = ({ children, onError = defaultOnError, resetCSS = false, }) => (React.createElement(ThemeProvider, { resetCSS: resetCSS },
    React.createElement(ErrorHandlerProvider, { onError: onError },
        React.createElement(ProviderContextProvider, null,
            React.createElement(AccountProvider, { commitment: "confirmed" },
                React.createElement(StrataSdksProvider, null, children))))));
//# sourceMappingURL=StrataProviders.js.map