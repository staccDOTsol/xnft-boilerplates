import React from "react";
import { StrataSdksContext, } from "../contexts/strataSdkContext";
/**
 * Get all of the Strata sdks for use in react functions
 * @returns
 */
export function useStrataSdks() {
    const context = React.useContext(StrataSdksContext);
    if (context === undefined) {
        throw new Error("useStrataSdks must be used within StrataProgramsProvider");
    }
    return context;
}
//# sourceMappingURL=useStrataSdks.js.map