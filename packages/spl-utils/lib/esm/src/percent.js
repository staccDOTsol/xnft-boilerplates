export const percent = (p) => {
    if (typeof p !== "undefined" && p != null) {
        return Math.floor((p / 100) * 4294967295); // unit32 max value
    }
};
//# sourceMappingURL=percent.js.map