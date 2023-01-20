"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_1 = require("buffer");
if (typeof window !== "undefined") {
    //@ts-ignore
    window.Buffer = buffer_1.Buffer;
}
else {
    global.Buffer = buffer_1.Buffer;
}
//# sourceMappingURL=bufferFill.js.map