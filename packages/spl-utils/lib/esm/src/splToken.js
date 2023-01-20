// Copied from https://github.com/project-serum/serum-ts/blob/master/packages/common/src/index.ts
// This package hasn't had it's dependencies updated in a year and so explodes with newer versions of web3js
// Better to just cut the dependency
import { AccountLayout, MintLayout, Token, TOKEN_PROGRAM_ID, u64, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
export async function createMint(provider, authority, decimals, mintKeypair) {
    if (authority === undefined) {
        authority = provider.wallet.publicKey;
    }
    if (mintKeypair === undefined) {
        mintKeypair = Keypair.generate();
    }
    const instructions = await createMintInstructions(provider, authority, mintKeypair.publicKey, decimals);
    const tx = new Transaction();
    tx.add(...instructions);
    await provider.sendAndConfirm(tx, [mintKeypair], {});
    return mintKeypair.publicKey;
}
export async function createMintInstructions(provider, authority, mint, decimals, freezeAuthority) {
    let instructions = [
        SystemProgram.createAccount({
            fromPubkey: provider.wallet.publicKey,
            newAccountPubkey: mint,
            space: 82,
            lamports: await provider.connection.getMinimumBalanceForRentExemption(82),
            programId: TOKEN_PROGRAM_ID,
        }),
        Token.createInitMintInstruction(TOKEN_PROGRAM_ID, mint, decimals ?? 0, authority, freezeAuthority || null),
    ];
    return instructions;
}
export async function getMintInfo(provider, addr) {
    let depositorAccInfo = await provider.connection.getAccountInfo(addr);
    if (depositorAccInfo === null) {
        throw new Error("Failed to find token account");
    }
    return parseMintAccount(depositorAccInfo.data);
}
export async function createAtaAndMint(provider, mint, amount, to = provider.wallet.publicKey, authority = provider.wallet.publicKey, payer = provider.wallet.publicKey, confirmOptions = undefined) {
    const ata = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, to);
    const mintTx = new Transaction({ feePayer: payer });
    if (!(await provider.connection.getAccountInfo(ata))) {
        mintTx.add(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, ata, to, payer));
    }
    mintTx.add(Token.createMintToInstruction(TOKEN_PROGRAM_ID, mint, ata, authority, [], amount));
    await provider.sendAndConfirm(mintTx, undefined, confirmOptions);
    return ata;
}
export function parseMintAccount(data) {
    const m = MintLayout.decode(data);
    m.mintAuthority = new PublicKey(m.mintAuthority);
    m.supply = u64.fromBuffer(m.supply);
    m.isInitialized = m.state !== 0;
    return m;
}
export async function getTokenAccount(provider, addr) {
    let depositorAccInfo = await provider.connection.getAccountInfo(addr);
    if (depositorAccInfo === null) {
        throw new Error("Failed to find token account");
    }
    return parseTokenAccount(depositorAccInfo.data);
}
export function parseTokenAccount(data) {
    const accountInfo = AccountLayout.decode(data);
    accountInfo.mint = new PublicKey(accountInfo.mint);
    accountInfo.owner = new PublicKey(accountInfo.owner);
    accountInfo.amount = u64.fromBuffer(accountInfo.amount);
    if (accountInfo.delegateOption === 0) {
        accountInfo.delegate = null;
        // eslint-disable-next-line new-cap
        accountInfo.delegatedAmount = new u64(0);
    }
    else {
        accountInfo.delegate = new PublicKey(accountInfo.delegate);
        accountInfo.delegatedAmount = u64.fromBuffer(accountInfo.delegatedAmount);
    }
    accountInfo.isInitialized = accountInfo.state !== 0;
    accountInfo.isFrozen = accountInfo.state === 2;
    if (accountInfo.isNativeOption === 1) {
        accountInfo.rentExemptReserve = u64.fromBuffer(accountInfo.isNative);
        accountInfo.isNative = true;
    }
    else {
        accountInfo.rentExemptReserve = null;
        accountInfo.isNative = false;
    }
    if (accountInfo.closeAuthorityOption === 0) {
        accountInfo.closeAuthority = null;
    }
    else {
        accountInfo.closeAuthority = new PublicKey(accountInfo.closeAuthority);
    }
    return accountInfo;
}
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//# sourceMappingURL=splToken.js.map