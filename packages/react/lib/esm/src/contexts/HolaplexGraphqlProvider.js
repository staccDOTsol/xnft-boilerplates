import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import React from "react";
const client = new ApolloClient({
    uri: "https://graph.holaplex.com/v1",
    cache: new InMemoryCache({
        resultCaching: false,
    }),
});
export const HolaplexGraphqlProvider = ({ children, }) => {
    //@ts-ignore
    return React.createElement(ApolloProvider, { client: client }, children);
};
//# sourceMappingURL=HolaplexGraphqlProvider.js.map