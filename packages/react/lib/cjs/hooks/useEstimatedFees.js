"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEstimatedFees = void 0;
const useFees_1 = require("./useFees");
const useRentExemptAmount_1 = require("./useRentExemptAmount");
const useEstimatedFees = (size, signatures) => {
    const { loading, error, amount: fees } = (0, useFees_1.useFees)(signatures);
    const { loading: rentLoading, error: rentError, amount: rent, } = (0, useRentExemptAmount_1.useRentExemptAmount)(size);
    return {
        amount: fees && rent ? fees + rent : undefined,
        error: error || rentError,
        loading: loading || rentLoading,
    };
};
exports.useEstimatedFees = useEstimatedFees;
//# sourceMappingURL=useEstimatedFees.js.map