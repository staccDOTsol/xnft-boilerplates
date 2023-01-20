import { getHashedName, getNameAccountKey, NameRegistryState, ReverseTwitterRegistryState, } from "@solana/spl-name-service";
import { useConnection } from "wallet-adapter-react-xnft";
import { useAccount } from "./useAccount";
import { getOwnerForName } from "./tokenRef";
import { useAccountFetchCache } from "./useAccountFetchCache";
import { deserialize } from "borsh";
import { useAsync } from "react-async-hook";
export async function reverseNameLookup(connection, owner, verifier, tld) {
    const hashedName = await getHashedName(owner.toString());
    const key = await getNameAccountKey(hashedName, verifier, tld);
    const reverseAccount = await connection.getAccountInfo(key);
    if (!reverseAccount) {
        throw new Error("Invalid reverse account provided");
    }
    return deserialize(ReverseTwitterRegistryState.schema, ReverseTwitterRegistryState, reverseAccount.data.slice(NameRegistryState.HEADER_LEN));
}
async function getNameString(connection, owner, verifier, tld) {
    if (!owner) {
        return;
    }
    return (await reverseNameLookup(connection, owner, verifier, tld))
        .twitterHandle;
}
async function getHashedNameNullable(owner) {
    if (!owner) {
        return undefined;
    }
    return getHashedName(owner.toString());
}
async function getNameAccountKeyNullable(hashedName, verifier, tld) {
    if (!hashedName) {
        return undefined;
    }
    return getNameAccountKey(hashedName, verifier, tld);
}
export function useReverseName(owner, verifier, tld) {
    const { connection } = useConnection();
    const { result: hashedName, error: nameError, loading: loading1, } = useAsync(getHashedNameNullable, [owner]);
    const { result: key, error: keyError, loading: loading2, } = useAsync(getNameAccountKeyNullable, [hashedName, verifier, tld]);
    const { info: reverseAccount } = useAccount(key, (key, acct) => {
        return deserialize(ReverseTwitterRegistryState.schema, ReverseTwitterRegistryState, acct.data.slice(NameRegistryState.HEADER_LEN));
    });
    return {
        loading: loading1 || loading2,
        error: nameError || keyError,
        // @ts-ignore
        nameString: reverseAccount?.twitterHandle,
    };
}
export function useNameOwner(nameString, tld) {
    const cache = useAccountFetchCache();
    const { loading, error, result: owner, } = useAsync(getOwnerForName, [cache || undefined, nameString, tld]);
    return {
        loading,
        error,
        owner,
    };
}
//# sourceMappingURL=nameService.js.map