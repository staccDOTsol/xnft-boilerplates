"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spinner = void 0;
const react_1 = __importDefault(require("react"));
const react_2 = require("@chakra-ui/react");
const Spinner = (_a) => {
    var { size = "lg", thickness = "2px", emptyColor = "gray.400", color = "gray.700", speed = "0.65s" } = _a, props = __rest(_a, ["size", "thickness", "emptyColor", "color", "speed"]);
    return (react_1.default.createElement(react_2.Flex, { w: "full", h: "full", alignItems: "center", justifyContent: "center" },
        react_1.default.createElement(react_2.Spinner, Object.assign({ size: size, thickness: thickness, emptyColor: emptyColor, color: color, speed: speed }, props))));
};
exports.Spinner = Spinner;
//# sourceMappingURL=Spinner.js.map