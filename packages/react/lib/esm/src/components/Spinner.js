import React from "react";
import { Flex, Spinner as ChakraSpinner } from "@chakra-ui/react";
export const Spinner = ({ size = "lg", thickness = "2px", emptyColor = "gray.400", color = "gray.700", speed = "0.65s", ...props }) => (React.createElement(Flex, { w: "full", h: "full", alignItems: "center", justifyContent: "center" },
    React.createElement(ChakraSpinner, { size: size, thickness: thickness, emptyColor: emptyColor, color: color, speed: speed, ...props })));
//# sourceMappingURL=Spinner.js.map