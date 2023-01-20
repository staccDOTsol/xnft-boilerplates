"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HolaplexGraphqlProvider = void 0;
const client_1 = require("@apollo/client");
const react_1 = __importDefault(require("react"));
const client = new client_1.ApolloClient({
    uri: "https://graph.holaplex.com/v1",
    cache: new client_1.InMemoryCache({
        resultCaching: false,
    }),
});
const HolaplexGraphqlProvider = ({ children, }) => {
    //@ts-ignore
    return react_1.default.createElement(client_1.ApolloProvider, { client: client }, children);
};
exports.HolaplexGraphqlProvider = HolaplexGraphqlProvider;
//# sourceMappingURL=HolaplexGraphqlProvider.js.map