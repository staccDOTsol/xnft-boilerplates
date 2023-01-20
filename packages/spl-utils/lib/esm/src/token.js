import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
export async function getAssociatedAccountBalance(connection, account, mint) {
    const ata = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, account, true);
    return (await connection.getTokenAccountBalance(ata)).value;
}
//# sourceMappingURL=token.js.map