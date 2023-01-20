export const getFeesPerSignature = async (connection) => {
    const feeCalculator = await connection.getFeeCalculatorForBlockhash((await connection.getRecentBlockhash()).blockhash);
    return feeCalculator.value?.lamportsPerSignature;
};
//# sourceMappingURL=fees.js.map