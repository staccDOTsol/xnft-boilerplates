"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphqlProvider = void 0;
const client_1 = require("@apollo/client");
const react_1 = __importDefault(require("react"));
const holaplex = new client_1.HttpLink({
    uri: "https://graph.holaplex.com/v1",
});
const vybe = new client_1.HttpLink({
    uri: "https://api.vybenetwork.com/v1/graphql",
});
const strata = new client_1.HttpLink({
    uri: "https://prod-api.teamwumbo.com/graphql",
});
const VYBE_TOKEN = process.env.NEXT_PUBLIC_VYBE_TOKEN || process.env.REACT_APP_VYBE_TOKEN;
const client = new client_1.ApolloClient({
    cache: new client_1.InMemoryCache({
        resultCaching: false,
    }),
    link: client_1.ApolloLink.concat(new client_1.ApolloLink((operation, forward) => {
        // add the authorization to the headers
        const token = VYBE_TOKEN;
        operation.setContext({
            headers: {
                authorization: token ? token : "",
            },
        });
        return forward(operation);
    }), client_1.ApolloLink.split((operation) => operation.getContext().clientName === "vybe", vybe, //if above
    client_1.ApolloLink.split((operation) => operation.getContext().clientName === "strata", strata, holaplex))),
});
const GraphqlProvider = ({ children, }) => {
    // @ts-ignore
    return react_1.default.createElement(client_1.ApolloProvider, { client: client }, children);
};
exports.GraphqlProvider = GraphqlProvider;
//# sourceMappingURL=GraphqlProvider.js.map